package simf

import (
	"encoding/json"
	"net/http"

	"Alias_bdca/Back/internal/adapters/simf/validate"

	"github.com/gin-gonic/gin"
)

type idModAdvcBindStatus int

const (
	idModAdvcBound idModAdvcBindStatus = iota
	idModAdvcStructuralConflict
	idModAdvcValueFormatError
)

// bindIdModAdvcBody lee el body, valida estructura/valores del schema y deserializa IdModAdvc.
func bindIdModAdvcBody(c *gin.Context, dest any) idModAdvcBindStatus {
	raw, ok := validate.ReadRequestBody(c)
	if !ok {
		return idModAdvcStructuralConflict
	}

	result, err := validate.ValidateIdModAdvcJSON(raw)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error interno del servidor"})
		return idModAdvcStructuralConflict
	}
	if result.HasStructural() {
		validate.RespondSchemaConflict(c, result.Structural)
		return idModAdvcStructuralConflict
	}

	if err := json.Unmarshal(raw, dest); err != nil {
		validate.RespondSchemaConflict(c, []validate.SchemaViolation{{
			Field:   "",
			Message: "JSON invalido: " + err.Error(),
		}})
		return idModAdvcStructuralConflict
	}

	if result.HasValue() {
		return idModAdvcValueFormatError
	}

	return idModAdvcBound
}
