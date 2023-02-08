use std::{sync::Arc, time::SystemTime};

use anyhow::Context;
use axum::{
    extract::{rejection::JsonRejection, Path},
    response::IntoResponse,
    Extension, Json,
};
use idlib::AuthorizeCookie;
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use serde_rusqlite::from_row;
use utoipa::ToSchema;

use crate::{error::Error, AppState};

/// Comments show up under their respective quotes to allow critique or other commentary.
#[derive(Eq, PartialEq, Debug, Serialize, ToSchema)]
#[serde(rename_all(serialize = "camelCase"))]
pub struct Comment {
    /// A unique identifier for the comment, this should never change for a comment.
    pub id: i64,

    /// The username of the account who created the comment.
    #[schema(example = "Alice")]
    pub author: String,

    /// The id of the quote the comment belongs to.
    pub quote_id: i64,

    /// A unix timestamp of when this comment was created.
    #[schema(example = 1670802822)]
    pub created_at: u64,

    /// The content of the comment.
    #[schema(example = "I never said that!")]
    pub text: String,
}

#[derive(Deserialize, Debug, PartialEq)]
struct DbComment {
    id: i64,
    author: String,
    quote_id: i64,
    created_at: u64,
    text: String,
}

impl From<DbComment> for Comment {
    fn from(comment: DbComment) -> Self {
        Self {
            id: comment.id,
            author: comment.author,
            quote_id: comment.quote_id,
            created_at: comment.created_at,
            text: comment.text,
        }
    }
}

/// Get a tag by its id.
#[utoipa::path(
    get,
    path = "/api/quote/{id}/comment",
    responses(
        (status = 200, description = "The comments for the quote with the matching ID are returned", body = Comment),
        (status = 302, description = "Redirects to hiveID if not authenticated"),
    ),
    params(
        ("id" = i64, Path, description = "ID of the quote the comments belong to."),
    )
)]
pub async fn get_comments(
    Path(quote_id): Path<i64>,
    AuthorizeCookie(_payload, maybe_token, ..): AuthorizeCookie<idlib::NoGroups>,
    Extension(state): Extension<Arc<AppState>>,
) -> impl IntoResponse {
    maybe_token
        .wrap_future(async move {
            state
                .db
                .call(move |conn| get_all_by_quote_id(quote_id, conn).map(|u| Json(u)))
                .await
        })
        .await
}

pub fn get_all_by_quote_id(quote_id: i64, conn: &Connection) -> Result<Vec<Comment>, Error> {
    let mut stmt = conn
        .prepare(
            "SELECT
                id,
                author,
                quote_id,
                created_at,
                text
            FROM comments
            WHERE quote_id = $1",
        )
        .context("Failed to prepare statement for comments query")?;

    let comments = stmt
        .query_map(params![quote_id], |row| {
            Ok(Comment::from(from_row::<DbComment>(row).unwrap()))
        })
        .context("Failed to query comments")?
        .collect::<Result<Vec<_>, _>>()
        .context("Failed to collect comments")?;

    Ok(comments)
}

/// Used to create a comment on a quote.
#[derive(Debug, Deserialize, ToSchema)]
#[serde(rename_all(serialize = "camelCase"))]
pub struct PostComment {
    /// The content of the comment. Can't be empty and whitespace gets trimmed from the start and
    /// end.
    #[schema(example = "I never said that!")]
    pub text: String,
}

/// Creates a comment from the request body.
#[utoipa::path(
    post,
    path = "/api/quote/{id}/comment",
    request_body = PostComment,
    responses(
        (status = 200, description = "The comment was created"),
        (status = 403, description = "The request body was invalid"),
        (status = 302, description = "Redirects to hiveID if not authenticated"),
    ),
    params(
        ("id" = i64, Path, description = "ID of the quote the comment should be created on."),
    )
)]
pub(super) async fn post_comment(
    AuthorizeCookie(payload, maybe_token, ..): AuthorizeCookie<idlib::NoGroups>,
    Path(quote_id): Path<i64>,
    Extension(state): Extension<Arc<AppState>>,
    request: Result<Json<PostComment>, JsonRejection>,
) -> impl IntoResponse {
    maybe_token
        .wrap_future(async move {
            let Json(post_comment) = request?;
            let text = post_comment.text.trim().to_owned();
            if text.is_empty() {
                return Err(Error::EmptyField("text"));
            }

            let now = SystemTime::UNIX_EPOCH.elapsed().unwrap().as_secs();

            let quote_exists = state
                .db
                .call(move |conn| {
                    conn.query_row(
                        "SELECT 1 FROM quotes
                        WHERE id = ?",
                        params![&quote_id],
                        |row| Ok(from_row::<i64>(row).unwrap()),
                    )
                })
                .await
                .optional()
                .context("Failed to check if quote exists")?;

            if quote_exists.is_none() {
                return Err(Error::NotFound);
            }

            let author = payload.name.clone();
            let db_text = text.clone();
            let id = state
                .db
                .call(move |conn| {
                    conn.query_row(
                        "INSERT INTO comments (author, quote_id, created_at, text)
                        VALUES (?1, ?2, ?3, ?4)
                        RETURNING id",
                        params![&author, &quote_id, now, db_text],
                        |row| Ok(from_row::<i64>(row).unwrap()),
                    )
                })
                .await
                .context("Failed to insert comment")?;

            Ok(Json(Comment {
                id,
                text,
                author: payload.name,
                quote_id,
                created_at: now,
            }))
        })
        .await
}

/// Deletes a comment by id.
#[utoipa::path(
    delete,
    path = "/api/comment/{id}",
    responses(
        (status = 200, description = "The comment was deleted."),
        (status = 404, description = "Comment does not exist."),
        (status = 403, description = "Only the author can delete their comment."),
        (status = 302, description = "Redirects to hiveID if not authenticated."),
    ),
    params(
        ("id" = i64, Path, description = "ID of the comment that should be deleted."),
    )
)]
pub(super) async fn delete_comment(
    AuthorizeCookie(payload, maybe_token, ..): AuthorizeCookie<idlib::NoGroups>,
    Path(comment_id): Path<i64>,
    Extension(state): Extension<Arc<AppState>>,
) -> impl IntoResponse {
    maybe_token
        .wrap_future(async move {
            let author = state
                .db
                .call(move |conn| {
                    conn.query_row(
                        "SELECT author FROM comments
                        WHERE id = ?",
                        params![&comment_id],
                        |row| Ok(from_row::<String>(row).unwrap()),
                    )
                })
                .await
                .optional()
                .context("Failed to get comment author")?;

            if let Some(author) = author {
                if author != payload.name {
                    return Err(Error::Unathorized);
                }
            } else {
                return Err(Error::NotFound);
            }

            state
                .db
                .call(move |conn| {
                    conn.execute(
                        "DELETE FROM comments
                        WHERE id = ?",
                        params![&comment_id],
                    )
                })
                .await
                .context("Failed to delete comment")?;

            Ok(())
        })
        .await
}
