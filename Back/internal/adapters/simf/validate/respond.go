package validate

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

// RespondSchemaConflict responde HTTP 409 cuando la estructura del JSON es inválida.
func RespondSchemaConflict(c *gin.Context, violations []SchemaViolation) {
	c.JSON(http.StatusConflict, BuildSchemaConflictBody(violations))
}

// ReadRequestBody lee el body HTTP; responde 409 si está vacío o no se puede leer.
func ReadRequestBody(c *gin.Context) ([]byte, bool) {
	raw, err := io.ReadAll(c.Request.Body)
	if err != nil {
		RespondSchemaConflict(c, []SchemaViolation{{
			Field:   "",
			Message: "no se pudo leer el body: " + err.Error(),
		}})
		return nil, false
	}
	return raw, true
}
