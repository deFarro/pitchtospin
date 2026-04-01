package main

import (
	"log"
	"net/http"
	"os"

	"pitchtospin-ingestion/internal/clickhouse"
	"pitchtospin-ingestion/internal/handler"
)

func main() {
	chAddr := envOrDefault("CLICKHOUSE_ADDR", "localhost:9000")
	chDB := envOrDefault("CLICKHOUSE_DATABASE", "pitchtospin")
	chUser := envOrDefault("CLICKHOUSE_USER", "default")
	chPass := envOrDefault("CLICKHOUSE_PASSWORD", "")
	port := envOrDefault("INGESTION_PORT", "8080")

	store, err := clickhouse.New(chAddr, chDB, chUser, chPass)
	if err != nil {
		log.Fatalf("failed to connect to ClickHouse: %v", err)
	}
	defer store.Close()

	h := handler.New(store)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /ingest", h.Ingest)
	mux.HandleFunc("GET /health", h.Health)

	log.Printf("ingestion service listening on :%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatalf("server error: %v", err)
	}
}

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
