package observability

import (
	"time"
)

type EventType string

const (
	EventFrontRequestReceived EventType = "front_request_received"
	EventFrontResponseSent    EventType = "front_response_sent"

	EvenOperationInvoked    EventType = "operation_invoked"
	EventOperationCompleted EventType = "operation_completed"
	EventOperationFailed    EventType = "operation_failed"

	EventBDCARequestSent      EventType = "bdca_request_sent"
	EventBDCAResponseReceived EventType = "bdca_response_received"

	EventXSDValidationFailed EventType = "xsd_validation_failed"

	EventJSONSchemaValidationFailed EventType = "json_schema_validation_failed"
)

type Peer string

const (
	PeerFront Peer = "front"
	PeerCore  Peer = "BDCA"
)

type Direction string

const (
	DirectionInbound  Direction = "inbound"
	DirectionOutbound Direction = "outbound"
)

type Event struct {
	Type      EventType
	TraceID   string
	Timestamp time.Time

	Operation string
	Peer      Peer
	Direction Direction

	Method string
	Path   string
	URL    string
	Status int

	Body []byte

	Error string

	Duration time.Duration
}

func NewEvent(eventType EventType) Event {
	return Event{
		Type:      eventType,
		Timestamp: time.Now(),
	}
}

func (e Event) WithTraceID(traceID string) Event {
	e.TraceID = traceID
	return e
}

func (e Event) WithOperation(operation string) Event {
	e.Operation = operation
	return e
}

func (e Event) WithHTTP(method, path string, status int, body []byte) Event {
	e.Method = method
	e.Path = path
	e.Status = status
	e.Body = append([]byte(nil), body...)
	return e
}

func (e Event) WithURL(url string) Event {
	e.URL = url
	return e
}

func (e Event) WithPeer(peer Peer, direction Direction) Event {
	e.Peer = peer
	e.Direction = direction
	return e
}

func (e Event) WithError(error string) Event {
	e.Error = error
	return e
}

func (e Event) WithDuration(d time.Duration) Event {
	e.Duration = d
	return e
}
