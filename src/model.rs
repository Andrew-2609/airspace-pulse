use serde::Serialize;

#[derive(Clone, Serialize)]
pub struct Aircraft {
    pub icao24: String,
    pub callsign: Option<String>,
    pub position: Position,
    pub on_ground: bool,
    pub category: AircraftCategory,
    pub address: Address,
}

#[derive(Clone, Serialize)]
pub struct Position {
    pub lat: f64,
    pub lon: f64,
}

#[derive(Clone)]
pub enum AircraftCategory {
    NoInfo,
    Light,
    Small,
    Large,
    Heavy,
    Rotorcraft,
    Glider,
    LighterThanAir,
    UnmannedAerialVehicle,
    Space,
    Emergency,
    Service,
    Unknown(u64),
}

impl From<u64> for AircraftCategory {
    fn from(value: u64) -> Self {
        match value {
            0 => Self::NoInfo,
            2 => Self::Light,
            3 => Self::Small,
            4 => Self::Large,
            6 => Self::Heavy,
            8 => Self::Rotorcraft,
            9 => Self::Glider,
            10 => Self::LighterThanAir,
            14 => Self::UnmannedAerialVehicle,
            15 => Self::Space,
            16 => Self::Emergency,
            17 => Self::Service,
            other => Self::Unknown(other),
        }
    }
}

impl Serialize for AircraftCategory {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        match self {
            Self::NoInfo => serializer.serialize_str("noInfo"),
            Self::Light => serializer.serialize_str("light"),
            Self::Small => serializer.serialize_str("small"),
            Self::Large => serializer.serialize_str("large"),
            Self::Heavy => serializer.serialize_str("heavy"),
            Self::Rotorcraft => serializer.serialize_str("rotorcraft"),
            Self::Glider => serializer.serialize_str("glider"),
            Self::LighterThanAir => serializer.serialize_str("lighterThanAir"),
            Self::UnmannedAerialVehicle => serializer.serialize_str("unmannedAerialVehicle"),
            Self::Space => serializer.serialize_str("space"),
            Self::Emergency => serializer.serialize_str("emergency"),
            Self::Service => serializer.serialize_str("service"),
            Self::Unknown(other) => serializer.serialize_str(format!("unknown{}", other).as_str()),
        }
    }
}

#[derive(Clone, Eq, PartialEq, Serialize)]
pub struct Address {
    pub city: String,
    pub state: String,
    pub country: String,
}
