use serde::Deserialize;

#[derive(Clone, Deserialize)]
pub struct Aircraft {
    pub icao24: String,
    pub callsign: Option<String>,
    pub latitude: f64,
    pub longitude: f64,
}
