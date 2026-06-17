use tokio::time::{Duration, sleep};

use crate::{event::Event, state::AircraftState};

mod event;
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
                println!("\n{}", message);

                for aircraft in data {
                    current.insert(aircraft.icao24.clone(), aircraft.clone());
                }

                let events = detect_events(&previous, &current);

                for event in events {
                    println!("{:^30}", event);
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

fn detect_events(previous: &AircraftState, current: &AircraftState) -> Vec<Event> {
    let entered: Vec<Event> = current
        .values()
        .filter_map(|ac| {
            if previous.contains_key(&ac.icao24) {
                None
            } else {
                Some(Event::Entered(ac.icao24.clone()))
            }
        })
        .collect();

    let exited: Vec<Event> = previous
        .values()
        .filter_map(|ac| {
            if current.contains_key(&ac.icao24) {
                None
            } else {
                Some(Event::Left(ac.icao24.clone()))
            }
        })
        .collect();

    entered.iter().chain(exited.iter()).cloned().collect()
}
