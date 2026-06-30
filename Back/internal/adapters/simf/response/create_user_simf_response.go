package response

import (
	"Alias_bdsa/Back/internal/adapters/simf/mapper"
	simfdomain "Alias_bdsa/Back/internal/domain/simf"
)

// BuildCreateUserFormatErrorMessage responde IdVrfctnRpt con RJCT + RR10 (sin Mod).
func BuildCreateUserFormatErrorMessage(cmd simfdomain.CreateUserSimfCommand) simfdomain.CreateUserSimfResponseMessage {
	return buildCreateUserSimfResponse(cmd, simfdomain.ResultReject, simfdomain.ReasonFormat, nil)
}

// BuildCreateUserRejectMessage responde IdVrfctnRpt con RJCT y el Rsn indicado (sin Mod).
func BuildCreateUserRejectMessage(cmd simfdomain.CreateUserSimfCommand, reasonCode string) simfdomain.CreateUserSimfResponseMessage {
	return buildCreateUserSimfResponse(cmd, simfdomain.ResultReject, reasonCode, nil)
}

// BuildCreateUserAcceptMessage responde IdVrfctnRpt con ACCP, Mod y Sts INAC (inactivo local).
func BuildCreateUserAcceptMessage(cmd simfdomain.CreateUserSimfCommand) simfdomain.CreateUserSimfResponseMessage {
	mod := &simfdomain.CreateUserSimfResponseMod{
		Alias:     cmd.Alias,
		AgentCode: cmd.AgentCode,
		Status:    simfdomain.StatusInactive,
		Titular:   mapper.TitularFromCreateUserCommand(cmd),
	}
	return buildCreateUserSimfResponse(cmd, simfdomain.ResultAccept, simfdomain.ReasonNone, mod)
}

func buildCreateUserSimfResponse(
	cmd simfdomain.CreateUserSimfCommand,
	resultCode, reasonCode string,
	mod *simfdomain.CreateUserSimfResponseMod,
) simfdomain.CreateUserSimfResponseMessage {
	return simfdomain.CreateUserSimfResponseMessage{
		IdVrfctnRpt: simfdomain.CreateUserSimfResponse{
			GrpHdr: NewGroupHeader(cmd.AgentCode),
			OrgnlAssgnmt: simfdomain.CreateUserSimfOrgnlAssgnmt{
				OrgnlMsgID:   cmd.MsgID,
				OrgnlCreDtTm: cmd.CreDtTm,
			},
			Report: simfdomain.CreateUserSimfReport{
				OrgnlEndToEndID: cmd.EndToEndID,
				Result:          resultCode,
				Rsn:             reasonCode,
			},
			Mod: mod,
		},
	}
}
