use std::fmt::Display;

#[derive(Clone)]
pub enum Event {
    Entered(String),
    Left(String),
}

impl Display for Event {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Event::Entered(icao24) => write!(f, "{} entered the airspace", icao24),
            Event::Left(icao24) => write!(f, "{} left the airspace", icao24),
        }
    }
}
