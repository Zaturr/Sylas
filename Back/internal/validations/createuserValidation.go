package validations

import (
	"regexp"
	"strings"
)

var reDigitsOnly = regexp.MustCompile(`^\d+$`)

type CreateUserInput struct {
	DocumentType   string
	DocumentNumber string
	AccountNumbers []string
}

func IsDigitsOnly(value string) bool {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return false
	}
	return reDigitsOnly.MatchString(trimmed)
}

// ValidateCreateUser valida tipo y numero de documento, y cada account_number.
// Devuelve el mensaje de error; cadena vacia si todo es valido.
func ValidateCreateUser(input CreateUserInput) string {
	if msg := ValidateDocumentType(input.DocumentType); msg != "" {
		return msg
	}
	if !IsDigitsOnly(input.DocumentNumber) {
		return "document_number debe contener solo numeros"
	}
	for _, accountNumber := range input.AccountNumbers {
		if !IsValidAccount(accountNumber) {
			return "account_number invalido o no cumple con el formato requerido"
		}
	}
	return ""
}