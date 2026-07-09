FROM golang:1.26.3-alpine AS builder 

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY Back/ ./Back/

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /simulador ./Back/cmd/simulador

FROM alpine:latest

RUN apk add --no-cache ca-certificates

WORKDIR /app

COPY --from=builder /simulador ./simulador

EXPOSE 8080

CMD ["./simulador"]

