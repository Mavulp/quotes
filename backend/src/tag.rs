use axum::extract::rejection::JsonRejection;
use axum::response::IntoResponse;
use idlib::{AuthorizeCookie, Has};

use anyhow::Context;
use axum::{extract::Path, Extension, Json};
use rusqlite::{params, Connection, OptionalExtension, ToSql};
use serde::{Deserialize, Serialize};
use serde_rusqlite::from_row;
use utoipa::ToSchema;

use std::sync::Arc;

use crate::error::Error;
use crate::util::non_empty_str;
use crate::AppState;

#[derive(Debug, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct Tag {
    pub id: i64,
    #[schema(example = "implied")]
    pub name: String,
    #[schema(
        example = "This quote was not actually said, the author thought it was implied and made this quote up."
    )]
    pub description: Option<String>,
}

#[derive(Deserialize, Debug, PartialEq)]
struct DbTag {
    id: i64,
    name: String,
    description: Option<String>,
}

impl From<DbTag> for Tag {
    fn from(tag: DbTag) -> Self {
        Self {
            id: tag.id,
            name: tag.name,
            description: tag.description,
        }
    }
}

/// Get a list of all tags
#[utoipa::path(
    get,
    path = "/api/tag",
    responses(
        (status = 200, description = "All tags are returned", body = [Tag]),
    )
)]
pub async fn get_tags(
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

pub fn get_all(conn: &Connection) -> Result<Vec<Tag>, Error> {
    let mut stmt = conn
        .prepare(
            "SELECT
                id,
                name,
                description
            FROM tags",
        )
        .context("Failed to prepare statement for tags query")?;

    let tags = stmt
        .query_map(params![], |row| {
            Ok(Tag::from(from_row::<DbTag>(row).unwrap()))
        })
        .context("Failed to query tags")?
        .collect::<Result<Vec<_>, _>>()
        .context("Failed to collect tags")?;

    Ok(tags)
}

/// Get a tag by its id
#[utoipa::path(
    get,
    path = "/api/tag/{id}",
    responses(
        (status = 200, description = "The tag with the matching id is returned", body = Tag),
    ),
    params(
        ("id" = i64, Path, description = "Id of the tag to query"),
    )
)]
pub async fn get_tag_by_id(
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

pub fn get_by_id(conn: &Connection, id: i64) -> Result<Tag, Error> {
    let mut stmt = conn
        .prepare(
            "SELECT
                id,
                name,
                description
            FROM tags
            WHERE id = $1",
        )
        .context("Failed to prepare statement for tags query")?;

    let tag = stmt
        .query_row(params![id], |row| {
            Ok(Tag::from(from_row::<DbTag>(row).unwrap()))
        })
        .optional()
        .context("Failed to query tags")?
        .ok_or(Error::NotFound)?;

    Ok(tag)
}

#[derive(Debug, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct PutTag {
    #[schema(example = "implied")]
    #[serde(default, deserialize_with = "non_empty_str")]
    pub name: Option<String>,
    #[schema(
        example = "This quote was not actually said, the author thought it was implied and made this quote up."
    )]
    #[serde(default, deserialize_with = "non_empty_str")]
    pub description: Option<String>,
}

type HasEditTags = Has<"quotes_edit_tags">;

/// Update tag fields for the specified tag id, missing or null values are not updated.
/// # Note
/// Requires `quotes_edit_tags` permission.
#[utoipa::path(
    put,
    path = "/api/tag/{id}",
    request_body = PutTag,
    responses(
        (status = 200, description = "The tag was successfully updated"),
        (status = 400, description = "One of the values sent in is invalid"),
        (status = 403, description = "User does not have quotes_edit_tags permission"),
    ),
    params(
        ("id" = i64, Path, description = "Id of the tag to update"),
    )
)]
pub async fn put_tag_by_id(
    Path(id): Path<i64>,
    AuthorizeCookie(_payload, maybe_token, ..): AuthorizeCookie<HasEditTags>,
    Extension(state): Extension<Arc<AppState>>,
    request: Result<Json<PutTag>, JsonRejection>,
) -> impl IntoResponse {
    maybe_token
        .wrap_future(async move {
            let Json(request) = request?;

            let update_str = request.update_str();
            if !update_str.is_empty() {
                state
                    .db
                    .call(move |conn| {
                        let mut params = request.update_params();
                        params.push(Box::new(id));
                        conn.query_row(
                            &format!("UPDATE tags SET {update_str} WHERE id = ?"),
                            rusqlite::params_from_iter(params.iter()),
                            |_| Ok(()),
                        )
                        .optional()
                    })
                    .await
                    .context("Failed to update tag fields")?;
            }

            Ok::<_, Error>(())
        })
        .await
}

impl PutTag {
    fn update_str(&self) -> String {
        let mut result = Vec::new();

        if self.name.is_some() {
            result.push("name = ?")
        }

        if self.description.is_some() {
            result.push("description = ?")
        }

        result.join(", ")
    }

    fn update_params(mut self) -> Vec<Box<dyn ToSql>> {
        let mut params: Vec<Box<dyn ToSql>> = Vec::new();

        if let Some(name) = self.name.take() {
            params.push(Box::new(name))
        }

        if let Some(description) = self.description.take() {
            params.push(Box::new(description))
        }

        params
    }
}