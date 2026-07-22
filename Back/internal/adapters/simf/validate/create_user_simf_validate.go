package validate

import (
	"strings"

	simfdomain "Alias_bdca/Back/internal/domain/simf"
)

// ValidateCreateUserSimfRequest mapea el IdModAdvc ya validado por JSON Schema al comando de dominio.
func ValidateCreateUserSimfRequest(req simfdomain.CreateUserSimfRequest) (simfdomain.CreateUserSimfCommand, error) {
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
