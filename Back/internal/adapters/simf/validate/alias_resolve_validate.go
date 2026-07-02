package validate

import (
	"errors"
	"strings"

	simfdomain "Alias_bdca/Back/internal/domain/simf"
)

// ValidateAliasResolveParams valida los path params del endpoint alias resolve
// y devuelve el query de dominio listo para la capa de aplicación.
//
// requireAgent=true  → GET .../identities/{SchmeNm}/{Id}/alias/{Agt}
// requireAgent=false → GET .../identities/{SchmeNm}/{Id}/Alias
func ValidateAliasResolveParams(schemeName, documentID, agentCode string, requireAgent bool) (simfdomain.AliasResolveQuery, error) {
	schemeName = strings.TrimSpace(schemeName)
	documentID = strings.TrimSpace(documentID)
	agentCode = strings.TrimSpace(agentCode)

	if err := ValidateSchemeName(schemeName); err != nil {
		return simfdomain.AliasResolveQuery{}, err
	}
	if err := ValidateDocumentID(schemeName, documentID); err != nil {
		return simfdomain.AliasResolveQuery{}, err
	}

	if requireAgent {
		if agentCode == "" {
			return simfdomain.AliasResolveQuery{}, formatErr("Agt", "codigo de agente requerido")
		}
		if err := ValidateAgentCode(agentCode); err != nil {
			return simfdomain.AliasResolveQuery{}, err
		}
	} else if agentCode != "" {
		if err := ValidateAgentCode(agentCode); err != nil {
			return simfdomain.AliasResolveQuery{}, err
		}
	}

	return simfdomain.AliasResolveQuery{
		SchemeName: schemeName,
		DocumentID: documentID,
		AgentCode:  agentCode,
	}, nil
}

// IsFormatError indica si el error debe mapearse a Result=RJCT y Rsn=RR10.
func IsFormatError(err error) bool {
	var fe FormatError
	return errors.As(err, &fe)
}
