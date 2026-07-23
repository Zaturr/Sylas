package ports

import (
	"context"

	"Alias_bdca/Back/internal/observability"
)

type EventListener interface {
	OnEvent(ctx context.Context, event observability.Event)
}
