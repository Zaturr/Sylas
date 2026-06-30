package simf

// --- Request: IdModAdvc (PUT /simf/bdca/v1/aliases/delete/{Alias}/{Agt}) ---

// BlockSimfMessage envoltorio raíz del JSON de petición de bloqueo/eliminación global.
type BlockSimfMessage struct {
	IdModAdvc BlockSimfRequest `json:"IdModAdvc"`
}

// BlockSimfRequest cuerpo del mensaje IdModAdvc para bloqueo.
type BlockSimfRequest struct {
	GrpHdr GroupHeader   `json:"GrpHdr"`
	Mod    BlockSimfMod  `json:"Mod"`
}

// BlockSimfMod datos de bloqueo alias-agente (Sts debe ser BLKD).
type BlockSimfMod struct {
	EndToEndID string `json:"EndToEndId"`
	Alias      string `json:"Alias"`
	AgentCode  string `json:"Agt"`
	Status     string `json:"Sts"`
}

// BlockSimfCommand agrupa el request validado (path + body) listo para el core.
type BlockSimfCommand struct {
	MsgID      string
	CreDtTm    string
	EndToEndID string
	Alias      string
	AgentCode  string
	Status     string
}

// --- Response: IdVrfctnRpt ---

// BlockSimfResponseMessage envoltorio raíz del JSON de respuesta de bloqueo.
type BlockSimfResponseMessage struct {
	IdVrfctnRpt BlockSimfResponse `json:"IdVrfctnRpt"`
}

// BlockSimfResponse cuerpo del mensaje IdVrfctnRpt para bloqueo.
type BlockSimfResponse struct {
	GrpHdr       GroupHeader              `json:"GrpHdr"`
	OrgnlAssgnmt CreateUserSimfOrgnlAssgnmt `json:"OrgnlAssgnmt"`
	Report       CreateUserSimfReport     `json:"Rpt"`
	Mod          *BlockSimfResponseMod    `json:"Mod,omitempty"`
}

// BlockSimfResponseMod eco del Mod bloqueado con Pty (solo en ACCP).
type BlockSimfResponseMod struct {
	Alias     string                `json:"Alias"`
	AgentCode string                `json:"Agt"`
	Status    string                `json:"Sts"`
	Titular   CreateUserSimfTitular `json:"Pty"`
}
