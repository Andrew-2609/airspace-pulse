use tokio::time::{Duration, sleep};

use crate::state::AircraftState;

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

                for (id, aircraft) in &current {
                    let mut icao_str = String::new();
                    if !previous.contains_key(id) {
                        icao_str.push_str("ENTERED ");
                    }
                    icao_str.push_str(&aircraft.icao24);
                    println!(
                        "| {:^30} | {:^30} |",
                        icao_str,
                        aircraft.callsign.as_deref().unwrap_or_default()
                    );
                }

                previous = current;
            }
            Err(err) => {
                println!("Error: {}", err)
            }
        }

        sleep(Duration::from_secs(15)).await;
    }
}
