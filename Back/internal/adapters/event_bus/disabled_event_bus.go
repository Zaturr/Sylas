package event_bus

import (
	"context"

	"Alias_bdca/Back/internal/observability"
	"Alias_bdca/Back/internal/ports"
)

type DisabledEventBus struct{}

func NewDisabled() ports.EventBus {
	return &DisabledEventBus{}
}

func (b *DisabledEventBus) Publish(ctx context.Context, event observability.Event) {}

func (b *DisabledEventBus) Subscribe(listener ports.EventListener) {}

func (b *DisabledEventBus) Shutdown(ctx context.Context) error {
	return nil
}
