use std::convert::Infallible;

use axum::{
    extract::State,
    response::sse::{Event as SseEvent, Sse},
};

use tokio::sync::broadcast::Sender;
use tokio_stream::StreamExt;

use crate::event::AircraftEvent;

#[derive(Clone)]
pub struct AppState {
    pub sender: Sender<AircraftEvent>,
}

pub async fn health() -> &'static str {
    "OK"
}

pub async fn events_handler(
    State(state): State<AppState>,
) -> Sse<impl tokio_stream::Stream<Item = Result<SseEvent, Infallible>>> {
    let receiver = state.sender.subscribe();
    let stream = tokio_stream::wrappers::BroadcastStream::new(receiver);

    let mapped_stream = stream.filter_map(move |result| match result {
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
