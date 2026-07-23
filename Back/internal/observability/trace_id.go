package observability

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"
)

type traceIDContext struct{}

type operationContext struct{}

func NewTraceID() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return fmt.Sprintf("trace-%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(b)
}

func WithTraceID(ctx context.Context, traceID string) context.Context {
	return context.WithValue(ctx, traceIDContext{}, traceID)
}

func TraceIDFromContext(ctx context.Context) string {
	if ctx == nil {
		return ""
	}

	traceID, ok := ctx.Value(traceIDContext{}).(string)
	if !ok {
		return ""
	}
	return traceID
}

func WithOperation(ctx context.Context, operation string) context.Context {
	return context.WithValue(ctx, operationContext{}, operation)
}

func OperationFromContext(ctx context.Context) string {
	if ctx == nil {
		return ""
	}

	operation, ok := ctx.Value(operationContext{}).(string)
	if !ok {
		return ""
	}
	return operation
}
