use axum::{
    http::StatusCode,
    routing::{get, post, put, Router},
    Extension,
};
use futures::FutureExt;
use idlib::{AuthCallback, IdpClient, SecretKey, Variables};
use rusqlite_migration::{Migrations, M};
use tower_http::{cors::CorsLayer, trace::TraceLayer};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use std::path::Path;
use std::sync::Arc;

pub mod util;

pub mod account;
pub mod error;
pub mod quote;
pub mod test;
pub mod user;

// https://i.imgur.com/kiv5f8T.png
// https://i.imgur.com/YRbmT7n.png
// https://i.imgur.com/Kpg4vKT.png

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
        test::get_permitted,
        test::get_forbidden,
        user::get_users,
        user::get_user_by_username,
        quote::get_quotes,
        quote::get_quote_by_id,
        quote::post_quote
    ),
    components(schemas(
        user::User,
        quote::Quote,
        quote::PostQuoteRequest,
        quote::Fragment,
        quote::FragmentType,
        account::Settings,
        account::PutSettingsRequest
    ))
)]
struct ApiDoc;

pub async fn api_route(db: tokio_rusqlite::Connection) -> anyhow::Result<Router> {
    let secret_key = SecretKey::from_env()?;
    let variables = Variables::from_env()?;

    let idp_client = IdpClient::default();

    let cdb = db.clone();
    let auth_callback = AuthCallback(Arc::new(Box::new(move |name| {
        crate::user::create_user_if_missing(cdb.clone(), name).boxed()
    })));

    Ok(Router::new()
        .merge(SwaggerUi::new("/swagger").url("/api-doc/openapi.json", ApiDoc::openapi()))
        .route("/api/health", get(health))
        .route("/api/test/permitted", get(test::get_permitted))
        .route("/api/test/forbidden", get(test::get_forbidden))
        .route("/api/account/settings", get(account::get_settings))
        .route("/api/account/settings", put(account::put_settings))
        .route("/api/account/login", get(account::get_login))
        .route("/api/user", get(user::get_users))
        .route("/api/user/:username", get(user::get_user_by_username))
        .route("/api/quote", get(quote::get_quotes))
        .route("/api/quote", post(quote::post_quote))
        .route("/api/quote/:id", get(quote::get_quote_by_id))
        // GET /quote/:quotee (allow multiple?)
        // GET /quote/:author
        // POST /quote
        // PUT /quote/:tag(?)
        // GET /tag
        // GET /comment/:quoteId
        // POST /comment
        // DEL /comment/:id
        .nest(
            "/api/auth",
            idlib::api_route(idp_client, Some(auth_callback)),
        )
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

    db.call(move |conn| {
        conn.pragma_update(None, "foreign_keys", &"OFF")?;
        migrations.to_latest(conn)?;
        conn.pragma_update(None, "foreign_keys", &"ON")?;

        Ok::<_, anyhow::Error>(())
    })
    .await?;

    Ok(db)
}