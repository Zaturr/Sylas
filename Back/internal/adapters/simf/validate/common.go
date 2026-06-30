package validate

import (
	"errors"
	"fmt"
	"regexp"
	"strings"

	simfdomain "Alias_bdsa/Back/internal/domain/simf"
)

// ErrFormat indica que un valor no cumple el esquema SIMF (Rsn: RR10).
var ErrFormat = errors.New("error de formato")

// FormatError describe qué campo falló la validación estructural.
type FormatError struct {
	Field   string
	Message string
}

func (e FormatError) Error() string {
	if e.Message != "" {
		return e.Message
	}
	return fmt.Sprintf("formato invalido en %s", e.Field)
}

func (e FormatError) Is(target error) bool {
	return target == ErrFormat
}

var (
	reAlphanumeric   = regexp.MustCompile(`^[A-Za-z0-9]+$`)
	reAgentCode      = regexp.MustCompile(`^[A-Za-z0-9]{4}$`)
	reDocumentIDSCID = regexp.MustCompile(`^[VE][A-Za-z0-9]{0,34}$`)
	reDocumentIDSRIF = regexp.MustCompile(`^[JGCR][0-9]{9}$`)
	reDocumentIDSPAS = regexp.MustCompile(`^P[A-Za-z0-9]{0,34}$`)
	reMsgID      = regexp.MustCompile(`^[A-Za-z0-9]{28}$`)
	reEndToEndID = regexp.MustCompile(`^[A-Za-z0-9]{26}$`)
	reCreDtTm    = regexp.MustCompile(`^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}`)
	reTitularName = regexp.MustCompile(`^[A-Z0-9][A-Z0-9 .,&'\-]*$`)
)

func formatErr(field, message string) error {
	return FormatError{Field: field, Message: message}
}

// ValidateSchemeName valida SchmeNm (SCID | SRIF | SPAS).
func ValidateSchemeName(schemeName string) error {
	switch schemeName {
	case simfdomain.SchemeSCID, simfdomain.SchemeSRIF, simfdomain.SchemeSPAS:
		return nil
	default:
		return formatErr("SchmeNm", "esquema de documento no valido")
	}
}

// ValidateDocumentID valida Id del titular según el esquema (1-35 chars alfanuméricos, sin espacios).
func ValidateDocumentID(schemeName, documentID string) error {
	if documentID == "" || len(documentID) > 35 {
		return formatErr("Id", "identificacion fuera de rango")
	}
	if !reAlphanumeric.MatchString(documentID) {
		return formatErr("Id", "identificacion con caracteres no permitidos")
	}

	switch schemeName {
	case simfdomain.SchemeSCID:
		if !reDocumentIDSCID.MatchString(documentID) {
			return formatErr("Id", "cedula invalida para SCID")
		}
	case simfdomain.SchemeSRIF:
		if !reDocumentIDSRIF.MatchString(documentID) {
			return formatErr("Id", "RIF invalido para SRIF")
		}
	case simfdomain.SchemeSPAS:
		if !reDocumentIDSPAS.MatchString(documentID) {
			return formatErr("Id", "pasaporte invalido para SPAS")
		}
	}

	return nil
}

// ValidateAgentCode valida Agt (exactamente 4 caracteres alfanuméricos).
func ValidateAgentCode(agentCode string) error {
	if !reAgentCode.MatchString(agentCode) {
		return formatErr("Agt", "codigo de agente invalido")
	}
	return nil
}

// ValidateAlias valida Alias (6-15 minúsculas, punto como único especial).
func ValidateAlias(alias string) error {
	if len(alias) < 6 || len(alias) > 15 {
		return formatErr("Alias", "longitud de alias invalida")
	}
	if strings.HasPrefix(alias, ".") || strings.HasSuffix(alias, ".") || strings.Contains(alias, "..") {
		return formatErr("Alias", "formato de alias invalido")
	}

	segments := strings.Split(alias, ".")
	for _, segment := range segments {
		if segment == "" {
			return formatErr("Alias", "formato de alias invalido")
		}
		for _, r := range segment {
			if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
				continue
			}
			return formatErr("Alias", "formato de alias invalido")
		}
	}

	return nil
}

// ValidateMsgID valida MsgId (28 caracteres alfanuméricos).
func ValidateMsgID(msgID string) error {
	if !reMsgID.MatchString(msgID) {
		return formatErr("MsgId", "identificador de mensaje invalido")
	}
	return nil
}

// ValidateEndToEndID valida EndToEndId (26 caracteres alfanuméricos).
func ValidateEndToEndID(endToEndID string) error {
	if !reEndToEndID.MatchString(endToEndID) {
		return formatErr("EndToEndId", "identificador transaccional invalido")
	}
	return nil
}

// ValidateCreDtTm valida fecha ISO 8601 (YYYY-MM-DDThh:mm:ss).
func ValidateCreDtTm(creDtTm string) error {
	creDtTm = strings.TrimSpace(creDtTm)
	if !reCreDtTm.MatchString(creDtTm) {
		return formatErr("CreDtTm", "fecha invalida")
	}
	return nil
}

// ValidateSimfStatus valida Sts para actualización (ACTV | INAC | PNDL | BLKD).
func ValidateSimfStatus(status string) error {
	switch status {
	case simfdomain.StatusActive,
		simfdomain.StatusInactive,
		simfdomain.StatusPendingDrop,
		simfdomain.StatusBlocked:
		return nil
	default:
		return formatErr("Sts", "estado de alias invalido")
	}
}

// ValidateTitularName valida Nm del titular (1-140 mayúsculas, patrón alfanumérico SIMF).
func ValidateTitularName(name string) error {
	if name == "" || len(name) > 140 {
		return formatErr("Nm", "nombre fuera de rango")
	}
	if !reTitularName.MatchString(name) {
		return formatErr("Nm", "nombre debe ir en mayusculas")
	}
	return nil
}
