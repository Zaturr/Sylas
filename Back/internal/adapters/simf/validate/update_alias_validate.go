package validate

import (
	"strings"

	simfdomain "Alias_bdsa/Back/internal/domain/simf"
)

// ValidateUpdateAliasParams valida path params + body IdModAdvc de actualización.
func ValidateUpdateAliasParams(
	pathAlias, pathAgent string,
	req simfdomain.UpdateAliasSimfRequest,
) (simfdomain.UpdateAliasCommand, error) {
	pathAlias = strings.TrimSpace(pathAlias)
	pathAgent = strings.TrimSpace(pathAgent)

	if err := ValidateAlias(pathAlias); err != nil {
		return simfdomain.UpdateAliasCommand{}, err
	}
	if err := ValidateAgentCode(pathAgent); err != nil {
		return simfdomain.UpdateAliasCommand{}, err
	}
	if err := ValidateMsgID(req.GrpHdr.MsgID); err != nil {
		return simfdomain.UpdateAliasCommand{}, err
	}
	if err := ValidateCreDtTm(req.GrpHdr.CreDtTm); err != nil {
		return simfdomain.UpdateAliasCommand{}, err
	}
	if err := ValidateEndToEndID(req.Mod.EndToEndID); err != nil {
		return simfdomain.UpdateAliasCommand{}, err
	}
	if err := ValidateAlias(req.Mod.Alias); err != nil {
		return simfdomain.UpdateAliasCommand{}, err
	}
	if err := ValidateAgentCode(req.Mod.AgentCode); err != nil {
		return simfdomain.UpdateAliasCommand{}, err
	}
	if err := ValidateSimfStatus(req.Mod.Status); err != nil {
		return simfdomain.UpdateAliasCommand{}, err
	}

	cmd := simfdomain.UpdateAliasCommand{
		MsgID:      strings.TrimSpace(req.GrpHdr.MsgID),
		CreDtTm:    strings.TrimSpace(req.GrpHdr.CreDtTm),
		EndToEndID: strings.TrimSpace(req.Mod.EndToEndID),
		Alias:      strings.TrimSpace(req.Mod.Alias),
		AgentCode:  strings.TrimSpace(req.Mod.AgentCode),
		Status:     strings.TrimSpace(req.Mod.Status),
	}

	if cmd.Alias != pathAlias {
		return simfdomain.UpdateAliasCommand{}, formatErr("Alias", "alias del path no coincide con el body")
	}
	if cmd.AgentCode != pathAgent {
		return simfdomain.UpdateAliasCommand{}, formatErr("Agt", "agente del path no coincide con el body")
	}

	return cmd, nil
}
