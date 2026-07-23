package ports

import (
	"context"

	"Alias_bdca/Back/internal/observability"
)

type EventBus interface {
	Publish(ctx context.Context, event observability.Event)
	Subscribe(listener EventListener)
	Shutdown(ctx context.Context) error
}
