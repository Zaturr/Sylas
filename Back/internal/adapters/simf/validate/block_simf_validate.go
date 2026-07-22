package validate

import (
	"strings"

	simfdomain "Alias_bdca/Back/internal/domain/simf"
)

// ValidateBlockSimfParams valida coherencia path/body y Sts=BLKD tras el JSON Schema.
func ValidateBlockSimfParams(
	pathAlias, pathAgent string,
	req simfdomain.BlockSimfRequest,
) (simfdomain.BlockSimfCommand, error) {
	pathAlias = strings.TrimSpace(pathAlias)
	pathAgent = strings.TrimSpace(pathAgent)

	if err := ValidateAlias(pathAlias); err != nil {
		return simfdomain.BlockSimfCommand{}, err
	}
	if err := ValidateAgentCode(pathAgent); err != nil {
		return simfdomain.BlockSimfCommand{}, err
	}
	if err := ValidateBlockStatus(req.Mod.Status); err != nil {
		return simfdomain.BlockSimfCommand{}, err
	}

	cmd := simfdomain.BlockSimfCommand{
		MsgID:      strings.TrimSpace(req.GrpHdr.MsgID),
		CreDtTm:    strings.TrimSpace(req.GrpHdr.CreDtTm),
		EndToEndID: strings.TrimSpace(req.Mod.EndToEndID),
		Alias:      strings.TrimSpace(req.Mod.Alias),
		AgentCode:  strings.TrimSpace(req.Mod.AgentCode),
		Status:     strings.TrimSpace(req.Mod.Status),
	}

	if cmd.Alias != pathAlias {
		return simfdomain.BlockSimfCommand{}, formatErr("Alias", "alias del path no coincide con el body")
	}
	if cmd.AgentCode != pathAgent {
		return simfdomain.BlockSimfCommand{}, formatErr("Agt", "agente del path no coincide con el body")
	}

	return cmd, nil
}

func ValidateBlockStatus(status string) error {
	if strings.TrimSpace(status) != simfdomain.StatusBlocked {
		return formatErr("Sts", "estado debe ser BLKD para bloqueo")
	}
	return nil
}
