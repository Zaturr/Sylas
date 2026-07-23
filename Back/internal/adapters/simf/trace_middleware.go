package simf

import (
	"bytes"
	"io"

	"Alias_bdca/Back/internal/observability"
	"Alias_bdca/Back/internal/ports"

	"github.com/gin-gonic/gin"
)

func TraceMiddleware(bus ports.EventBus) gin.HandlerFunc {
	return func(c *gin.Context) {
		if bus == nil {
			c.Next()
			return
		}

		method := c.Request.Method
		path := c.Request.URL.Path
		traceID := observability.NewTraceID()
		ctx := observability.WithTraceID(c.Request.Context(), traceID)
		c.Request = c.Request.WithContext(ctx)

		var requestBody []byte
		if c.Request.Body != nil {
			raw, err := io.ReadAll(c.Request.Body)
			if err == nil {
				requestBody = raw
				c.Request.Body = io.NopCloser(bytes.NewBuffer(raw))
			}
		}

		bus.Publish(ctx, observability.NewEvent(observability.EventFrontRequestReceived).
			WithTraceID(traceID).
			WithHTTP(method, path, 0, requestBody))

		recorder := &responseCapture{ResponseWriter: c.Writer}
		c.Writer = recorder
		c.Next()

		bus.Publish(ctx, observability.NewEvent(observability.EventFrontResponseSent).
			WithTraceID(traceID).
			WithHTTP(method, path, c.Writer.Status(), recorder.body.Bytes()))
	}
}

type responseCapture struct {
	gin.ResponseWriter
	body bytes.Buffer
}

func (r *responseCapture) Write(b []byte) (int, error) {
	r.body.Write(b)
	return r.ResponseWriter.Write(b)
}
