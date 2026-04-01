package clickhouse

import (
	"context"
	"fmt"
	"time"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

type TraceEvent struct {
	TraceID     string    `json:"traceId"`
	UserMessage string    `json:"userMessage"`
	LatencyMs   uint32    `json:"latencyMs"`
	TotalTokens uint32    `json:"totalTokens"`
	Error       string    `json:"error"`
	Timestamp   time.Time `json:"timestamp"`
}

type Store struct {
	conn   driver.Conn
	buffer []TraceEvent
}

const batchSize = 100
const flushInterval = 5 * time.Second

func New(addr, database, user, password string) (*Store, error) {
	conn, err := ch.Open(&ch.Options{
		Addr: []string{addr},
		Auth: ch.Auth{
			Database: database,
			Username: user,
			Password: password,
		},
		Settings: ch.Settings{
			"max_execution_time": 60,
		},
		DialTimeout: 5 * time.Second,
	})
	if err != nil {
		return nil, fmt.Errorf("clickhouse open: %w", err)
	}

	if err := conn.Ping(context.Background()); err != nil {
		return nil, fmt.Errorf("clickhouse ping: %w", err)
	}

	s := &Store{conn: conn, buffer: make([]TraceEvent, 0, batchSize)}

	go s.flushLoop()

	return s, nil
}

func (s *Store) Insert(event TraceEvent) {
	s.buffer = append(s.buffer, event)
	if len(s.buffer) >= batchSize {
		s.flush()
	}
}

func (s *Store) flush() {
	if len(s.buffer) == 0 {
		return
	}

	events := make([]TraceEvent, len(s.buffer))
	copy(events, s.buffer)
	s.buffer = s.buffer[:0]

	go func() {
		ctx := context.Background()
		batch, err := s.conn.PrepareBatch(ctx, "INSERT INTO traces (trace_id, user_message, latency_ms, total_tokens, error, timestamp)")
		if err != nil {
			fmt.Printf("prepare batch error: %v\n", err)
			return
		}

		for _, e := range events {
			if err := batch.Append(e.TraceID, e.UserMessage, e.LatencyMs, e.TotalTokens, e.Error, e.Timestamp); err != nil {
				fmt.Printf("append error: %v\n", err)
				return
			}
		}

		if err := batch.Send(); err != nil {
			fmt.Printf("batch send error: %v\n", err)
		}
	}()
}

func (s *Store) flushLoop() {
	ticker := time.NewTicker(flushInterval)
	defer ticker.Stop()
	for range ticker.C {
		s.flush()
	}
}

func (s *Store) Close() {
	s.flush()
	s.conn.Close()
}
