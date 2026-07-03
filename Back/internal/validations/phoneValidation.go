package validations

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

var (
	VenezuelaMobilePrefixes = []string{"0412", "0414", "0416", "0424", "0426"}
	reVenezuelaMobilePhone  = regexp.MustCompile(`^0(412|414|416|424|426)\d{7}$`)
)

// IsValidVenezuelanPhone valida móviles venezolanos: 04XX + 7 dígitos (11 en total).
func IsValidVenezuelanPhone(phone string) bool {
	return reVenezuelaMobilePhone.MatchString(strings.TrimSpace(phone))
}

// ValidateVenezuelanPhone devuelve mensaje de error si el formato no es válido.
func ValidateVenezuelanPhone(phone string) string {
	trimmed := strings.TrimSpace(phone)
	if trimmed == "" {
		return "phone es requerido"
	}
	if !IsValidVenezuelanPhone(trimmed) {
		return "phone debe tener formato móvil venezolano (ej. 04121234567)"
	}
	return ""
}

// BuildVenezuelanPhoneFromDocument genera un teléfono móvil venezolano determinístico desde el documento.
func BuildVenezuelanPhoneFromDocument(documentNumber string) string {
	digits := extractDigits(documentNumber)

	var seed int64
	if digits != "" {
		if len(digits) > 9 {
			digits = digits[len(digits)-9:]
		}
		parsed, err := strconv.ParseInt(digits, 10, 64)
		if err == nil {
			seed = parsed
		}
	}

	prefix := VenezuelaMobilePrefixes[seed%int64(len(VenezuelaMobilePrefixes))]
	suffix := seed % 10000000
	return fmt.Sprintf("%s%07d", prefix, suffix)
}

func extractDigits(value string) string {
	var builder strings.Builder
	for _, r := range value {
		if r >= '0' && r <= '9' {
			builder.WriteRune(r)
		}
	}
	return builder.String()
}
