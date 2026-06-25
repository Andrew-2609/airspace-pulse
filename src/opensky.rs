use serde::Deserialize;

use crate::model::{Aircraft, AircraftCategory, Position};

#[derive(Debug, Deserialize)]
pub struct OpenSkyResponse {
    pub states: Option<Vec<Vec<serde_json::Value>>>,
}

pub async fn fetch() -> anyhow::Result<Vec<Aircraft>> {
    let url = "https://opensky-network.org/api/states/all\
        ?lamin=-33.8694284\
        &lamax=5.2695808\
        &lomin=-73.9830625\
        &lomax=-28.6289646\
        &extended=1";

    let response = reqwest::get(url).await?;

    let body = response.json::<OpenSkyResponse>().await?;

    let result = body
        .states
        .unwrap_or_default()
        .into_iter()
        .filter_map(|row| {
            let position: Position = Position {
                lon: row.get(5)?.as_f64()?,
                lat: row.get(6)?.as_f64()?,
            };

            let category: AircraftCategory = row
                .get(17)
                .and_then(|v| v.as_u64())
                .map(AircraftCategory::from)
                .unwrap_or(AircraftCategory::NoInfo);

            Some(Aircraft {
                icao24: row.get(0)?.as_str()?.to_string(),
                callsign: row
                    .get(1)
                    .and_then(|v| v.as_str())
                    .map(str::trim)
                    .map(String::from),
                position: position,
                on_ground: row.get(8)?.as_bool()?,
                category: category,
            })
        })
        .collect();

    Ok(result)
}
