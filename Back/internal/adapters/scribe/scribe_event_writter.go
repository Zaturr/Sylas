package scribe

import (
	"context"
	"fmt"
	"strings"
	"time"

	"Alias_bdca/Back/internal/observability"

	scribelib "github.com/SOLUCIONESSYCOM/scribe"
)

type ScribeEventWriter struct {
	logger *scribelib.Scribe
}

func NewScribeEventWriter(logger *scribelib.Scribe) *ScribeEventWriter {
	return &ScribeEventWriter{logger: logger}
}

func (w *ScribeEventWriter) OnEvent(ctx context.Context, event observability.Event) {
	if w == nil || w.logger == nil {
		return
	}

	var label string
	switch event.Type {
	case observability.EventFrontRequestReceived:
		label = "request"
	case observability.EventFrontResponseSent:
		label = "response"
	default:
		return
	}

	line := formatHTTPLogLine(event.Timestamp, event.Method, event.Path, label, event.Body)
	w.logger.InfoCtx(scribelib.WithCtx(ctx)).Msg(line)
}

func formatHTTPLogLine(at time.Time, method, path, label string, body []byte) string {
	if at.IsZero() {
		at = time.Now()
	}

	method = strings.ToUpper(strings.TrimSpace(method))
	path = strings.TrimSpace(path)
	if path == "" {
		path = "/"
	}

	payload := strings.TrimSpace(string(body))
	if payload == "" {
		return fmt.Sprintf("%s %s %s %s:", at.Format("2006-01-02 15:04:05"), method, path, label)
	}

	return fmt.Sprintf("%s %s %s %s: %s", at.Format("2006-01-02 15:04:05"), method, path, label, payload)
}
