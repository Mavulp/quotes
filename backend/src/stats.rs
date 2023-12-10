use axum::response::IntoResponse;
use idlib::AuthorizeCookie;

use anyhow::Context;
use axum::{Extension, Json};
use rusqlite::{params, Connection};
use serde::Serialize;
use serde_rusqlite::from_row;
use time::{format_description, OffsetDateTime};
use unicase::UniCase;
use utoipa::ToSchema;

use std::collections::HashMap;
use std::sync::Arc;

use crate::error::Error;
use crate::AppState;

/// This represents one line on a diagram which plots amount of quotes against time.
#[derive(Debug, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct QuoteeStats {
    /// The dates on which quotes were added, the same index in this array corresponds to the same
    /// index in the `data` fields within each dataset.
    #[schema(example = json!(["30-01-2023", "02-02-2023"]))]
    pub labels: Vec<String>,

    /// A list of datasets which can be visualized within the same diagram, each of these
    /// represents one user.
    pub datasets: Vec<Dataset>,
}

/// This represents one line on a diagram which plots amount of quotes against time.
#[derive(Debug, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct Dataset {
    /// The username of the quotee this dataset is for.
    #[schema(example = "Alice")]
    label: String,

    /// The amount of quotes the quotee has currently.
    #[schema(example = 5)]
    total: i64,

    /// The count of quotes the user had at the end of the day listed in the `labels` field of
    /// `QuoteeStats`. In the example there were no quotes on the first day listed, and 5 on the
    /// the second.
    #[schema(example = json!([null, 5]))]
    data: Vec<Option<i64>>,
}

/// Get the data required for a count of quotes by quotee and day diagram.
#[utoipa::path(
    get,
    path = "/api/stats/quotee",
    responses(
        (status = 200, description = "Stats are returned", body = QuoteeStats),
        (status = 302, description = "Redirects to hiveID if not authenticated"),
    )
)]
pub async fn get_quotee_stats(
    AuthorizeCookie(_payload, maybe_token, ..): AuthorizeCookie<idlib::NoGroups>,
    Extension(state): Extension<Arc<AppState>>,
) -> impl IntoResponse {
    maybe_token
        .wrap_future(async move {
            state
                .db
                .call_unwrap(move |conn| quotee_stats(conn))
                .await
                .map(Json)
        })
        .await
}

pub fn quotee_stats(conn: &Connection) -> Result<QuoteeStats, Error> {
    let mut stmt = conn
        .prepare(
            "SELECT
                q.created_at,
                uqi.idx,
                uqi.quotee
            FROM user_quote_index uqi
            JOIN quotes q ON q.id = uqi.quote_id
            WHERE q.created_at != 0
            ORDER BY
                q.created_at ASC,
                uqi.quotee",
        )
        .context("Failed to prepare statement for quotee stats query")?;

    let indices = stmt
        .query_map(params![], |row| {
            Ok(from_row::<(i64, i64, String)>(row).unwrap())
        })
        .context("Failed to query quotee stats")?
        .map(|r| r.map(|(t, c, quotee)| (t, c, UniCase::from(quotee))))
        .collect::<Result<Vec<_>, _>>()
        .context("Failed to collect quotee stats")?;

    let mut timestamps = Vec::new();
    let quotees = quotees(conn)?;
    let mut count_map = HashMap::new();

    let date_format = format_description::parse("[day]/[month]/[year]").unwrap();

    let mut previous_date = None;
    for (timestamp, count, index_quotee) in indices {
        let time = OffsetDateTime::from_unix_timestamp(timestamp)
            .context("Failed to convert unix timestamp")?;

        if Some(time.to_calendar_date()) != previous_date {
            // New day started
            timestamps.push(
                time.format(&date_format)
                    .context("Failed to format timestamp")?,
            );
            for quotee in &quotees {
                let user_count = if quotee == &index_quotee {
                    Some(count)
                } else {
                    None
                };
                let user_counts: &mut Vec<_> = count_map.entry(quotee.clone()).or_default();
                user_counts.push(user_count);
            }
        } else {
            // Still the same day
            let counts: &mut Vec<_> = count_map
                .get_mut(&index_quotee)
                .expect("all users were inserted when a new day started");

            let last = counts
                .last_mut()
                .expect("counts contains an option already");

            *last = Some(count);
        }
        previous_date = Some(time.to_calendar_date());
    }

    let mut datasets = Vec::new();
    for (user, counts) in count_map {
        assert_eq!(timestamps.len(), counts.len());

        datasets.push(Dataset {
            label: user.into_inner(),
            total: counts.iter().max().copied().flatten().unwrap_or(0),
            data: counts,
        });
    }

    // Sort in reverse by doing b.cmp(a) instead of a.cmp(b)
    datasets.sort_unstable_by(|a, b| b.total.cmp(&a.total));

    Ok::<_, Error>(QuoteeStats {
        labels: timestamps,
        datasets,
    })
}

fn quotees(conn: &Connection) -> Result<Vec<UniCase<String>>, Error> {
    let mut stmt = conn
        .prepare(
            "SELECT DISTINCT quotee
            FROM user_quote_index uqi
            JOIN quotes q ON q.id = uqi.quote_id
            WHERE q.created_at != 0",
        )
        .context("Failed to prepare statement for quotees query")?;

    let quotees = stmt
        .query_map(params![], |row| Ok(from_row::<String>(row).unwrap()))
        .context("Failed to query quotees")?
        .map(|r| r.map(|quotee| UniCase::from(quotee)))
        .collect::<Result<Vec<_>, _>>()
        .context("Failed to collect quotees")?;

    Ok(quotees)
}
