use serde::{Serialize, ser::SerializeStruct};

use crate::model::Aircraft;

#[derive(Clone)]
pub enum AircraftEvent {
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
        }
    }
}

impl Serialize for AircraftEvent {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        match self {
            AircraftEvent::Entered(ac)
            | AircraftEvent::Left(ac)
            | AircraftEvent::Landed(ac)
            | AircraftEvent::TookOff(ac) => {
                let mut state = serializer.serialize_struct("AircraftEvent", 5)?;
                state.serialize_field("action", self.action())?;
                state.serialize_field("icao24", &ac.icao24)?;
                state.serialize_field("callsign", ac.callsign.as_deref().unwrap_or_default())?;
                state.serialize_field("latitude", &ac.latitude)?;
                state.serialize_field("longitude", &ac.longitude)?;
                state.end()
            }
        }
    }
}
