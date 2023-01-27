use anyhow::Context;
use axum::response::IntoResponse;
use axum::{extract::rejection::JsonRejection, Extension, Json};
use idlib::AuthorizeCookie;
use rusqlite::{params, OptionalExtension, ToSql};
use serde::{Deserialize, Serialize};
use serde_rusqlite::from_row;
use utoipa::ToSchema;

use std::sync::Arc;

use crate::error::Error;
use crate::util::non_empty_trimmed_str;
use crate::AppState;

/// Logs in to the site by redirecting to hiveID.
#[utoipa::path(
    get,
    path = "/api/account/login",
    responses(
        (status = 200, description = "Already signed in"),
        (status = 302, description = "Redirects to hiveID if not authenticated"),
    )
)]
pub async fn get_login(
    AuthorizeCookie(_payload, maybe_token, ..): AuthorizeCookie<idlib::NoGroups>,
) -> impl IntoResponse {
    maybe_token.wrap(|| {})
}

/// Account fields that can be adjusted.
#[derive(Debug, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    /// An image that can be used to present the user in the UI.
    #[schema(example = "https://example.com/avatar.png")]
    pub profile_picture: Option<String>,

    /// A text that can be displayed on the users profile to make it more personal.
    #[schema(example = "Welcome to my profile")]
    pub bio: Option<String>,

    /// A quote the user wants to attach to their profile for whatever reason, this would probably
    /// only be shown on the profile page.
    pub highlighted_quote_id: Option<i64>,

    /// The theme of the colors for the UI, this setting is private and can't be seen by other
    /// users.
    #[schema(example = "light-theme")]
    pub color_theme: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DbSettings {
    pub profile_picture: Option<String>,
    pub bio: Option<String>,
    pub highlighted_quote_id: Option<i64>,
    pub color_theme: String,
}

impl From<DbSettings> for Settings {
    fn from(settings: DbSettings) -> Self {
        Self {
            profile_picture: settings.profile_picture,
            bio: settings.bio,
            highlighted_quote_id: settings.highlighted_quote_id,
            color_theme: settings.color_theme,
        }
    }
}

/// Gets all settings of the current account
#[utoipa::path(
    get,
    path = "/api/account/settings",
    responses(
        (status = 200, description = "The settings and set values", body = Settings),
        (status = 302, description = "Redirects to hiveID if not authenticated"),
    )
)]
pub async fn get_settings(
    AuthorizeCookie(payload, maybe_token, ..): AuthorizeCookie<idlib::NoGroups>,
    Extension(state): Extension<Arc<AppState>>,
) -> impl IntoResponse {
    maybe_token
        .wrap_future(async move {
            let username = payload.name;
            let result = state
                .db
                .call(move |conn| {
                    conn.query_row(
                        "SELECT
                            profile_picture, \
                            bio, \
                            highlighted_quote_id, \
                            color_theme \
                        FROM users WHERE username = ?1",
                        params![username],
                        |row| Ok(from_row::<DbSettings>(row).unwrap()),
                    )
                    .optional()
                })
                .await
                .context("Failed to query settings")?;

            if let Some(db_settings) = result {
                Ok(Json(Settings::from(db_settings)))
            } else {
                Err(Error::NotFound)
            }
        })
        .await
}

#[derive(Debug, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct PutSettings {
    /// An image that can be used to present the user in the UI.
    /// # Note
    /// The input is trimmed and empty inputs are not updated.
    #[schema(example = "https://example.com/avatar.png")]
    #[serde(default, deserialize_with = "non_empty_trimmed_str")]
    pub profile_picture: Option<String>,

    /// A text that can be displayed on the users profile to make it more personal.
    /// # Note
    /// The input is trimmed and empty inputs are not updated.
    #[schema(example = "Welcome to my profile")]
    #[serde(default, deserialize_with = "non_empty_trimmed_str")]
    pub bio: Option<String>,

    /// A quote the user wants to attach to their profile for whatever reason. The request will
    /// fail if this is not a valid quote id.
    /// # Note
    /// Empty inputs are not updated.
    pub highlighted_quote_id: Option<i64>,

    /// The theme of the colors for the UI, this setting is private and can't be seen by other
    /// users.
    /// # Note
    /// The input is trimmed and empty inputs are not updated.
    #[schema(example = "light-theme")]
    #[serde(default, deserialize_with = "non_empty_trimmed_str")]
    pub color_theme: Option<String>,
}

/// Update settings for the current account, missing or null values are not updated.
#[utoipa::path(
    put,
    path = "/api/account/settings",
    request_body = PutSettings,
    responses(
        (status = 200, description = "The settings were successfully updated"),
        (status = 400, description = "One of the values sent in is invalid"),
        (status = 302, description = "Redirects to hiveID if not authenticated"),
    )
)]
pub async fn put_settings(
    AuthorizeCookie(payload, maybe_token, ..): AuthorizeCookie<idlib::NoGroups>,
    Extension(state): Extension<Arc<AppState>>,
    request: Result<Json<PutSettings>, JsonRejection>,
) -> impl IntoResponse {
    maybe_token
        .wrap_future(async move {
            let Json(request) = request?;
            let username = payload.name;

            let update_str = request.update_str();
            if !update_str.is_empty() {
                if let Err(rusqlite::Error::SqliteFailure(e, _)) = state
                    .db
                    .call(move |conn| {
                        let mut params = request.update_params();
                        params.push(Box::new(username));
                        conn.query_row(
                            &format!("UPDATE users SET {update_str} WHERE username = ?"),
                            rusqlite::params_from_iter(params.iter()),
                            |_| Ok(()),
                        )
                        .optional()
                    })
                    .await
                {
                    match e.code {
                        rusqlite::ErrorCode::ConstraintViolation => {
                            return Err(Error::InvalidQuoteId);
                        }
                        _ => panic!(),
                    }
                }
            }

            Ok::<_, Error>(())
        })
        .await
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PutPassword {
    pub old: String,
    pub new: String,
}

impl PutSettings {
    fn update_str(&self) -> String {
        let mut result = Vec::new();

        if self.profile_picture.is_some() {
            result.push("profile_picture = ?")
        }

        if self.bio.is_some() {
            result.push("bio = ?")
        }

        if self.highlighted_quote_id.is_some() {
            result.push("highlighted_quote_id = ?")
        }

        if self.color_theme.is_some() {
            result.push("color_theme = ?")
        }

        result.join(", ")
    }

    fn update_params(mut self) -> Vec<Box<dyn ToSql>> {
        let mut params: Vec<Box<dyn ToSql>> = Vec::new();

        if let Some(profile_picture) = self.profile_picture.take() {
            params.push(Box::new(profile_picture));
        }

        if let Some(bio) = self.bio.take() {
            params.push(Box::new(bio));
        }

        if let Some(highlighted_quote_id) = self.highlighted_quote_id.take() {
            params.push(Box::new(highlighted_quote_id));
        }

        if let Some(color_theme) = self.color_theme.take() {
            params.push(Box::new(color_theme));
        }

        params
    }
}
