package validate

import (
	"strings"

	simfdomain "Alias_bdsa/Back/internal/domain/simf"
)

// ValidateCreateUserSimfRequest valida el mensaje IdModAdvc y devuelve el comando de dominio.
func ValidateCreateUserSimfRequest(req simfdomain.CreateUserSimfRequest) (simfdomain.CreateUserSimfCommand, error) {
	if err := ValidateMsgID(req.GrpHdr.MsgID); err != nil {
		return simfdomain.CreateUserSimfCommand{}, err
	}
	if err := ValidateCreDtTm(req.GrpHdr.CreDtTm); err != nil {
		return simfdomain.CreateUserSimfCommand{}, err
	}
	if err := ValidateAgentCode(req.Mod.AgentCode); err != nil {
		return simfdomain.CreateUserSimfCommand{}, err
	}
	if err := ValidateEndToEndID(req.Mod.EndToEndID); err != nil {
		return simfdomain.CreateUserSimfCommand{}, err
	}
	if err := ValidateAlias(req.Mod.Alias); err != nil {
		return simfdomain.CreateUserSimfCommand{}, err
	}
	if err := ValidateTitularName(req.Mod.Titular.Name); err != nil {
		return simfdomain.CreateUserSimfCommand{}, err
	}
	if err := ValidateSchemeName(req.Mod.Titular.SchemeName); err != nil {
		return simfdomain.CreateUserSimfCommand{}, err
	}
	if err := ValidateDocumentID(req.Mod.Titular.SchemeName, req.Mod.Titular.DocumentID); err != nil {
		return simfdomain.CreateUserSimfCommand{}, err
	}

	return simfdomain.CreateUserSimfCommand{
		MsgID:       strings.TrimSpace(req.GrpHdr.MsgID),
		CreDtTm:     strings.TrimSpace(req.GrpHdr.CreDtTm),
		AgentCode:   strings.TrimSpace(req.Mod.AgentCode),
		EndToEndID:  strings.TrimSpace(req.Mod.EndToEndID),
		Alias:       strings.TrimSpace(req.Mod.Alias),
		TitularName: strings.TrimSpace(req.Mod.Titular.Name),
		DocumentID:  strings.TrimSpace(req.Mod.Titular.DocumentID),
		SchemeName:  strings.TrimSpace(req.Mod.Titular.SchemeName),
	}, nil
}
