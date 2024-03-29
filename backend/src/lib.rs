use axum::{
    http::StatusCode,
    routing::{delete, get, post, put, Router},
    Extension,
};
use futures::FutureExt;
use idlib::{AuthCallback, IdpClient, SecretKey, Variables};
use rusqlite_migration::{Migrations, M};
use tower_http::{cors::CorsLayer, trace::TraceLayer};
use utoipa::{
    openapi::security::{ApiKey, ApiKeyValue, Http, HttpAuthScheme, SecurityScheme},
    Modify, OpenApi,
};
use utoipa_swagger_ui::SwaggerUi;

use std::path::Path;
use std::sync::Arc;

pub mod util;

mod account;
mod auth;
mod comment;
mod error;
mod quote;
pub mod stats;
mod tag;
mod user;

pub struct AppState {
    db: tokio_rusqlite::Connection,
}

#[derive(OpenApi)]
#[openapi(
    paths(
        account::get_login,
        account::get_settings,
        account::put_settings,
        health,
        user::get_users,
        user::get_user_by_username,
        quote::get_quotes,
        quote::get_quote_by_id,
        quote::post_quote,
        quote::put_quote_by_id,
        comment::get_comments,
        comment::post_comment,
        comment::delete_comment,
        tag::get_tags,
        tag::post_tag,
        tag::get_tag_by_id,
        tag::put_tag_by_id,
        tag::delete_tag_by_id,
        stats::get_quotee_stats,
        auth::_authorize_dummy,
        auth::_revoke_dummy,
        auth::_logout_dummy
    ),
    components(schemas(
        user::User,
        quote::Quote,
        quote::QuoteIndex,
        quote::PostQuote,
        quote::PutQuote,
        quote::Fragment,
        quote::FragmentType,
        comment::Comment,
        comment::PostComment,
        tag::Tag,
        tag::PostTag,
        tag::PutTag,
        account::Settings,
        account::PutSettings,
        stats::QuoteeStats,
        stats::Dataset,
    )),
    modifiers(&SecurityAddon),
    security(
        ("hiveid-jwt-cookie" = []),
        ("hiveid-jwt-header" = []),
    ),
)]
struct ApiDoc;

struct SecurityAddon;

impl Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        if let Some(components) = openapi.components.as_mut() {
            components.add_security_scheme(
                "hiveid-jwt-cookie",
                SecurityScheme::ApiKey(ApiKey::Cookie(ApiKeyValue::new("__auth"))),
            );
            components.add_security_scheme(
                "hiveid-jwt-header",
                SecurityScheme::Http(Http::new(HttpAuthScheme::Bearer)),
            );
        }
    }
}

pub async fn api_route(db: tokio_rusqlite::Connection) -> anyhow::Result<Router> {
    let secret_key = SecretKey::from_env()?;
    let variables = Variables::from_env()?;

    let cdb = db.clone();
    let auth_callback = AuthCallback(Arc::new(Box::new(move |name| {
        crate::user::create_user_if_missing(cdb.clone(), name).boxed()
    })));

    Ok(Router::new()
        .merge(SwaggerUi::new("/swagger").url("/api-doc/openapi.json", ApiDoc::openapi()))
        .route("/api/health", get(health))
        .route("/api/account/settings", get(account::get_settings))
        .route("/api/account/settings", put(account::put_settings))
        .route("/api/account/login", get(account::get_login))
        .route("/api/user", get(user::get_users))
        .route("/api/user/:username", get(user::get_user_by_username))
        .route("/api/quote", get(quote::get_quotes))
        .route("/api/quote", post(quote::post_quote))
        .route("/api/quote/:id", get(quote::get_quote_by_id))
        .route("/api/quote/:id", put(quote::put_quote_by_id))
        .route("/api/quote/:id/comment", get(comment::get_comments))
        .route("/api/quote/:id/comment", post(comment::post_comment))
        .route("/api/comment/:id", delete(comment::delete_comment))
        .route("/api/tag", get(tag::get_tags))
        .route("/api/tag", post(tag::post_tag))
        .route("/api/tag/:id", get(tag::get_tag_by_id))
        .route("/api/tag/:id", put(tag::put_tag_by_id))
        .route("/api/tag/:id", delete(tag::delete_tag_by_id))
        .route("/api/stats/quotee", get(stats::get_quotee_stats))
        .nest("/api/auth", idlib::api_route(Some(auth_callback)))
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
        .layer(Extension(Arc::new(AppState { db })))
        .layer(Extension(IdpClient::default()))
        .layer(Extension(secret_key))
        .layer(Extension(Arc::new(variables))))
}

/// Simple check to see if the service is still up.
#[utoipa::path(
    get,
    path = "/api/health",
    responses(
        (status = 200, description = "Service is up"),
    )
)]
async fn health() -> StatusCode {
    StatusCode::OK
}

pub(crate) const MIGRATIONS: [M; 1] = [M::up(include_str!("../migrations/001_initial.sql"))];

pub async fn setup_database(path: &Path) -> anyhow::Result<tokio_rusqlite::Connection> {
    let db = tokio_rusqlite::Connection::open(path).await?;

    let migrations = Migrations::new(MIGRATIONS.to_vec());

    db.call_unwrap(move |conn| {
        conn.pragma_update(None, "foreign_keys", &"OFF")?;
        migrations.to_latest(conn)?;
        conn.pragma_update(None, "foreign_keys", &"ON")?;

        Ok::<_, anyhow::Error>(())
    })
    .await?;

    Ok(db)
}
