use tokio::time::{Duration, sleep};

mod model;
mod opensky;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    loop {
        match opensky::fetch().await {
            Ok(data) => {
                let count = data.len();
                println!("| Found {} aircraft {} |", count, " ".repeat(6));
                println!("|{}|", "-".repeat(25));

                for aircraft in data {
                    println!(
                        "| {:<10} | {:<10} |",
                        aircraft.icao24,
                        aircraft.callsign.unwrap_or_default()
                    );
                }

                println!("{}", "-".repeat(27));
            }
            Err(err) => {
                println!("Error: {}", err)
            }
        }

        sleep(Duration::from_secs(15)).await;
    }
}
