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

//    idx INTEGER PRIMARY KEY NOT NULL,
//    quote_id INTEGER NOT NULL,
//    "type" INTEGER NOT NULL,
//    content TEXT NOT NULL,
//    quotee TEXT NOT NULL COLLATE NOCASE,
//    highlight INTEGER NOT NULL, -- bool - what does this do?
//
//    CONSTRAINT fk_quote_id_assoc
//        FOREIGN KEY (quote_id)
//        REFERENCES quotes (id)
//        ON DELETE CASCADE,
//
//    CONSTRAINT fk_type_assoc
//        FOREIGN KEY ("type")
//        REFERENCES quote_fragment_types (id)

#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct Quote {
    pub id: i64,
    #[schema(example = "Alice")]
    pub author: String,
    pub offensive: bool,
    pub fragments: Vec<Fragment>,
    #[schema(example = json!(["fake", "implied"]))]
    pub tags: Vec<String>,
    #[schema(example = "#fishstick")]
    pub location: Option<String>,
    #[schema(example = 1670802822)]
    pub created_at: u64,
}

#[derive(Debug, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct PostQuote {
    pub offensive: bool,
    pub fragments: Vec<Fragment>,
    #[schema(example = json!(["fake", "implied"]))]
    pub tags: Vec<String>,
    #[schema(example = "#fishstick")]
    pub location: Option<String>,
}

#[derive(Deserialize, Debug, PartialEq)]
struct DbQuote {
    id: i64,
    author: String,
    offensive: bool,
    location: Option<String>,
    created_at: u64,
}

impl From<DbQuote> for Quote {
    fn from(quote: DbQuote) -> Self {
        Self {
            id: quote.id,
            author: quote.author,
            offensive: quote.offensive,
            fragments: Vec::new(),
            tags: Vec::new(),
            location: quote.location,
            created_at: quote.created_at,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct Fragment {
    #[serde(rename = "type")]
    pub typ: FragmentType,
    #[schema(example = "I love eating green potatoes!")]
    pub content: String,
    #[schema(example = "Bob")]
    pub quotee: String,
}

#[derive(Debug, Deserialize)]
pub struct DbFragment {
    #[serde(rename = "type")]
    typ: FragmentType,
    content: String,
    quotee: String,
}

impl From<DbFragment> for Fragment {
    fn from(fragment: DbFragment) -> Self {
        Self {
            typ: fragment.typ,
            content: fragment.content,
            quotee: fragment.quotee,
        }
    }
}

#[derive(Debug, Serialize, ToSchema, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum FragmentType {
    Highlight,
    Context,
    Image,
    ImageHighlight,
}

/// Get a list of all quotes
#[utoipa::path(
    get,
    path = "/api/quote",
    responses(
        (status = 200, description = "All quotes are returned", body = [Quote]),
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
            "SELECT \
                id, \
                author, \
                offensive, \
                created_at, \
                location \
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
        let mut stmt = conn
            .prepare(
                "SELECT \
                    qft.name as type, \
                    content, \
                    quotee \
                FROM quote_fragments qf \
                JOIN quote_fragment_types qft ON qft.id = qf.type \
                WHERE quote_id = $1 \
                ORDER BY idx",
            )
            .context("Failed to prepare statement for quote fragments query")?;

        let fragments = stmt
            .query_map(params![quote.id], |row| {
                Ok(Fragment::from(from_row::<DbFragment>(row).unwrap()))
            })
            .context("Failed to query quote fragments")?
            .collect::<Result<Vec<_>, _>>()
            .context("Failed to collect quote fragments")?;

        quote.fragments = fragments;

        let mut stmt = conn
            .prepare(
                "SELECT \
                    tags.name \
                FROM tags \
                JOIN quote_tag_associations qta ON qta.tag_id = tags.id \
                WHERE qta.quote_id = $1",
            )
            .context("Failed to prepare statement for quote fragments query")?;

        let tags = stmt
            .query_map(
                params![quote.id],
                |row| Ok(from_row::<String>(row).unwrap()),
            )
            .context("Failed to query quote tags")?
            .collect::<Result<Vec<_>, _>>()
            .context("Failed to collect quote tags")?;

        quote.tags = tags;
    }

    Ok(quotes)
}

/// Get a quote by its id
#[utoipa::path(
    get,
    path = "/api/quote/{id}",
    responses(
        (status = 200, description = "The quote with the matching id is returned", body = Quote),
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
    let mut stmt = conn
        .prepare(
            "SELECT \
                id, \
                author, \
                offensive, \
                created_at, \
                location \
            FROM quotes \
            WHERE id = $1",
        )
        .context("Failed to prepare statement for quotes query")?;

    let mut quote = stmt
        .query_row(params![id], |row| {
            Ok(Quote::from(from_row::<DbQuote>(row).unwrap()))
        })
        .optional()
        .context("Failed to query quotes")?
        .ok_or(Error::NotFound)?;

    let mut stmt = conn
        .prepare(
            "SELECT \
                    type, \
                    content, \
                    quotee \
                FROM quote_fragments \
                WHERE quote_id = $1 \
                ORDER BY idx",
        )
        .context("Failed to prepare statement for quote fragments query")?;

    let fragments = stmt
        .query_map(params![quote.id], |row| {
            Ok(Fragment::from(from_row::<DbFragment>(row).unwrap()))
        })
        .context("Failed to query quote fragments")?
        .collect::<Result<Vec<_>, _>>()
        .context("Failed to collect quote fragments")?;

    quote.fragments = fragments;

    let mut stmt = conn
        .prepare(
            "SELECT \
                    tags.name \
                FROM tags \
                JOIN quote_tag_associations qta ON qta.tag_id = tags.id \
                WHERE qta.quote_id = $1",
        )
        .context("Failed to prepare statement for quote fragments query")?;

    let tags = stmt
        .query_map(
            params![quote.id],
            |row| Ok(from_row::<String>(row).unwrap()),
        )
        .context("Failed to query quote tags")?
        .collect::<Result<Vec<_>, _>>()
        .context("Failed to collect quote tags")?;

    quote.tags = tags;

    Ok(quote)
}

/// Creates a quote from the request body
#[utoipa::path(
    post,
    path = "/api/quote",
    request_body = PostQuote,
    responses(
        (status = 200, description = "The quote was created"),
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

pub fn insert_quote(conn: &Connection, quote: PostQuote, author: &str) -> Result<(), Error> {
    if quote.fragments.is_empty() {
        return Err(Error::MissingQuoteFragments);
    }

    let created_at = SystemTime::UNIX_EPOCH.elapsed().unwrap().as_secs();
    let quote_id = conn
        .query_row(
            "INSERT INTO quotes ( \
                author, \
                offensive, \
                created_at, \
                location \
            ) VALUES ( \
                :author, \
                :offensive, \
                :created_at, \
                :location \
            )
            RETURNING id",
            params![author, quote.offensive, created_at, quote.location],
            |row| Ok(from_row::<i64>(row).unwrap()),
        )
        .context("Failed to insert quote")?;

    for (idx, fragment) in quote.fragments.iter().enumerate() {
        let type_id = conn
            .query_row(
                "SELECT id \
                FROM quote_fragment_types \
                WHERE name = $1",
                to_params(&fragment.typ).unwrap(),
                |row| Ok(from_row::<i64>(row).unwrap()),
            )
            .context("Failed to get fragment id")?;

        conn.execute(
            "INSERT INTO quote_fragments ( \
                quote_id, \
                idx, \
                type, \
                content, \
                quotee \
            ) VALUES ($1, $2, $3, $4, $5)",
            to_params((quote_id, idx, type_id, &fragment.content, &fragment.quotee)).unwrap(),
        )
        .context("Failed to insert fragment")?;
    }

    for tag in &quote.tags {
        conn.execute(
            "INSERT OR IGNORE INTO tags ( \
                name \
            ) VALUES ( \
                $1 \
            )",
            params![tag],
        )
        .context("Failed to insert tag")?;

        let tag_id = conn
            .query_row(
                "SELECT id \
                FROM tags \
                WHERE name = $1",
                params![tag],
                |row| Ok(from_row::<i64>(row).unwrap()),
            )
            .context("Failed to get tag id")?;

        conn.execute(
            "INSERT INTO quote_tag_associations ( \
                quote_id, \
                tag_id \
            ) VALUES ( \
                $1, \
                $2 \
            )",
            params![quote_id, tag_id],
        )
        .context("Failed to insert fragment")?;
    }

    Ok(())
}
