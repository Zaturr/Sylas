package validations

import (
	"fmt"
	"strings"
)

const GmailDomain = "@gmail.com"

// EnsureGmailAddress fuerza el dominio @gmail.com conservando la parte local.
func EnsureGmailAddress(email string) string {
	trimmed := strings.TrimSpace(strings.ToLower(email))
	if trimmed == "" {
		return ""
	}

	localPart := trimmed
	if at := strings.Index(trimmed, "@"); at >= 0 {
		localPart = trimmed[:at]
	}

	localPart = sanitizeEmailLocalPart(localPart)
	if localPart == "" {
		localPart = "usuario"
	}

	return localPart + GmailDomain
}

// BuildGmailFromCustomer genera un correo @gmail.com desde nombre y documento.
func BuildGmailFromCustomer(firstName, lastName, documentNumber string) string {
	first := sanitizeEmailLocalPart(strings.ToLower(strings.TrimSpace(firstName)))
	last := sanitizeEmailLocalPart(strings.ToLower(strings.TrimSpace(lastName)))
	suffix := documentEmailSuffix(documentNumber)

	if first == "" && last == "" {
		return fmt.Sprintf("usuario%s%s", suffix, GmailDomain)
	}
	if last == "" {
		return fmt.Sprintf("%s%s%s", first, suffix, GmailDomain)
	}
	if first == "" {
		return fmt.Sprintf("%s%s%s", last, suffix, GmailDomain)
	}

	return fmt.Sprintf("%s.%s%s%s", first, last, suffix, GmailDomain)
}

// BuildGmailFromAlias genera un correo @gmail.com desde el alias.
func BuildGmailFromAlias(alias string) string {
	localPart := sanitizeEmailLocalPart(strings.ToLower(strings.TrimSpace(alias)))
	if localPart == "" {
		localPart = "usuario"
	}
	return localPart + GmailDomain
}

func documentEmailSuffix(documentNumber string) string {
	digits := extractDigits(documentNumber)
	if len(digits) > 4 {
		digits = digits[len(digits)-4:]
	}
	if digits == "" {
		return ""
	}
	return digits
}

func sanitizeEmailLocalPart(value string) string {
	var builder strings.Builder
	for _, r := range strings.ToLower(value) {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '.' || r == '_' {
			builder.WriteRune(r)
		}
	}
	return strings.Trim(builder.String(), ".")
}
