use axum::extract::rejection::JsonRejection;
use axum::response::IntoResponse;
use idlib::AuthorizeCookie;

use anyhow::Context;
use axum::{extract::Path, Extension, Json};
use rusqlite::{params, Connection, OptionalExtension};
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
struct DbQuote {
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
            .context("Failed to query quote fragments")?
            .collect::<Result<Vec<_>, _>>()
            .context("Failed to collect quote fragments")?;

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
                .call(move |conn| get_all(conn).map(|u| Json(u)))
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
            FROM quotes",
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
                .call(move |conn| get_by_id(conn, id).map(|u| Json(u)))
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
                .call(move |conn| insert_quote(conn, quote, &payload.name).map(|u| Json(u)))
                .await
        })
        .await
}

pub fn insert_quote(conn: &mut Connection, quote: PostQuote, author: &str) -> Result<i64, Error> {
    if quote.fragments.is_empty() {
        return Err(Error::EmptyField("fragments"));
    }

    let created_at = SystemTime::UNIX_EPOCH.elapsed().unwrap().as_secs();

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
            params![author, quote.offensive, created_at],
            |row| Ok(from_row::<i64>(row).unwrap()),
        )
        .context("Failed to insert quote")?;

    let mut inserted_index_users = Vec::new();
    for (idx, fragment) in quote.fragments.iter().enumerate() {
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

            tx.execute(
                "INSERT INTO user_quote_index (
                    idx,
                    quotee,
                    quote_id
                ) VALUES ($1, $2, $3)",
                to_params((max_idx + 1, &fragment.quotee, quote_id)).unwrap(),
            )
            .context("Failed to insert quote index")?;

            inserted_index_users.push(&fragment.quotee);
        }
    }

    for tag in &quote.tags {
        let tag = tag.trim().to_owned();

        if tag.is_empty() {
            return Err(Error::EmptyArrayElement("tags"));
        }

        tx.execute(
            "INSERT OR IGNORE INTO tags (
                name
            ) VALUES (
                $1
            )",
            params![tag],
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
        .context("Failed to insert fragment")?;
    }

    tx.commit().context("Failed to commit transaction")?;

    Ok(quote_id)
}
