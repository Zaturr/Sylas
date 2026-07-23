package event_bus

import (
	"context"
	"sync"
	"sync/atomic"

	"Alias_bdca/Back/internal/observability"
	"Alias_bdca/Back/internal/ports"
)

type EventBus struct {
	events    chan observability.Event
	listeners []ports.EventListener
	mu        sync.RWMutex
	wg        sync.WaitGroup
	closed    atomic.Bool
}

func New(bufferSize int) ports.EventBus {
	if bufferSize <= 0 {
		bufferSize = 1024
	}

	bus := &EventBus{
		events: make(chan observability.Event, bufferSize),
	}

	bus.wg.Add(1)
	go bus.run()
	return bus
}

func (b *EventBus) Publish(ctx context.Context, event observability.Event) {
	if b == nil || b.closed.Load() {
		return
	}
	if event.TraceID == "" {
		event.TraceID = observability.TraceIDFromContext(ctx)
	}
	if event.Operation == "" {
		event.Operation = observability.OperationFromContext(ctx)
	}
	select {
	case b.events <- event:
	default:
		b.events <- event
	}
}

func (b *EventBus) Subscribe(listener ports.EventListener) {
	if b == nil || listener == nil {
		return
	}
	b.mu.Lock()
	defer b.mu.Unlock()
	b.listeners = append(b.listeners, listener)
}

func (b *EventBus) Shutdown(ctx context.Context) error {
	if b == nil || b.closed.Load() {
		return nil
	}
	b.closed.Store(true)
	close(b.events)
	b.wg.Wait()
	return nil
}

func (b *EventBus) run() {
	defer b.wg.Done()
	for event := range b.events {
		b.dispatch(event)
	}
}

func (b *EventBus) dispatch(event observability.Event) {
	b.mu.RLock()
	listeners := append([]ports.EventListener{}, b.listeners...)
	b.mu.RUnlock()

	ctx := context.Background()
	if event.TraceID != "" {
		ctx = observability.WithTraceID(ctx, event.TraceID)
	}
	if event.Operation != "" {
		ctx = observability.WithOperation(ctx, event.Operation)
	}

	for _, listener := range listeners {
		listener.OnEvent(ctx, event)
	}
}
