package simf

type CreateUserSimfMessage struct {
	IdModAdvc CreateUserSimfRequest `json:"IdModAdvc" xml:"IdModAdvc"`
}

type CreateUserSimfRequest struct {
	GrpHdr GroupHeader       `json:"GrpHdr" xml:"GrpHdr"`
	Mod    CreateUserSimfMod `json:"Mod" xml:"Mod"`
}

type CreateUserSimfMod struct {
	EndToEndID string                `json:"EndToEndId" xml:"EndToEndId"`
	Alias      string                `json:"Alias" xml:"Alias"`
	AgentCode  string                `json:"Agt" xml:"Agt"`
	Titular    CreateUserSimfTitular `json:"Pty" xml:"Pty"`
}

type CreateUserSimfTitular struct {
	Name       string `json:"Nm" xml:"Nm"`
	DocumentID string `json:"Id" xml:"Id"`
	SchemeName string `json:"SchmeNm" xml:"SchmeNm"`
}

type CreateUserSimfCommand struct {
	MsgID       string
	CreDtTm     string
	AgentCode   string
	EndToEndID  string
	Alias       string
	TitularName string
	DocumentID  string
	SchemeName  string
}

type CreateUserSimfResponseMessage struct {
	IdVrfctnRpt CreateUserSimfResponse `json:"IdVrfctnRpt" xml:"IdVrfctnRpt"`
}

type CreateUserSimfResponse struct {
	GrpHdr       GroupHeader                `json:"GrpHdr" xml:"GrpHdr"`
	OrgnlAssgnmt CreateUserSimfOrgnlAssgnmt `json:"OrgnlAssgnmt" xml:"OrgnlAssgnmt"`
	Report       CreateUserSimfReport       `json:"Rpt" xml:"Rpt"`
	Mod          *CreateUserSimfResponseMod `json:"Mod,omitempty" xml:"Mod,omitempty"`
}

type GroupHeader struct {
	MsgID   string `json:"MsgId" xml:"MsgId"`
	CreDtTm string `json:"CreDtTm" xml:"CreDtTm"`
}

type CreateUserSimfOrgnlAssgnmt struct {
	OrgnlMsgID   string `json:"OrgnlMsgId" xml:"OrgnlMsgId"`
	OrgnlCreDtTm string `json:"OrgnlCreDtTm" xml:"OrgnlCreDtTm"`
}

type CreateUserSimfReport struct {
	OrgnlEndToEndID string `json:"OrgnlEndToEndId" xml:"OrgnlEndToEndId"`
	Result          string `json:"Result" xml:"Result"`
	Rsn             string `json:"Rsn" xml:"Rsn"`
}

type CreateUserSimfResponseMod struct {
	Alias     string                `json:"Alias" xml:"Alias"`
	AgentCode string                `json:"Agt" xml:"Agt"`
	Status    string                `json:"Sts" xml:"Sts"`
	Titular   CreateUserSimfTitular `json:"Pty" xml:"Pty"`
}
