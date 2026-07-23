package logging

import (
	"encoding/json"
	"time"

	"Alias_bdca/Back/internal/observability"
)

type OperationLogLine struct {
	TraceID    string          `json:"trace_id"`
	RecordedAt time.Time       `json:"recorded_at"`
	Section    string          `json:"section"`
	Format     string          `json:"format,omitempty"`
	Body       json.RawMessage `json:"body,omitempty"`
	BodyXML    string          `json:"body_xml,omitempty"`
}

func BuildOperationLogContent(traceID string, events map[observability.EventType]observability.Event) []byte {
	recordedAt := RequestRecordedAt(events)

	sections := []struct {
		eventType observability.EventType
		section   string
	}{
		{observability.EventFrontRequestReceived, "front_request"},
		{observability.EventBDCARequestSent, "bdca_request"},
		{observability.EventBDCAResponseReceived, "bdca_response"},
		{observability.EventFrontResponseSent, "front_response"},
	}

	var lines []byte
	for _, item := range sections {
		event, ok := events[item.eventType]
		if !ok || len(event.Body) == 0 {
			continue
		}

		line := OperationLogLine{
			TraceID:    traceID,
			RecordedAt: recordedAt,
			Section:    item.section,
		}
		if isJSONBody(event.Body) {
			line.Format = "json"
			line.Body = json.RawMessage(event.Body)
		} else if event.Body[0] == '<' {
			line.Format = "xml"
			line.BodyXML = string(event.Body)
		} else {
			line.Format = "text"
			line.Body = json.RawMessage(quoteJSONString(string(event.Body)))
		}

		encoded, err := json.Marshal(line)
		if err != nil {
			continue
		}

		if len(lines) > 0 {
			lines = append(lines, '\n')
		}
		lines = append(lines, encoded...)
	}

	return lines
}

func RequestRecordedAt(events map[observability.EventType]observability.Event) time.Time {
	if event, ok := events[observability.EventFrontRequestReceived]; ok && !event.Timestamp.IsZero() {
		return event.Timestamp
	}
	if event, ok := events[observability.EventFrontResponseSent]; ok && !event.Timestamp.IsZero() {
		return event.Timestamp
	}
	return time.Now()
}

func HourlyLogFileName(t time.Time) string {
	return t.Format("2006-01-02_15") + ".log"
}

func isJSONBody(body []byte) bool {
	var js json.RawMessage
	return json.Unmarshal(body, &js) == nil
}

func quoteJSONString(value string) []byte {
	content, err := json.Marshal(value)
	if err != nil {
		return []byte(`""`)
	}
	return content
}
