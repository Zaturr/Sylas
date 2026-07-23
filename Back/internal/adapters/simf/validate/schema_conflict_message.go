package validate

import (
	"fmt"
	"strings"

	simfdomain "Alias_bdca/Back/internal/domain/simf"
)

// BuildSchemaConflictBody construye el cuerpo estándar de respuesta 409.
func BuildSchemaConflictBody(violations []SchemaViolation) SchemaConflictBody {
	normalized := normalizeSchemaViolations(violations)
	return SchemaConflictBody{
		Error:   buildSchemaConflictSummary(normalized),
		Reason:  simfdomain.ReasonFormat,
		Details: normalized,
	}
}

func normalizeSchemaViolations(violations []SchemaViolation) []SchemaViolation {
	if len(violations) == 0 {
		return violations
	}

	type grouped struct {
		path     string
		messages []string
	}

	byField := make(map[string]*grouped)
	order := make([]string, 0, len(violations))

	for _, violation := range violations {
		fieldName := simfFieldName(violation.Field)
		message := friendlySchemaMessage(fieldName, violation.Message)
		if message == "" {
			continue
		}

		group, ok := byField[fieldName]
		if !ok {
			group = &grouped{path: violation.Field}
			byField[fieldName] = group
			order = append(order, fieldName)
		}
		if !containsString(group.messages, message) {
			group.messages = append(group.messages, message)
		}
	}

	normalized := make([]SchemaViolation, 0, len(order))
	for _, fieldName := range order {
		group := byField[fieldName]
		normalized = append(normalized, SchemaViolation{
			Field:   fieldName,
			Message: strings.Join(group.messages, "; "),
		})
	}

	if len(normalized) == 0 {
		return violations
	}
	return normalized
}

func buildSchemaConflictSummary(violations []SchemaViolation) string {
	if len(violations) == 0 {
		return "estructura JSON invalida"
	}

	parts := make([]string, 0, len(violations))
	for _, violation := range violations {
		fieldName := strings.TrimSpace(violation.Field)
		if fieldName == "" {
			fieldName = "body"
		}
		message := strings.TrimSpace(violation.Message)
		if message == "" {
			parts = append(parts, fmt.Sprintf("fallo en %s", fieldName))
			continue
		}
		parts = append(parts, fmt.Sprintf("%s: %s", fieldName, message))
	}

	return "estructura JSON invalida: " + strings.Join(parts, " | ")
}

func simfFieldName(instancePath string) string {
	path := strings.TrimSpace(instancePath)
	if path == "" {
		return "body"
	}

	parts := strings.Split(strings.Trim(path, "/"), "/")
	if len(parts) == 0 {
		return path
	}

	last := parts[len(parts)-1]
	if last != "" {
		return last
	}
	if len(parts) > 1 {
		return parts[len(parts)-2]
	}
	return "body"
}

func friendlySchemaMessage(fieldName, rawMessage string) string {
	rawMessage = strings.TrimSpace(rawMessage)
	lower := strings.ToLower(rawMessage)

	switch {
	case strings.Contains(lower, "required"),
		strings.Contains(lower, "missing properties"),
		strings.Contains(lower, "must be present"):
		if fieldName == "body" {
			return extractRequiredFieldFromMessage(rawMessage)
		}
		return fmt.Sprintf("campo requerido ausente o mal escrito; use %s (%s)", fieldName, fieldFormatHint(fieldName))

	case strings.Contains(lower, "additionalproperties"),
		strings.Contains(lower, "additional properties"):
		if wrongField := extractAdditionalPropertyFromMessage(rawMessage); wrongField != "" {
			return fmt.Sprintf("propiedad no permitida '%s'; verifique el nombre del campo SIMF", wrongField)
		}
		return fmt.Sprintf("propiedad no permitida en %s; verifique el nombre del campo", fieldName)

	case strings.Contains(lower, "pattern"):
		return fmt.Sprintf("formato invalido (%s)", fieldFormatHint(fieldName))

	case strings.Contains(lower, "maxlength"),
		strings.Contains(lower, "minlength"):
		return fmt.Sprintf("longitud invalida (%s)", fieldFormatHint(fieldName))

	case strings.Contains(lower, "format"):
		return fmt.Sprintf("formato invalido (%s)", fieldFormatHint(fieldName))

	case strings.Contains(lower, "enum"):
		return fmt.Sprintf("valor no permitido (%s)", fieldFormatHint(fieldName))

	case strings.Contains(lower, "type"):
		return fmt.Sprintf("tipo de dato invalido en %s", fieldName)

	case rawMessage != "":
		return rawMessage

	default:
		return fmt.Sprintf("valor invalido en %s", fieldName)
	}
}

func fieldFormatHint(fieldName string) string {
	switch fieldName {
	case "MsgId", "OrgnlMsgId":
		return "28 caracteres alfanumericos"
	case "EndToEndId", "OrgnlEndToEndId":
		return "26 caracteres alfanumericos"
	case "CreDtTm", "OrgnlCreDtTm":
		return "fecha ISO 8601 YYYY-MM-DDThh:mm:ss"
	case "Alias":
		return "6-15 caracteres en minusculas, numeros y punto"
	case "Agt":
		return "4 caracteres alfanumericos"
	case "Nm":
		return "nombre en mayusculas, 1-140 caracteres"
	case "Id":
		return "identificacion alfanumerica, 1-35 caracteres"
	case "SchmeNm":
		return "SCID, SRIF o SPAS"
	case "Sts":
		return "ACTV, INAC, PNDL, BLKD o UNRG"
	case "Result":
		return "ACCP o RJCT"
	case "Rsn":
		return "codigo de rechazo SIMF de 4 caracteres"
	default:
		return "revise el esquema SIMF"
	}
}

func extractRequiredFieldFromMessage(rawMessage string) string {
	lower := strings.ToLower(rawMessage)
	requiredFields := map[string]string{
		"msgid":       "MsgId",
		"credttm":     "CreDtTm",
		"endtoendid":  "EndToEndId",
		"alias":       "Alias",
		"agt":         "Agt",
		"pty":         "Pty",
		"nm":          "Nm",
		"id":          "Id",
		"schmenm":     "SchmeNm",
		"sts":         "Sts",
		"idmodadvc":   "IdModAdvc",
	}
	for token, label := range requiredFields {
		if strings.Contains(lower, token) {
			return fmt.Sprintf("campo requerido ausente o mal escrito; verifique %s", label)
		}
	}
	return "campo requerido ausente o mal escrito; verifique los nombres SIMF (ej. MsgId, EndToEndId)"
}

func extractAdditionalPropertyFromMessage(rawMessage string) string {
	// Ej: "property 'MsgID' is extra"
	for _, sep := range []string{"'", `"`} {
		if i := strings.Index(rawMessage, sep); i >= 0 {
			rest := rawMessage[i+len(sep):]
			if j := strings.Index(rest, sep); j > 0 {
				return rest[:j]
			}
		}
	}
	return ""
}

func containsString(values []string, target string) bool {
	for _, value := range values {
		if value == target {
			return true
		}
	}
	return false
}
