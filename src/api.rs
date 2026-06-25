use std::convert::Infallible;

use axum::{
    extract::{Query, State},
    response::sse::{Event as SseEvent, Sse},
};
use serde::Deserialize;
use tokio::sync::broadcast::Sender;
use tokio_stream::StreamExt;

use crate::{event::AircraftEvent, model::Position};

#[derive(Clone)]
pub struct AppState {
    pub sender: Sender<AircraftEvent>,
}

#[derive(Deserialize)]
pub struct BoundingBox {
    pub lamin: f64,
    pub lamax: f64,
    pub lomin: f64,
    pub lomax: f64,
}

impl BoundingBox {
    fn contains(&self, position: &Position) -> bool {
        position.lon >= self.lomin
            && position.lon <= self.lomax
            && position.lat >= self.lamin
            && position.lat <= self.lamax
    }
}

pub async fn health() -> &'static str {
    "OK"
}

pub async fn events_handler(
    State(state): State<AppState>,
    Query(bbox): Query<BoundingBox>,
) -> Sse<impl tokio_stream::Stream<Item = Result<SseEvent, Infallible>>> {
    let receiver = state.sender.subscribe();
    let stream = tokio_stream::wrappers::BroadcastStream::new(receiver);

    let mapped_stream = stream.filter_map(move |result| match result {
        Ok(event) => match bbox.contains(event.aircraft_position()) {
            true => {
                let sse_event = SseEvent::default().json_data(event).unwrap_or_default();
                Some(Ok::<_, Infallible>(sse_event))
            }
            false => None,
        },
        Err(_) => None,
    });

    Sse::new(mapped_stream).keep_alive(
        axum::response::sse::KeepAlive::new()
            .interval(std::time::Duration::from_secs(15))
            .text("heartbeat"),
    )
}
