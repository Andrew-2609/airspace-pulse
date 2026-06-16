use tokio::time::{Duration, sleep};

mod model;
mod opensky;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    loop {
        match opensky::fetch().await {
            Ok(data) => {
                let count = data.states.unwrap_or_default().len();
                println!("Found {} aircraft", count)
            }
            Err(err) => {
                println!("Error: {}", err)
            }
        }

        sleep(Duration::from_secs(15)).await;
    }
}
