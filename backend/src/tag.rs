use axum::extract::rejection::JsonRejection;
use axum::response::IntoResponse;
use idlib::{AuthorizeCookie, Either, Has};

use anyhow::Context;
use axum::{extract::Path, Extension, Json};
use rusqlite::{params, Connection, OptionalExtension, ToSql};
use serde::{Deserialize, Serialize};
use serde_rusqlite::from_row;
use utoipa::ToSchema;

use std::sync::Arc;

use crate::error::Error;
use crate::util::non_empty_trimmed_str;
use crate::AppState;

/// Tags can be used to categorize quotes and allows for more extensive filtering provided that
/// quotes are well tagged.
#[derive(Debug, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct Tag {
    /// A unique identifier for the tag, this should never change for a tag.
    pub id: i64,

    /// A short handle for users to quickly understand what the tag is for.
    #[schema(example = "implied")]
    pub name: String,

    /// A description that can be used for further explanations in case the name is unclear or to
    /// go into more details on how it should be used.
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

/// Get a list of all tags.
#[utoipa::path(
    get,
    path = "/api/tag",
    responses(
        (status = 200, description = "All tags are returned.", body = [Tag]),
        (status = 302, description = "Redirects to hiveID if not authenticated."),
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

/// Get a tag by its id.
#[utoipa::path(
    get,
    path = "/api/tag/{id}",
    responses(
        (status = 200, description = "The tag with the matching id is returned.", body = Tag),
        (status = 404, description = "No tag with that id exists."),
        (status = 302, description = "Redirects to hiveID if not authenticated."),
    ),
    params(
        ("id" = i64, Path, description = "ID of the tag to query."),
    ),
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
    let tag = conn
        .query_row(
            "SELECT
                id,
                name,
                description
            FROM tags
            WHERE id = $1",
            params![id],
            |row| Ok(Tag::from(from_row::<DbTag>(row).unwrap())),
        )
        .optional()
        .context("Failed to query tags")?
        .ok_or(Error::NotFound)?;

    Ok(tag)
}

/// Tags can be used to categorize quotes and allows for more extensive filtering provided that
/// quotes are well tagged.
#[derive(Debug, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct PostTag {
    /// A short handle for users to quickly understand what the tag is for.
    #[schema(example = "implied")]
    pub name: String,

    /// A description that can be used for further explanations in case the name is unclear or to
    /// go into more details on how it should be used.
    #[schema(
        example = "This quote was not actually said, the author thought it was implied and made this quote up."
    )]
    pub description: Option<String>,
}

/// Create tag from the body.
#[utoipa::path(
    post,
    path = "/api/tag",
    request_body = PostTag,
    responses(
        (status = 200, description = "The tag was successfully created."),
        (status = 400, description = "One of the values sent in is invalid."),
        (status = 302, description = "Redirects to hiveID if not authenticated."),
    )
)]
pub async fn post_tag(
    AuthorizeCookie(_payload, maybe_token, ..): AuthorizeCookie<idlib::NoGroups>,
    Extension(state): Extension<Arc<AppState>>,
    request: Result<Json<PostTag>, JsonRejection>,
) -> impl IntoResponse {
    maybe_token
        .wrap_future(async move {
            let Json(request) = request?;

            if request.name.is_empty() {
                return Err(Error::EmptyField("name"));
            }

            let name = request.name.clone();
            let tag_exists = state
                .db
                .call(move |conn| {
                    conn.query_row(
                        "SELECT 1
                        FROM tags
                        WHERE name = $1",
                        params![name],
                        |row| Ok(Tag::from(from_row::<DbTag>(row).unwrap())),
                    )
                    .optional()
                })
                .await
                .context("Failed to get tag by name")?;

            if tag_exists.is_some() {
                return Err(Error::TagExists);
            }

            state
                .db
                .call(move |conn| {
                    conn.execute(
                        &format!(
                            "INSERT INTO tags (name, description)
                            VALUES ($1, $2)"
                        ),
                        params![&request.name, &request.description],
                    )
                    .optional()
                })
                .await
                .context("Failed to insert tag")?;

            Ok::<_, Error>(())
        })
        .await
}

/// A list of fields that can be updated by anyone with the required permissions. To leave fields
/// as they are they can be skipped, set to null or set to a whitespace only string.
/// # Note
/// Requires `delete-tags` or `moderator` permission.
#[derive(Debug, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct PutTag {
    /// A short handle for users to quickly understand what the tag is for. This should only be
    /// updated to fix typos or formatting, changing a name completely would be very confusing for
    /// users. For this reason updating quotes requires additional permissions.
    /// # Note
    /// The input is trimmed and empty inputs are not updated.
    #[schema(example = "implied")]
    #[serde(default, deserialize_with = "non_empty_trimmed_str")]
    pub name: Option<String>,

    /// A description that can be used for further explanations in case the name is unclear or to
    /// go into more details on how it should be used.
    /// # Note
    /// The input is trimmed and empty inputs are not updated.
    #[schema(
        example = "This quote was not actually said, the author thought it was implied and made it up."
    )]
    #[serde(default, deserialize_with = "non_empty_trimmed_str")]
    pub description: Option<String>,
}

type HasEditTags = Either<Has<"edit-tags">, Has<"moderator">>;

/// Update tag fields for the specified tag id, missing or null values are not updated.
/// # Note
/// Requires `edit-tags` or `moderator` permission.
#[utoipa::path(
    put,
    path = "/api/tag/{id}",
    request_body = PutTag,
    responses(
        (status = 200, description = "The tag was successfully updated."),
        (status = 400, description = "One of the values sent in is invalid."),
        (status = 403, description = "User does not have the required permissions."),
        (status = 302, description = "Redirects to hiveID if not authenticated."),
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

            let tag_exists = state
                .db
                .call(move |conn| {
                    conn.query_row(
                        "SELECT 1 FROM tags
                        WHERE id = ?",
                        params![&id],
                        |row| Ok(from_row::<i64>(row).unwrap()),
                    )
                })
                .await
                .optional()
                .context("Failed to check if tag exists")?;

            if tag_exists.is_none() {
                return Err(Error::NotFound);
            }

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

type HasDeleteTags = Either<Has<"delete-tags">, Has<"moderator">>;

/// Delete tag by its id.
/// # Note
/// Requires `delete-tags` or `moderator` permission.
#[utoipa::path(
    delete,
    path = "/api/tag/{id}",
    responses(
        (status = 200, description = "The tag was successfully deleted."),
        (status = 404, description = "Tag with the specified ID does not exist."),
        (status = 403, description = "User does not have the required permissions."),
        (status = 302, description = "Redirects to hiveID if not authenticated."),
    ),
    params(
        ("id" = i64, Path, description = "ID of the tag to delete."),
    )
)]
pub async fn delete_tag_by_id(
    Path(id): Path<i64>,
    AuthorizeCookie(_payload, maybe_token, ..): AuthorizeCookie<HasDeleteTags>,
    Extension(state): Extension<Arc<AppState>>,
) -> impl IntoResponse {
    maybe_token
        .wrap_future(async move {
            state
                .db
                .call(move |conn| {
                    conn.query_row(
                        &format!("DELETE FROM tags WHERE id = ?"),
                        params![id],
                        |_| Ok(()),
                    )
                    .optional()
                })
                .await
                .context("Failed to delete tag.")?;

            Ok::<_, Error>(())
        })
        .await
}
