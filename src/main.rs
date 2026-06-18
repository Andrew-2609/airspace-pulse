use std::convert::Infallible;

use axum::{
    Router,
    extract::State,
    response::sse::{Event as SseEvent, Sse},
    routing::get,
};
use tokio::{
    net::TcpListener,
    sync::broadcast::{self, Sender},
    time::{Duration, sleep},
    try_join,
};
use tokio_stream::StreamExt;

use crate::{event::AircraftEvent, state::AircraftState};

mod event;
mod model;
mod opensky;
mod state;

#[derive(Clone)]
struct AppState {
    sender: Sender<AircraftEvent>,
}

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

async fn health() -> &'static str {
    "OK"
}

async fn events_handler(
    State(state): State<AppState>,
) -> Sse<impl tokio_stream::Stream<Item = Result<SseEvent, Infallible>>> {
    let receiver = state.sender.subscribe();
    let stream = tokio_stream::wrappers::BroadcastStream::new(receiver);

    let mapped_stream = stream.filter_map(|result| match result {
        Ok(event) => {
            let sse_event = SseEvent::default().json_data(event).unwrap_or_default();
            Some(Ok::<_, Infallible>(sse_event))
        }
        Err(_) => None,
    });

    Sse::new(mapped_stream).keep_alive(
        axum::response::sse::KeepAlive::new()
            .interval(std::time::Duration::from_secs(15))
            .text("heartbeat"),
    )
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

        sleep(Duration::from_secs(15)).await;
    }
}

fn detect_events(previous: &AircraftState, current: &AircraftState) -> Vec<AircraftEvent> {
    let entered: Vec<AircraftEvent> = current
        .values()
        .filter_map(|ac| {
            if previous.contains_key(&ac.icao24) {
                None
            } else {
                Some(AircraftEvent::Entered(ac.clone()))
            }
        })
        .collect();

    let exited: Vec<AircraftEvent> = previous
        .values()
        .filter_map(|ac| {
            if current.contains_key(&ac.icao24) {
                None
            } else {
                Some(AircraftEvent::Left(ac.clone()))
            }
        })
        .collect();

    entered.iter().chain(exited.iter()).cloned().collect()
}
