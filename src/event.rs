use serde::{Serialize, ser::SerializeStruct};

use crate::model::{Address, Aircraft};

#[derive(Clone)]
pub enum AircraftEvent {
    Present(Aircraft),
    Entered(Aircraft),
    Left(Aircraft),
    Landed(Aircraft),
    TookOff(Aircraft),
    ChangedAddress(Aircraft, Address),
}

impl AircraftEvent {
    fn action(&self) -> &str {
        match self {
            Self::Entered(_) => "entered",
            Self::Left(_) => "left",
            Self::Landed(_) => "landed",
            Self::TookOff(_) => "took_off",
            Self::Present(_) => "present",
            Self::ChangedAddress(_, _) => "changed_address",
        }
    }
}

impl Serialize for AircraftEvent {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        // Important: increase the state len if new fields are added
        match self {
            Self::Present(ac)
            | Self::Entered(ac)
            | Self::Left(ac)
            | Self::Landed(ac)
            | Self::TookOff(ac) => {
                let mut state = serializer.serialize_struct("AircraftEvent", 10)?;
                state.serialize_field("action", self.action())?;
                state.serialize_field("icao24", &ac.icao24)?;
                state.serialize_field("callsign", ac.callsign.as_deref().unwrap_or_default())?;
                state.serialize_field("latitude", &ac.position.lat)?;
                state.serialize_field("longitude", &ac.position.lon)?;
                state.serialize_field("category", &ac.category)?;
                state.serialize_field("on_ground", &ac.on_ground)?;

                state.serialize_field("city", &ac.address.city)?;
                state.serialize_field("state", &ac.address.state)?;
                state.serialize_field("country", &ac.address.country)?;

                state.end()
            }
            Self::ChangedAddress(ac, prev_address) => {
                let mut state = serializer.serialize_struct("AircraftEvent", 13)?;
                state.serialize_field("action", self.action())?;
                state.serialize_field("icao24", &ac.icao24)?;
                state.serialize_field("callsign", ac.callsign.as_deref().unwrap_or_default())?;
                state.serialize_field("latitude", &ac.position.lat)?;
                state.serialize_field("longitude", &ac.position.lon)?;
                state.serialize_field("category", &ac.category)?;
                state.serialize_field("on_ground", &ac.on_ground)?;

                state.serialize_field("city", &ac.address.city)?;
                state.serialize_field("state", &ac.address.state)?;
                state.serialize_field("country", &ac.address.country)?;

                state.serialize_field("prev_city", &prev_address.city)?;
                state.serialize_field("prev_state", &prev_address.state)?;
                state.serialize_field("prev_country", &prev_address.country)?;

                state.end()
            }
        }
    }
}
