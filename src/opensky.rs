use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct OpenSkyResponse {
    pub states: Option<Vec<Vec<serde_json::Value>>>,
}

pub async fn fetch() -> anyhow::Result<OpenSkyResponse> {
    let url = "https://opensky-network.org/api/states/all\
        ?lamin=-4.2\
        &lamax=-3.5\
        &lomin=-38.9\
        &lomax=-38.2";

    let response = reqwest::get(url).await?;

    let body = response.json::<OpenSkyResponse>().await?;

    Ok(body)
}
