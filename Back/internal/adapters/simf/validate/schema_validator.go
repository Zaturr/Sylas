package validate

import (
	"bytes"
	_ "embed"
	"encoding/json"
	"fmt"
	"strings"
	"sync"

	"github.com/dlclark/regexp2"
	"github.com/santhosh-tekuri/jsonschema/v6"
	"github.com/santhosh-tekuri/jsonschema/v6/kind"
)

//go:embed schema/simf-alias-schema.json
var simfAliasSchemaJSON []byte

const simfSchemaResource = "https://simf.alias/schemas/simf-alias-v2.json"

// SchemaViolation describe un campo que no cumple el esquema JSON.
type SchemaViolation struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// SchemaConflictBody es la respuesta HTTP 409 por estructura JSON inválida.
type SchemaConflictBody struct {
	Error   string            `json:"error"`
	Reason  string            `json:"reason"`
	Details []SchemaViolation `json:"details"`
}

// IdModAdvcValidationResult separa errores de schema (409) de rechazos de negocio SIMF (RR10/200).
type IdModAdvcValidationResult struct {
	Structural []SchemaViolation
	Value      []SchemaViolation
}

func (r IdModAdvcValidationResult) HasStructural() bool {
	return len(r.Structural) > 0
}

func (r IdModAdvcValidationResult) HasValue() bool {
	return len(r.Value) > 0
}

var (
	idModAdvcSchema     *jsonschema.Schema
	idModAdvcSchemaOnce sync.Once
	idModAdvcSchemaErr  error
)

func idModAdvcValidator() (*jsonschema.Schema, error) {
	idModAdvcSchemaOnce.Do(func() {
		var doc any
		if err := json.Unmarshal(simfAliasSchemaJSON, &doc); err != nil {
			idModAdvcSchemaErr = fmt.Errorf("parsear esquema SIMF: %w", err)
			return
		}

		compiler := jsonschema.NewCompiler()
		compiler.UseRegexpEngine(compileECMAScriptRegexp)
		if err := compiler.AddResource(simfSchemaResource, doc); err != nil {
			idModAdvcSchemaErr = fmt.Errorf("registrar esquema SIMF: %w", err)
			return
		}

		idModAdvcSchema, idModAdvcSchemaErr = compiler.Compile(
			simfSchemaResource + "#/$defs/IdModAdvcMessage",
		)
	})
	return idModAdvcSchema, idModAdvcSchemaErr
}

// ValidateIdModAdvcJSON valida el body contra IdModAdvcMessage y clasifica el resultado.
func ValidateIdModAdvcJSON(raw []byte) (IdModAdvcValidationResult, error) {
	if len(bytes.TrimSpace(raw)) == 0 {
		return IdModAdvcValidationResult{
			Structural: []SchemaViolation{{
				Field:   "",
				Message: "body JSON requerido",
			}},
		}, nil
	}

	var instance any
	if err := json.Unmarshal(raw, &instance); err != nil {
		return IdModAdvcValidationResult{
			Structural: []SchemaViolation{{
				Field:   "",
				Message: "JSON invalido: " + err.Error(),
			}},
		}, nil
	}

	schema, err := idModAdvcValidator()
	if err != nil {
		return IdModAdvcValidationResult{}, fmt.Errorf("inicializar validador de esquema: %w", err)
	}

	if err := schema.Validate(instance); err != nil {
		return classifyValidationErrors(err), nil
	}

	return IdModAdvcValidationResult{}, nil
}

func classifyValidationErrors(err error) IdModAdvcValidationResult {
	validationErr, ok := err.(*jsonschema.ValidationError)
	if !ok {
		return IdModAdvcValidationResult{
			Value: []SchemaViolation{{
				Field:   "",
				Message: err.Error(),
			}},
		}
	}

	result := IdModAdvcValidationResult{}
	collectLeafValidationErrors(validationErr, func(leaf *jsonschema.ValidationError) {
		violation := SchemaViolation{
			Field:   instanceLocationString(leaf.InstanceLocation),
			Message: leaf.Error(),
		}
		if isStructuralErrorKind(leaf.ErrorKind) {
			result.Structural = append(result.Structural, violation)
		} else {
			result.Value = append(result.Value, violation)
		}
	})

	if len(result.Structural) == 0 && len(result.Value) == 0 {
		result.Value = append(result.Value, SchemaViolation{
			Field:   "",
			Message: validationErr.Error(),
		})
	}

	return result
}

func collectLeafValidationErrors(err *jsonschema.ValidationError, fn func(*jsonschema.ValidationError)) {
	if err == nil {
		return
	}
	if len(err.Causes) == 0 {
		fn(err)
		return
	}
	for _, cause := range err.Causes {
		collectLeafValidationErrors(cause, fn)
	}
}

// isStructuralErrorKind indica errores de forma del JSON o formato de campos del schema (409).
// Incluye claves faltantes, tipos incorrectos y restricciones pattern/minLength/format/enum.
func isStructuralErrorKind(errorKind jsonschema.ErrorKind) bool {
	switch errorKind.(type) {
	case *kind.InvalidJsonValue,
		*kind.Type,
		*kind.Required,
		*kind.AdditionalProperties,
		*kind.PropertyNames,
		*kind.MinProperties,
		*kind.MaxProperties,
		*kind.AdditionalItems,
		*kind.Dependency,
		*kind.DependentRequired,
		*kind.MinItems,
		*kind.MaxItems,
		*kind.MinLength,
		*kind.MaxLength,
		*kind.Pattern,
		*kind.Format,
		*kind.Enum,
		*kind.Const:
		return true
	default:
		return false
	}
}

func instanceLocationString(parts []string) string {
	if len(parts) == 0 {
		return ""
	}
	return "/" + strings.Join(parts, "/")
}

type ecmascriptRegexp regexp2.Regexp

func (re *ecmascriptRegexp) MatchString(s string) bool {
	matched, err := (*regexp2.Regexp)(re).MatchString(s)
	return err == nil && matched
}

func (re *ecmascriptRegexp) String() string {
	return (*regexp2.Regexp)(re).String()
}

func compileECMAScriptRegexp(pattern string) (jsonschema.Regexp, error) {
	re, err := regexp2.Compile(pattern, regexp2.ECMAScript)
	if err != nil {
		return nil, err
	}
	return (*ecmascriptRegexp)(re), nil
}
