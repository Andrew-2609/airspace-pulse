mod model;
mod opensky;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let data = opensky::fetch().await?;

    let count = data.states.unwrap_or_default().len();

    println!("Found {} aircraft", count);

    Ok(())
}
