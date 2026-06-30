use serde::{Serialize, ser::SerializeStruct};

use crate::model::Aircraft;

#[derive(Clone)]
pub enum AircraftEvent {
    Present(Aircraft),
    Entered(Aircraft),
    Left(Aircraft),
    Landed(Aircraft),
    TookOff(Aircraft),
}

impl AircraftEvent {
    fn action(&self) -> &str {
        match self {
            Self::Entered(_) => "entered",
            Self::Left(_) => "left",
            Self::Landed(_) => "landed",
            Self::TookOff(_) => "took_off",
            Self::Present(_) => "present",
        }
    }
}

impl Serialize for AircraftEvent {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        match self {
            Self::Present(ac)
            | Self::Entered(ac)
            | Self::Left(ac)
            | Self::Landed(ac)
            | Self::TookOff(ac) => {
                // Important: increase the state len if new fields are added
                let mut state = serializer.serialize_struct("AircraftEvent", 7)?;
                state.serialize_field("action", self.action())?;
                state.serialize_field("icao24", &ac.icao24)?;
                state.serialize_field("callsign", ac.callsign.as_deref().unwrap_or_default())?;
                state.serialize_field("latitude", &ac.position.lat)?;
                state.serialize_field("longitude", &ac.position.lon)?;
                state.serialize_field("category", &ac.category)?;
                state.serialize_field("on_ground", &ac.on_ground)?;
                state.end()
            }
        }
    }
}
