package corexml

import (
	"bytes"
	"io"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// rejectNonXMLBody bloquea POST/PUT con JSON u otro formato distinto de XML.
// El core (servicio 3) solo habla XML en /simf/bdca/v1; JSON entra por SIMF-Alias :9090.
func rejectNonXMLBody() gin.HandlerFunc {
	return func(c *gin.Context) {
		switch c.Request.Method {
		case http.MethodPost, http.MethodPut, http.MethodPatch:
		default:
			c.Next()
			return
		}

		contentType := strings.ToLower(strings.TrimSpace(c.GetHeader("Content-Type")))
		if strings.Contains(contentType, "application/json") || strings.Contains(contentType, "+json") {
			writeJSONRejected(c)
			c.Abort()
			return
		}

		raw, err := io.ReadAll(c.Request.Body)
		if err != nil {
			writeInternalError(c)
			c.Abort()
			return
		}
		c.Request.Body = io.NopCloser(bytes.NewBuffer(raw))

		trimmed := bytes.TrimSpace(raw)
		if len(trimmed) > 0 && trimmed[0] == '{' {
			writeJSONRejected(c)
			c.Abort()
			return
		}

		c.Next()
	}
}

func writeJSONRejected(c *gin.Context) {
	const body = `error Error de formato`
	c.Data(http.StatusConflict, xmlContentType, []byte(body))
}
