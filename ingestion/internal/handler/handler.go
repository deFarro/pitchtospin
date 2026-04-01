package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"pitchtospin-ingestion/internal/clickhouse"
)

type Handler struct {
	store *clickhouse.Store
}

func New(store *clickhouse.Store) *Handler {
	return &Handler{store: store}
}

type ingestRequest struct {
	TraceID     string  `json:"traceId"`
	UserMessage string  `json:"userMessage"`
	LatencyMs   uint32  `json:"latencyMs"`
	TotalTokens uint32  `json:"totalTokens"`
	Error       *string `json:"error"`
	Timestamp   string  `json:"timestamp"`
}

func (h *Handler) Ingest(w http.ResponseWriter, r *http.Request) {
	var req ingestRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	ts, err := time.Parse(time.RFC3339Nano, req.Timestamp)
	if err != nil {
		ts = time.Now()
	}

	errStr := ""
	if req.Error != nil {
		errStr = *req.Error
	}

	h.store.Insert(clickhouse.TraceEvent{
		TraceID:     req.TraceID,
		UserMessage: req.UserMessage,
		LatencyMs:   req.LatencyMs,
		TotalTokens: req.TotalTokens,
		Error:       errStr,
		Timestamp:   ts,
	})

	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]string{"status": "accepted"})
}

func (h *Handler) Health(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
