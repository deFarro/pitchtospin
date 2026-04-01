FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 go build -o /bin/ingestion ./cmd/server

FROM alpine:3.20

COPY --from=builder /bin/ingestion /bin/ingestion

EXPOSE 8080

CMD ["/bin/ingestion"]
