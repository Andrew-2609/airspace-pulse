use tokio::time::{Duration, sleep};

use crate::{model::Aircraft, state::AircraftState};

mod model;
mod opensky;
mod state;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let mut previous = AircraftState::new();

    loop {
        let mut current = AircraftState::new();

        match opensky::fetch().await {
            Ok(data) => {
                let count = data.len();
                let message = format!("Found {} aircraft {}", count, " ".repeat(6));
                println!("\n{:^78}", message);

                for aircraft in data {
                    current.insert(aircraft.icao24.clone(), aircraft.clone());
                }

                let (remained, entered): (Vec<&Aircraft>, Vec<&Aircraft>) = current
                    .values()
                    .partition(|ac| previous.contains_key(&ac.icao24));

                let exited = previous
                    .values()
                    .filter(|ac| !current.contains_key(&ac.icao24));

                display_aircraft(entered.into_iter(), "ENTERED");
                display_aircraft(remained.into_iter(), "");
                display_aircraft(exited, "EXITED");

                previous = current;
            }
            Err(err) => {
                println!("Error: {}", err)
            }
        }

        sleep(Duration::from_secs(15)).await;
    }
}

fn display_aircraft<'a>(aircraft: impl Iterator<Item = &'a Aircraft> + 'a, action: &str) {
    let mut sorted: Vec<&Aircraft> = aircraft.collect();

    sorted.sort_by(|a, b| a.icao24.cmp(&b.icao24));

    for ac in sorted {
        let message = if action.is_empty() {
            ac.icao24.clone()
        } else {
            format!("{} {}", action, ac.icao24)
        };

        println!(
            "| {:^30} | {:^30} |",
            message,
            ac.callsign.as_deref().unwrap_or_default()
        )
    }
}
