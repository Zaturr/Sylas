package domain

import "strings"

// IsLegalEntityDocumentType indica titulares SRIF con soporte multi-alias (J, G, C).
func IsLegalEntityDocumentType(documentType string) bool {
	switch strings.ToUpper(strings.TrimSpace(documentType)) {
	case "J", "G", "C":
		return true
	default:
		return false
	}
}
