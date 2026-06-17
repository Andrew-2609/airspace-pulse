use serde::Deserialize;

use crate::model::Aircraft;

#[derive(Debug, Deserialize)]
pub struct OpenSkyResponse {
    pub states: Option<Vec<Vec<serde_json::Value>>>,
}

pub async fn fetch() -> anyhow::Result<Vec<Aircraft>> {
    let url = "https://opensky-network.org/api/states/all\
        ?lamin=-7.85\
        &lamax=-2.75\
        &lomin=-41.42\
        &lomax=-37.25";

    let response = reqwest::get(url).await?;

    let body = response.json::<OpenSkyResponse>().await?;

    let mut result = body
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
            })
        })
        .collect::<Vec<_>>();

    result.sort_by(|a, b| a.icao24.cmp(&b.icao24));

    Ok(result)
}
