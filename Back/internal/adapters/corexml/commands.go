package corexml

import simfdomain "Alias_bdca/Back/internal/domain/simf"

func partialCreateUserCommand(req simfdomain.CreateUserSimfRequest) simfdomain.CreateUserSimfCommand {
	return simfdomain.CreateUserSimfCommand{
		MsgID:       req.GrpHdr.MsgID,
		CreDtTm:     req.GrpHdr.CreDtTm,
		AgentCode:   req.Mod.AgentCode,
		EndToEndID:  req.Mod.EndToEndID,
		Alias:       req.Mod.Alias,
		TitularName: req.Mod.Titular.Name,
		DocumentID:  req.Mod.Titular.DocumentID,
		SchemeName:  req.Mod.Titular.SchemeName,
	}
}

func partialUpdateAliasCommand(req simfdomain.UpdateAliasSimfRequest) simfdomain.UpdateAliasCommand {
	return simfdomain.UpdateAliasCommand{
		MsgID:      req.GrpHdr.MsgID,
		CreDtTm:    req.GrpHdr.CreDtTm,
		EndToEndID: req.Mod.EndToEndID,
		Alias:      req.Mod.Alias,
		AgentCode:  req.Mod.AgentCode,
		Status:     req.Mod.Status,
	}
}

func partialBlockSimfCommand(req simfdomain.BlockSimfRequest) simfdomain.BlockSimfCommand {
	return simfdomain.BlockSimfCommand{
		MsgID:      req.GrpHdr.MsgID,
		CreDtTm:    req.GrpHdr.CreDtTm,
		EndToEndID: req.Mod.EndToEndID,
		Alias:      req.Mod.Alias,
		AgentCode:  req.Mod.AgentCode,
		Status:     req.Mod.Status,
	}
}
