CREATE DATABASE IF NOT EXISTS pitchtospin;

CREATE TABLE IF NOT EXISTS pitchtospin.traces
(
    trace_id      String,
    user_message  String,
    latency_ms    UInt32,
    total_tokens  UInt32,
    error         String DEFAULT '',
    timestamp     DateTime64(3)
)
ENGINE = MergeTree()
ORDER BY (timestamp, trace_id)
TTL toDateTime(timestamp) + INTERVAL 90 DAY;
