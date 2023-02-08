use criterion::{criterion_group, criterion_main, Criterion};
use quotes::stats::quotee_stats;
use std::path::PathBuf;

// This isn't super great but it gives a general idea of the magnitude of the speed.
pub fn criterion_benchmark(c: &mut Criterion) {
    dotenv::dotenv().ok();

    c.bench_function("quotee_stats", |b| {
        let runtime = tokio::runtime::Runtime::new().unwrap();
        b.to_async(runtime).iter(|| async {
            let db_path: PathBuf = std::env::var("DB_PATH").unwrap().into();
            let db = quotes::setup_database(&db_path).await.unwrap();
            let _result = db.call(move |conn| quotee_stats(conn)).await.unwrap();
        })
    });
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
