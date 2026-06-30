package simf

// --- Request: IdModAdvc (POST /simf/bdca/v1/aliases) ---

// CreateUserSimfMessage envoltorio raíz del JSON de petición.
type CreateUserSimfMessage struct {
	IdModAdvc CreateUserSimfRequest `json:"IdModAdvc"`
}

// CreateUserSimfRequest cuerpo del mensaje IdModAdvc.
type CreateUserSimfRequest struct {
	GrpHdr GroupHeader      `json:"GrpHdr"`
	Mod    CreateUserSimfMod `json:"Mod"`
}

// CreateUserSimfMod datos de alta de alias y vínculo con agente.
type CreateUserSimfMod struct {
	AgentCode  string              `json:"Agt"`
	EndToEndID string              `json:"EndToEndId"`
	Alias      string              `json:"Alias"`
	Titular    CreateUserSimfTitular `json:"Pty"`
}

// CreateUserSimfTitular titular en el mensaje de alta (JSON: Pty).
type CreateUserSimfTitular struct {
	Name       string `json:"Nm"`
	DocumentID string `json:"Id"`
	SchemeName string `json:"SchmeNm"`
}

// CreateUserSimfCommand agrupa el request validado listo para el mapper/core.
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

// --- Response: IdVrfctnRpt ---

// CreateUserSimfResponseMessage envoltorio raíz del JSON de respuesta.
type CreateUserSimfResponseMessage struct {
	IdVrfctnRpt CreateUserSimfResponse `json:"IdVrfctnRpt"`
}

// CreateUserSimfResponse cuerpo del mensaje IdVrfctnRpt.
type CreateUserSimfResponse struct {
	GrpHdr         GroupHeader                 `json:"GrpHdr"`
	OrgnlAssgnmt   CreateUserSimfOrgnlAssgnmt  `json:"OrgnlAssgnmt"`
	Report         CreateUserSimfReport       `json:"Rpt"`
	Mod            *CreateUserSimfResponseMod `json:"Mod,omitempty"`
}

// GroupHeader cabecera SIMF compartida (GrpHdr).
type GroupHeader struct {
	MsgID   string `json:"MsgId"`
	CreDtTm string `json:"CreDtTm"`
}

// CreateUserSimfOrgnlAssgnmt referencia al mensaje original.
type CreateUserSimfOrgnlAssgnmt struct {
	OrgnlMsgID   string `json:"OrgnlMsgId"`
	OrgnlCreDtTm string `json:"OrgnlCreDtTm"`
}

// CreateUserSimfReport resultado de la verificación (Rpt).
type CreateUserSimfReport struct {
	OrgnlEndToEndID string `json:"OrgnlEndToEndId"`
	Result          string `json:"Result"`
	Rsn             string `json:"Rsn"`
}

// CreateUserSimfResponseMod eco del Mod con Sts asignado por la IBP (solo en ACCP).
type CreateUserSimfResponseMod struct {
	Alias     string                `json:"Alias"`
	AgentCode string                `json:"Agt"`
	Status    string                `json:"Sts"`
	Titular   CreateUserSimfTitular `json:"Pty"`
}
