package validate

import (
	"strings"

	simfdomain "Alias_bdca/Back/internal/domain/simf"
)

// ValidateAntiphishingSimfParams valida path params del GET anti-phishing.
func ValidateAntiphishingSimfParams(aliasValue, destinationAgent string) (simfdomain.AntiphishingSimfQuery, error) {
	aliasValue = strings.TrimSpace(aliasValue)
	destinationAgent = strings.TrimSpace(destinationAgent)

	if err := ValidateAlias(aliasValue); err != nil {
		return simfdomain.AntiphishingSimfQuery{}, err
	}
	if err := ValidateAgentCode(destinationAgent); err != nil {
		return simfdomain.AntiphishingSimfQuery{}, err
	}

	return simfdomain.AntiphishingSimfQuery{
		Alias:            aliasValue,
		DestinationAgent: destinationAgent,
	}, nil
}
