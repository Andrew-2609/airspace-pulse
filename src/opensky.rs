use serde::Deserialize;

use crate::{
    GEOCODER,
    model::{Address, Aircraft, AircraftCategory, Position},
};

#[derive(Debug, Deserialize)]
pub struct OpenSkyResponse {
    pub states: Option<Vec<Vec<serde_json::Value>>>,
}

pub async fn fetch() -> anyhow::Result<Vec<Aircraft>> {
    let url = "https://opensky-network.org/api/states/all\
        ?lamin=-7.8579907\
        &lamax=-2.5828852\
        &lomin=-41.4235010\
        &lomax=-37.0784837\
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

            let address_result = GEOCODER.search((position.lat, position.lon));

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
                address: Address {
                    city: address_result.record.name.clone(),
                    state: address_result.record.admin1.clone(),
                    country: address_result.record.cc.clone(),
                },
            })
        })
        .collect();

    Ok(result)
}
