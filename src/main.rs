use std::sync::LazyLock;

use axum::{Router, routing::get};
use reverse_geocoder::ReverseGeocoder;
use tokio::{
    net::TcpListener,
    sync::broadcast::{self, Sender},
    time::{Duration, sleep},
    try_join,
};

use crate::{
    api::{AppState, events_handler, health},
    event::AircraftEvent,
    state::AircraftState,
};

mod api;
mod event;
mod model;
mod opensky;
mod state;

const POLL_INTERVAL: u64 = 22;

static GEOCODER: LazyLock<ReverseGeocoder> = LazyLock::new(ReverseGeocoder::new);

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let (sender, _rx) = broadcast::channel(50);

    let app = Router::new()
        .route("/health", get(health))
        .route("/v1/events", get(events_handler))
        .with_state(AppState {
            sender: sender.clone(),
        });

    let listener = TcpListener::bind("127.0.0.1:3000").await?;

    let poller_result = tokio::spawn(async move {
        println!("starting poller");
        run_poller(sender).await
    });

    let server_result = tokio::spawn(async {
        println!("starting web server");
        axum::serve(listener, app).await
    });

    match try_join!(poller_result, server_result) {
        Ok(_) => Ok(()),
        Err(err) => Err(err.into()),
    }
}

async fn run_poller(sender: Sender<AircraftEvent>) -> anyhow::Result<()> {
    let mut previous = AircraftState::new();

    loop {
        let mut current = AircraftState::new();

        match opensky::fetch().await {
            Ok(data) => {
                let count = data.len();
                println!("found {} aircraft {}", count, " ".repeat(6));

                for aircraft in data {
                    current.insert(aircraft.icao24.clone(), aircraft.clone());
                }

                let events = detect_events(&previous, &current);

                for event in events {
                    match sender.send(event) {
                        Ok(_) => {}
                        Err(_) => {}
                    };
                }

                previous = current;
            }
            Err(err) => {
                println!("polling error: {}", err)
            }
        }

        sleep(Duration::from_secs(POLL_INTERVAL)).await;
    }
}

fn detect_events(previous: &AircraftState, current: &AircraftState) -> Vec<AircraftEvent> {
    let mut result: Vec<AircraftEvent> = Vec::new();

    for (_, cur) in current {
        match previous.get(&cur.icao24) {
            None => {
                result.push(AircraftEvent::Entered(cur.clone()));
            }
            Some(prev) => match (prev.on_ground, cur.on_ground) {
                (false, true) => {
                    result.push(AircraftEvent::Landed(cur.clone()));
                }
                (true, false) => {
                    result.push(AircraftEvent::TookOff(cur.clone()));
                }
                _ => {}
            },
        }
    }

    for (icao, prev) in previous {
        match current.get(icao) {
            Some(cur) => result.push(AircraftEvent::Present(cur.clone())),
            None => result.push(AircraftEvent::Left(prev.clone())),
        }
    }

    result
}
