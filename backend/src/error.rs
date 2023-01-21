use axum::{
    extract::rejection::JsonRejection,
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;
use tracing::error;

#[derive(Debug, Error)]
pub enum Error {
    #[error("Not Found")]
    NotFound,

    #[error("Unathorized")]
    Unathorized,

    #[error("{field} should not be longer than {maximum_length} characters")]
    TooManyCharacters {
        field: &'static str,
        maximum_length: u64,
    },

    #[error("The supplied quote id does not exist")]
    InvalidQuoteId,

    #[error("A quote needs to have at least one quote fragment")]
    MissingQuoteFragments,

    #[error("One of the quote fragments is empty")]
    EmptyFragmentContent,

    #[error("One of the quotees is empty")]
    EmptyFragmentQuotee,

    #[error("One of the tags is empty")]
    EmptyTag,

    #[error("Invalid argument(s): {0}")]
    InvalidArguments(anyhow::Error),

    #[error("Internal Server Error")]
    InternalError(#[from] anyhow::Error),

    #[error("{0}")]
    JsonRejection(#[from] JsonRejection),
}

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        let status = match &self {
            Error::Unathorized => StatusCode::UNAUTHORIZED,
            Error::NotFound => StatusCode::NOT_FOUND,
            Error::InternalError(e) => {
                let err = e
                    .chain()
                    .skip(1)
                    .fold(e.to_string(), |acc, cause| format!("{}: {}\n", acc, cause));
                error!("API encountered error: {}", err);

                StatusCode::INTERNAL_SERVER_ERROR
            }
            Error::TooManyCharacters { .. }
            | Error::JsonRejection(_)
            | Error::InvalidQuoteId
            | Error::EmptyFragmentContent
            | Error::EmptyFragmentQuotee
            | Error::EmptyTag
            | Error::MissingQuoteFragments
            | Error::InvalidArguments(_) => StatusCode::BAD_REQUEST,
        };

        let message = if let Error::JsonRejection(rej) = self {
            use std::error::Error;
            match rej {
                JsonRejection::JsonDataError(e) => e.source().unwrap().to_string(),
                JsonRejection::JsonSyntaxError(e) => e.source().unwrap().to_string(),
                _ => rej.to_string(),
            }
        } else {
            self.to_string()
        };

        let body = Json(json!({
            "message": message,
        }));
        (status, body).into_response()
    }
}
