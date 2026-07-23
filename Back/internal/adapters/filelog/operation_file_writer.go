package filelog

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"Alias_bdca/Back/internal/logging"
	"Alias_bdca/Back/internal/observability"
)

type OperationFileWriter struct {
	baseDir string
	mu      sync.Mutex
	flows   map[string]*flowCollector
}

func NewOperationFileWriter(baseDir string) *OperationFileWriter {
	writer := &OperationFileWriter{
		baseDir: strings.TrimRight(baseDir, `/\`),
		flows:   make(map[string]*flowCollector),
	}
	writer.ensureOperationFolders()
	return writer
}

func (w *OperationFileWriter) OnEvent(ctx context.Context, event observability.Event) {
	if w == nil || w.baseDir == "" {
		return
	}

	operation := event.Operation
	if operation == "" {
		operation = observability.OperationFromContext(ctx)
	}
	if operation == "" {
		return
	}

	traceID := event.TraceID
	if traceID == "" {
		traceID = observability.TraceIDFromContext(ctx)
	}
	if traceID == "" {
		return
	}

	collector := w.trackEvent(traceID, operation, event)

	if w.shouldFlushFlow(event.Type, collector) {
		w.writeOperationLog(operation, traceID, collector)
		w.forgetFlow(traceID)
	}
}

func (w *OperationFileWriter) shouldFlushFlow(
	eventType observability.EventType,
	collector *flowCollector,
) bool {
	if collector == nil {
		return false
	}

	_, hasFrontResponse := collector.events[observability.EventFrontResponseSent]

	switch eventType {
	case observability.EventFrontResponseSent:
		return true
	case observability.EventOperationCompleted, observability.EventOperationFailed:
		return hasFrontResponse
	default:
		return false
	}
}

type flowCollector struct {
	events map[observability.EventType]observability.Event
}

func (w *OperationFileWriter) trackEvent(
	traceID, operation string,
	event observability.Event,
) *flowCollector {
	w.mu.Lock()
	defer w.mu.Unlock()

	collector, ok := w.flows[traceID]
	if !ok {
		collector = &flowCollector{
			events: make(map[observability.EventType]observability.Event),
		}
		w.flows[traceID] = collector
	}

	collector.events[event.Type] = event
	return collector
}

func (w *OperationFileWriter) forgetFlow(traceID string) {
	w.mu.Lock()
	defer w.mu.Unlock()
	delete(w.flows, traceID)
}

func (w *OperationFileWriter) writeOperationLog(operation, traceID string, collector *flowCollector) {
	if collector == nil {
		return
	}

	content := logging.BuildOperationLogContent(traceID, collector.events)
	if len(content) == 0 {
		return
	}

	recordedAt := logging.RequestRecordedAt(collector.events)
	dir := filepath.Join(w.baseDir, logging.FolderForOperation(operation))
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return
	}

	path := filepath.Join(dir, logging.HourlyLogFileName(recordedAt))
	file, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		return
	}
	defer file.Close()

	if info, err := file.Stat(); err == nil && info.Size() > 0 {
		if _, err := file.Write([]byte("\n")); err != nil {
			return
		}
	}

	_, _ = file.Write(content)
}

func (w *OperationFileWriter) ensureOperationFolders() {
	if w == nil || w.baseDir == "" {
		return
	}

	for _, folder := range logging.AllOperationLogFolders() {
		_ = os.MkdirAll(filepath.Join(w.baseDir, folder), 0o755)
	}
}
