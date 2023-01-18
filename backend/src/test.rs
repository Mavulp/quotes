use axum::{response::IntoResponse, Json};
use idlib::{AuthorizeCookie, Has};

use crate::error::Error;

type HasTestPermitted = Has<"quotes_test_permitted">;
// Simple test for login and permissions
#[utoipa::path(
    get,
    path = "/api/test/permitted",
    responses(
        (status = 200, description = "User is permitted to access"),
        (status = 403, description = "User is not permitted to access"),
    )
)]
pub async fn get_permitted(
    AuthorizeCookie(payload, maybe_token, ..): AuthorizeCookie<HasTestPermitted>,
) -> impl IntoResponse {
    maybe_token
        .wrap_future(async move {
            let username = payload.name;

            Ok::<Json<serde_json::Value>, Error>(Json(serde_json::json!(format!(
                "Looks like you ({username}) have the quotes_test_permitted permission!"
            ))))
        })
        .await
}

type HasTestForbidden = Has<"quotes_test_forbidden">;
/// Simeple test for login and permissions
#[utoipa::path(
    get,
    path = "/api/test/forbidden",
    responses(
        (status = 200, description = "User is permitted to access"),
        (status = 403, description = "User is not permitted to access"),
    )
)]
pub async fn get_forbidden(
    AuthorizeCookie(payload, maybe_token, ..): AuthorizeCookie<HasTestForbidden>,
) -> impl IntoResponse {
    maybe_token
        .wrap_future(async move {
            let username = payload.name;

            Ok::<Json<serde_json::Value>, Error>(Json(serde_json::json!(format!(
                "Looks like you ({username}) have the quotes_test_forbidden permission!"
            ))))
        })
        .await
}
