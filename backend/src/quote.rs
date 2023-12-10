use axum::extract::rejection::JsonRejection;
use axum::response::IntoResponse;
use idlib::AuthorizeCookie;

use anyhow::Context;
use axum::{extract::Path, Extension, Json};
use rusqlite::{params, Connection, OptionalExtension, Transaction};
use serde::{Deserialize, Serialize};
use serde_rusqlite::{from_row, to_params};
use utoipa::ToSchema;

use std::sync::Arc;
use std::time::SystemTime;

use crate::error::Error;
use crate::AppState;

/// The meat of the service, this is how quotes are presented to users.
#[derive(Debug, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct Quote {
    /// A unique identifier for the quote, this should never change for a quote.
    pub id: i64,

    /// The username of the account who created the quote.
    #[schema(example = "Alice")]
    pub author: String,

    /// Quote contains offensive content.
    pub offensive: bool,

    /// Quotees in the fragments and their index of this quote.
    pub indices: Vec<QuoteIndex>,

    /// The actual pieces that contain the content of the quote.
    pub fragments: Vec<Fragment>,

    /// Tags that can be used to categorize quotes and be filtered on. Use the `tag` API to get
    /// more detailed descriptions of these.
    #[schema(example = json!(["fake", "implied"]))]
    pub tags: Vec<String>,

    /// A unix timestamp of when this quote was created.
    #[schema(example = 1670802822)]
    pub created_at: u64,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct QuoteIndex {
    #[schema(example = "Bob")]
    pub quotee: String,
    #[schema(example = 1)]
    pub index: i64,
}

#[derive(Deserialize, Debug, PartialEq)]
pub struct DbQuote {
    id: i64,
    author: String,
    offensive: bool,
    created_at: u64,
}

impl From<DbQuote> for Quote {
    fn from(quote: DbQuote) -> Self {
        Self {
            id: quote.id,
            author: quote.author,
            offensive: quote.offensive,
            indices: Vec::new(),
            fragments: Vec::new(),
            tags: Vec::new(),
            created_at: quote.created_at,
        }
    }
}

impl Quote {
    fn fill_arrays(&mut self, conn: &Connection) -> Result<(), Error> {
        let mut stmt = conn
            .prepare(
                "SELECT
                    quotee,
                    idx as \"index\"
                FROM user_quote_index
                WHERE quote_id = $1",
            )
            .context("Failed to prepare statement for quote index query")?;

        let indices = stmt
            .query_map(params![self.id], |row| {
                Ok(QuoteIndex::from(from_row::<QuoteIndex>(row).unwrap()))
            })
            .context("Failed to query quote indices")?
            .collect::<Result<Vec<_>, _>>()
            .context("Failed to collect quote indices")?;

        self.indices = indices;

        let mut stmt = conn
            .prepare(
                "
                    SELECT
                        qft.name as type,
                        highlight,
                        content,
                        quotee
                    FROM quote_fragments qf
                    JOIN quote_fragment_types qft ON qft.id = qf.type
                    WHERE quote_id = $1
                    ORDER BY idx
                ",
            )
            .context("Failed to prepare statement for quote fragments query")?;

        let fragments = stmt
            .query_map(params![self.id], |row| {
                Ok(Fragment::from(from_row::<DbFragment>(row).unwrap()))
            })
            .context("Failed to query quote fragments")?
            .collect::<Result<Vec<_>, _>>()
            .context("Failed to collect quote fragments")?;

        self.fragments = fragments;

        let mut stmt = conn
            .prepare(
                "SELECT
                    tags.name
                FROM tags
                JOIN quote_tag_associations qta ON qta.tag_id = tags.id
                WHERE qta.quote_id = $1
            ",
            )
            .context("Failed to prepare statement for quote fragments query")?;

        let tags = stmt
            .query_map(params![self.id], |row| Ok(from_row::<String>(row).unwrap()))
            .context("Failed to query quote tags")?
            .collect::<Result<Vec<_>, _>>()
            .context("Failed to collect quote tags")?;

        self.tags = tags;

        Ok(())
    }
}

#[derive(Debug, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct PostQuote {
    pub offensive: bool,
    pub fragments: Vec<Fragment>,
    #[schema(example = json!(["fake", "implied"]))]
    pub tags: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct Fragment {
    #[serde(rename = "type")]
    pub typ: FragmentType,
    pub highlight: bool,
    #[schema(example = "I love eating green potatoes!")]
    pub content: String,
    #[schema(example = "Bob")]
    pub quotee: String,
}

#[derive(Debug, Deserialize)]
pub struct DbFragment {
    #[serde(rename = "type")]
    typ: FragmentType,
    highlight: bool,
    content: String,
    quotee: String,
}

impl From<DbFragment> for Fragment {
    fn from(fragment: DbFragment) -> Self {
        Self {
            typ: fragment.typ,
            highlight: fragment.highlight,
            content: fragment.content,
            quotee: fragment.quotee,
        }
    }
}

#[derive(Debug, Serialize, ToSchema, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum FragmentType {
    Text,
    Image,
}

/// Get a list of all quotes
#[utoipa::path(
    get,
    path = "/api/quote",
    responses(
        (status = 200, description = "All quotes are returned", body = [Quote]),
        (status = 302, description = "Redirects to hiveID if not authenticated"),
    )
)]
pub async fn get_quotes(
    AuthorizeCookie(_payload, maybe_token, ..): AuthorizeCookie<idlib::NoGroups>,
    Extension(state): Extension<Arc<AppState>>,
) -> impl IntoResponse {
    maybe_token
        .wrap_future(async move {
            state
                .db
                .call_unwrap(move |conn| get_all(conn).map(|u| Json(u)))
                .await
        })
        .await
}

pub fn get_all(conn: &Connection) -> Result<Vec<Quote>, Error> {
    let mut stmt = conn
        .prepare(
            "SELECT
                id,
                author,
                offensive,
                created_at
            FROM quotes
            ORDER BY created_at DESC",
        )
        .context("Failed to prepare statement for quotes query")?;

    let mut quotes = stmt
        .query_map(params![], |row| {
            Ok(Quote::from(from_row::<DbQuote>(row).unwrap()))
        })
        .context("Failed to query quotes")?
        .collect::<Result<Vec<_>, _>>()
        .context("Failed to collect quotes")?;

    for quote in &mut quotes {
        quote.fill_arrays(conn)?;
    }

    Ok(quotes)
}

/// Get a quote by its id
#[utoipa::path(
    get,
    path = "/api/quote/{id}",
    responses(
        (status = 200, description = "The quote with the matching id is returned", body = Quote),
        (status = 302, description = "Redirects to hiveID if not authenticated"),
    ),
    params(
        ("id" = i64, Path, description = "Id of the quote to query"),
    )
)]
pub async fn get_quote_by_id(
    Path(id): Path<i64>,
    AuthorizeCookie(_payload, maybe_token, ..): AuthorizeCookie<idlib::NoGroups>,
    Extension(state): Extension<Arc<AppState>>,
) -> impl IntoResponse {
    maybe_token
        .wrap_future(async move {
            state
                .db
                .call_unwrap(move |conn| get_by_id(conn, id).map(|u| Json(u)))
                .await
        })
        .await
}

pub fn get_by_id(conn: &Connection, id: i64) -> Result<Quote, Error> {
    let mut quote = conn
        .query_row(
            "SELECT
                id,
                author,
                offensive,
                created_at
            FROM quotes
            WHERE id = $1",
            params![id],
            |row| Ok(Quote::from(from_row::<DbQuote>(row).unwrap())),
        )
        .optional()
        .context("Failed to query quotes")?
        .ok_or(Error::NotFound)?;

    quote.fill_arrays(conn)?;

    Ok(quote)
}

/// Creates a quote from the request body.
#[utoipa::path(
    post,
    path = "/api/quote",
    request_body = PostQuote,
    responses(
        (status = 200, description = "The quote was created and its ID is returned.", body = i64),
        (status = 302, description = "Redirects to hiveID if not authenticated."),
    )
)]
pub async fn post_quote(
    AuthorizeCookie(payload, maybe_token, ..): AuthorizeCookie<idlib::NoGroups>,
    Extension(state): Extension<Arc<AppState>>,
    request: Result<Json<PostQuote>, JsonRejection>,
) -> impl IntoResponse {
    maybe_token
        .wrap_future(async move {
            let Json(quote) = request?;

            state
                .db
                .call_unwrap(move |conn| insert_quote(conn, quote, &payload.name).map(|u| Json(u)))
                .await
        })
        .await
}

pub fn insert_quote(conn: &mut Connection, quote: PostQuote, author: &str) -> Result<i64, Error> {
    if quote.fragments.is_empty() {
        return Err(Error::EmptyField("fragments"));
    }

    let now = SystemTime::UNIX_EPOCH.elapsed().unwrap().as_secs();

    let tx = conn.transaction().context("Failed to create transaction")?;

    let quote_id = tx
        .query_row(
            "INSERT INTO quotes (
                author,
                offensive,
                created_at
            ) VALUES (
                :author,
                :offensive,
                :created_at
            )
            RETURNING id",
            params![author, quote.offensive, now],
            |row| Ok(from_row::<i64>(row).unwrap()),
        )
        .context("Failed to insert quote")?;

    insert_fragments(quote_id, &quote.fragments, now, None, &tx)?;
    insert_tags(quote_id, &quote.tags, &author, now, &tx)?;

    tx.commit().context("Failed to commit transaction")?;

    Ok(quote_id)
}

/// A list of fields that can be updated by anyone with the required permissions.
/// # Note
/// To leave fields as they are skip them or set them to null.
#[derive(Debug, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct PutQuote {
    /// This should be set to true if the quote contains content that you may not want to see under
    /// certain circumstances like when showing off the website or when there is a chance that
    /// someone else would look at your screen.
    /// # Note
    /// Requires either `edit-quote-metadata` or `moderator` permissions.
    pub offensive: Option<bool>,

    /// The actual pieces that contain the content of the quote.
    /// Note
    /// This can only be edited by the author for 15 minutes after creating the quote.
    pub fragments: Option<Vec<Fragment>>,

    /// Tags that can be used to categorize quotes and be filtered on. Use the `tag` API to get
    /// more detailed descriptions of these.
    /// # Note
    /// Requires either `edit-quote-metadata` or `moderator` permissions.
    #[schema(example = json!(["fake", "implied"]))]
    pub tags: Option<Vec<String>>,
}

/// Update tag fields for the specified tag id, missing or null values are not updated.
/// # Note
/// The author can edit quotes for 15 minutes after creating them, `offensive` and `tags` can be
/// edited by anyone with the `edit-quote-metadata` or `moderator` permissions.
#[utoipa::path(
    put,
    path = "/api/quote/{id}",
    request_body = PutQuote,
    responses(
        (status = 200, description = "The quote was successfully updated."),
        (status = 400, description = "One of the values sent in is invalid."),
        (status = 403, description = "User does not have the required permissions."),
        (status = 302, description = "Redirects to hiveID if not authenticated."),
    ),
    params(
        ("id" = i64, Path, description = "ID of the quote to update"),
    )
)]
pub async fn put_quote_by_id(
    Path(id): Path<i64>,
    AuthorizeCookie(payload, maybe_token, ..): AuthorizeCookie<idlib::NoGroups>,
    Extension(state): Extension<Arc<AppState>>,
    request: Result<Json<PutQuote>, JsonRejection>,
) -> impl IntoResponse {
    maybe_token
        .wrap_future(async move {
            let Json(request) = request?;

            let (author, created) = state
                .db
                .call_unwrap(move |conn| {
                    conn.query_row(
                        "SELECT author, created_at
                        FROM quotes
                        WHERE id = ?",
                        params![&id],
                        |row| Ok(from_row::<(String, u64)>(row).unwrap()),
                    )
                })
                .await
                .optional()
                .context("Failed to get quote author and creation timestamp")?
                .ok_or(Error::NotFound)?;

            const SECS_PER_MINUTE: u64 = 60;
            let now = SystemTime::UNIX_EPOCH.elapsed().unwrap().as_secs();

            if payload.name != author {
                // Not author, check if changes are permitted.
                if request.fragments.is_some()
                    || (!payload
                        .groups
                        .contains(&String::from("edit-quote-metadata"))
                        && !payload.groups.contains(&String::from("moderator")))
                {
                    return Err(Error::Unathorized);
                }
                // Author, check if the quote was created within the last 15 minutes.
            } else if now - created > 15 * SECS_PER_MINUTE {
                return Err(Error::Unathorized);
            }

            state
                .db
                .call_unwrap(move |conn| {
                    let tx = conn.transaction().context("Failed to create transaction")?;

                    if let Some(offensive) = request.offensive {
                        tx.execute(
                            &format!("UPDATE quotes SET offensive = ? WHERE id = ?"),
                            params![offensive, id],
                        )
                        .optional()
                        .context("Failed to update offensive quote field")?;
                    }

                    if let Some(fragments) = request.fragments {
                        let previous_quotees = get_quotees_by_quote(id, &tx)
                            .context("Failed to get previous quotees")?;

                        tx.execute(
                            "DELETE FROM quote_fragments WHERE quote_id = ?",
                            params![id],
                        )
                        .context("Failed to delete old fragments")?;

                        insert_fragments(id, &fragments, created, Some(previous_quotees), &tx)
                            .context("Failed to insert new fragments")?;
                    }

                    if let Some(tags) = request.tags {
                        tx.execute(
                            "DELETE FROM quote_tag_associations WHERE quote_id = ?",
                            params![id],
                        )
                        .context("Failed to delete old tags")?;

                        insert_tags(id, &tags, &author, now, &tx)?;
                    }

                    tx.commit().context("Failed to commit transaction")?;

                    Ok::<_, Error>(())
                })
                .await?;

            Ok::<_, Error>(())
        })
        .await
}

fn insert_tags(
    quote_id: i64,
    tags: &[String],
    author: &str,
    now: u64,
    tx: &Transaction,
) -> Result<(), Error> {
    for tag in tags {
        if tag.is_empty() {
            return Err(Error::EmptyArrayElement("tags"));
        }

        tx.execute(
            "INSERT OR IGNORE INTO tags (
                name, author, created_at
            ) VALUES (
                $1, $2, $3
            )",
            params![tag, author, now],
        )
        .context("Failed to insert tag")?;

        let tag_id = tx
            .query_row(
                "SELECT id
                FROM tags
                WHERE name = $1",
                params![tag],
                |row| Ok(from_row::<i64>(row).unwrap()),
            )
            .context("Failed to get tag id")?;

        tx.execute(
            "INSERT INTO quote_tag_associations (
                quote_id,
                tag_id
            ) VALUES (
                $1,
                $2
            )",
            params![quote_id, tag_id],
        )
        .context("Failed to insert quote tag association")?;
    }

    Ok(())
}

fn get_quotees_by_quote(quote_id: i64, conn: &Connection) -> Result<Vec<String>, Error> {
    let mut stmt = conn
        .prepare(
            "SELECT DISTINCT quotee
            FROM quote_fragments
            WHERE quote_id = ?",
        )
        .context("Failed to prepare statement for quotees query")?;

    let quotees = stmt
        .query_map(
            params![quote_id],
            |row| Ok(from_row::<String>(row).unwrap()),
        )
        .context("Failed to query quotees")?
        .collect::<Result<Vec<_>, _>>()
        .context("Failed to collect quotees")?;

    Ok(quotees)
}

fn insert_fragments(
    quote_id: i64,
    fragments: &[Fragment],
    created_at: u64,
    previous_quotees: Option<Vec<String>>,
    tx: &Transaction,
) -> Result<(), Error> {
    let mut inserted_index_users = Vec::new();
    for (idx, fragment) in fragments.iter().enumerate() {
        if fragment.content.is_empty() {
            return Err(Error::EmptyArrayField {
                array: "fragments",
                field: "content",
            });
        }

        if fragment.quotee.is_empty() {
            return Err(Error::EmptyArrayField {
                array: "fragments",
                field: "quotee",
            });
        }

        let type_id = tx
            .query_row(
                "SELECT id
                FROM quote_fragment_types
                WHERE name = $1",
                to_params(&fragment.typ).unwrap(),
                |row| Ok(from_row::<i64>(row).unwrap()),
            )
            .context("Failed to get fragment id")?;

        tx.execute(
            "INSERT INTO quote_fragments (
                quote_id,
                idx,
                type,
                highlight,
                content,
                quotee
            ) VALUES ($1, $2, $3, $4, $5, $6)",
            to_params((
                quote_id,
                idx,
                type_id,
                &fragment.highlight,
                &fragment.content,
                &fragment.quotee,
            ))
            .unwrap(),
        )
        .context("Failed to insert fragment")?;

        if !inserted_index_users.contains(&&fragment.quotee) {
            // this is the first time we see this quotee since the beginning of this function.
            let max_idx = if let Some(previous_quotees) = &previous_quotees {
                // Since previous_quotees is set we have to update instead of just inserting.
                if !previous_quotees.contains(&fragment.quotee) {
                    // A new quotee has to be added to an already existing quote.
                    let max_old_idx = tx
                        .query_row(
                            "SELECT COALESCE(max(idx), 0)
                            FROM user_quote_index uqi
                            JOIN quotes q ON q.id = uqi.quote_id
                            WHERE quotee = $1
                                AND created_at <= ?",
                            params![fragment.quotee, created_at],
                            |row| Ok(from_row::<i64>(row).unwrap()),
                        )
                        .context("Failed to get current max quote index")?;

                    // Increase following indices by one.
                    add_to_newer_quote_indices(&fragment.quotee, max_old_idx, 1, tx)?;

                    Some(max_old_idx)
                } else {
                    // Index already existed for this quote
                    None
                }
            } else {
                // This is a new quote so we can just insert a new index.
                let max_idx = tx
                    .query_row(
                        "SELECT COALESCE(max(idx), 0)
                        FROM user_quote_index
                        WHERE
                            quotee = $1",
                        params![&fragment.quotee],
                        |row| Ok(from_row::<i64>(row).unwrap()),
                    )
                    .context("Failed to get current max quote index")?;

                Some(max_idx)
            };

            if let Some(idx) = max_idx {
                tx.execute(
                    "INSERT INTO user_quote_index (
                        idx,
                        quotee,
                        quote_id
                    ) VALUES ($1, $2, $3)",
                    to_params((idx + 1, &fragment.quotee, quote_id)).unwrap(),
                )
                .context("Failed to insert quote index")?;
            }

            inserted_index_users.push(&fragment.quotee);
        }
    }
    if let Some(previous_quotees) = previous_quotees {
        // At this point we have to delete old indices for quotees not in `inserted_index_users`
        // since those were removed in this update.
        for quotee in previous_quotees {
            if !inserted_index_users.contains(&&quotee) {
                let idx = tx
                    .query_row(
                        "DELETE FROM user_quote_index
                        WHERE quote_id = ?
                            AND quotee = ?
                        RETURNING idx",
                        params![quote_id, quotee],
                        |row| Ok(from_row::<i64>(row).unwrap()),
                    )
                    .context("Failed to delete old index")?;

                // Decrease following indices by one.
                add_to_newer_quote_indices(&quotee, idx, -1, tx)?;
            }
        }
    }

    Ok(())
}

fn add_to_newer_quote_indices(
    quotee: &str,
    starting_idx: i64,
    amount: i64,
    tx: &Transaction,
) -> Result<(), Error> {
    // SET idx = idx + $1
    // SET idx = (SELECT idx + 1 FROM user_quote_index WHERE idx >= ? AND quotee)
    tx.execute(
        "UPDATE user_quote_index
        SET idx = (SELECT idx + $1 FROM user_quote_index WHERE idx > $2 AND quotee = $3)
        WHERE
            idx > $2
            AND quotee = $3",
        params![amount, starting_idx, quotee],
    )
    .context("Failed to update quote index")?;

    Ok(())
}
