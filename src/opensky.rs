use serde::Deserialize;

use crate::model::{Aircraft, AircraftCategory};

#[derive(Debug, Deserialize)]
pub struct OpenSkyResponse {
    pub states: Option<Vec<Vec<serde_json::Value>>>,
}

pub async fn fetch() -> anyhow::Result<Vec<Aircraft>> {
    let url = "https://opensky-network.org/api/states/all\
        ?lamin=-4.2\
        &lamax=-3.5\
        &lomin=-38.9\
        &lomax=-38.2\
        &extended=1";

    let response = reqwest::get(url).await?;

    let body = response.json::<OpenSkyResponse>().await?;

    let result = body
        .states
        .unwrap_or_default()
        .into_iter()
        .filter_map(|row| {
            Some(Aircraft {
                icao24: row.get(0)?.as_str()?.to_string(),
                callsign: row
                    .get(1)
                    .and_then(|v| v.as_str())
                    .map(str::trim)
                    .map(String::from),
                longitude: row.get(5)?.as_f64()?,
                latitude: row.get(6)?.as_f64()?,
                on_ground: row.get(8)?.as_bool()?,

                category: row
                    .get(17)
                    .and_then(|v| v.as_u64())
                    .map(AircraftCategory::from)
                    .unwrap_or(AircraftCategory::NoInfo),
            })
        })
        .collect();

    Ok(result)
}
