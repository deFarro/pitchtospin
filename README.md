# PitchToSpin

**Discogs AI Agent with Observability & Analytics**

An LLM-powered agent that interacts with the Discogs API to help users explore music collections, discover records, and browse marketplace listings — with full observability instrumented via Langfuse and real-time analytics powered by ClickHouse.

## Architecture

```
Frontend (Agent UI)  →  Agent/Backend (TS/Fastify)  →  Anthropic Claude
                              │                              │
                              │ Langfuse SDK                 │ tool calls
                              │                              ▼
                              │                        Discogs API
                              │
                              ├── reads analytics  →  ClickHouse
                              │
                              └── emits events     →  Go Ingestion Service  →  ClickHouse

Dashboard (Analytics UI)  →  Agent/Backend  →  reads from ClickHouse
```

## Project Structure

| Directory    | Description                                   | Stack                                            |
| ------------ | --------------------------------------------- | ------------------------------------------------ |
| `frontend/`  | Agent chat UI                                 | React, Vite, Tailwind, TypeScript                |
| `dashboard/` | LLM observability & analytics dashboard       | React, Vite, Tailwind, TypeScript, Recharts      |
| `agent/`     | Backend API, agent logic, analytics endpoints | Fastify, TypeScript, Anthropic SDK, Langfuse SDK |
| `ingestion/` | High-throughput event ingestion pipeline      | Go, clickhouse-go                                |

## Prerequisites

- Docker & Docker Compose
- Discogs API credentials ([request access](https://www.discogs.com/settings/developers))
- Anthropic API key
- Langfuse account (optional, for cloud dashboard)

## Local Development

```bash
cp .env.template .env
# Fill in your API keys in .env

docker compose up --build
```

## Services

| Service    | URL                   | Container                |
| ---------- | --------------------- | ------------------------ |
| Frontend   | http://localhost:5173 | `pitchtospin-frontend`   |
| Dashboard  | http://localhost:5174 | `pitchtospin-dashboard`  |
| Agent API  | http://localhost:3000 | `pitchtospin-agent`      |
| Ingestion  | http://localhost:8080 | `pitchtospin-ingestion`  |
| ClickHouse | http://localhost:8123 | `pitchtospin-clickhouse` |

## Environment Variables

See `.env.template` for all required configuration. Key variables:

| Variable              | Description                          |
| --------------------- | ------------------------------------ |
| `DISCOGS_TOKEN`       | Discogs personal access token        |
| `ANTHROPIC_API_KEY`   | Anthropic API key for Claude         |
| `LANGFUSE_PUBLIC_KEY` | Langfuse cloud public key (optional) |
| `LANGFUSE_SECRET_KEY` | Langfuse cloud secret key (optional) |
