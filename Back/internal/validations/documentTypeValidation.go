package validations

import "strings"

var allowedDocumentTypes = map[string]struct{}{
	"V": {},
	"E": {},
	"J": {},
	"G": {},
	"C": {},
	"P": {},
}

// IsValidDocumentType indica si el tipo de documento es uno de los permitidos.
func IsValidDocumentType(documentType string) bool {
	_, ok := allowedDocumentTypes[strings.ToUpper(strings.TrimSpace(documentType))]
	return ok
}

// ValidateDocumentType devuelve mensaje de error si el tipo no es valido; cadena vacia si lo es.
func ValidateDocumentType(documentType string) string {
	if !IsValidDocumentType(documentType) {
		return "document_type debe ser uno de: V, E, J, G, C, P"
	}
	return ""
}
