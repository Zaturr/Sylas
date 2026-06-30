package simf

// --- Request: IdModAdvc (PUT /simf/bdca/v1/aliases/update/{Alias}/{Agt}) ---

// UpdateAliasSimfMessage envoltorio raíz del JSON de petición de actualización.
type UpdateAliasSimfMessage struct {
	IdModAdvc UpdateAliasSimfRequest `json:"IdModAdvc"`
}

// UpdateAliasSimfRequest cuerpo del mensaje IdModAdvc para actualización.
type UpdateAliasSimfRequest struct {
	GrpHdr GroupHeader        `json:"GrpHdr"`
	Mod    UpdateAliasSimfMod `json:"Mod"`
}

// UpdateAliasSimfMod datos de actualización de estado alias-agente.
type UpdateAliasSimfMod struct {
	EndToEndID string `json:"EndToEndId"`
	Alias      string `json:"Alias"`
	AgentCode  string `json:"Agt"`
	Status     string `json:"Sts"`
}

// UpdateAliasCommand agrupa el request validado (path + body) listo para el core.
type UpdateAliasCommand struct {
	MsgID      string
	CreDtTm    string
	EndToEndID string
	Alias      string
	AgentCode  string
	Status     string
}

// --- Response: IdVrfctnRpt ---

// UpdateAliasSimfResponseMessage envoltorio raíz del JSON de respuesta.
type UpdateAliasSimfResponseMessage struct {
	IdVrfctnRpt UpdateAliasSimfResponse `json:"IdVrfctnRpt"`
}

// UpdateAliasSimfResponse cuerpo del mensaje IdVrfctnRpt para actualización.
type UpdateAliasSimfResponse struct {
	GrpHdr       GroupHeader                 `json:"GrpHdr"`
	OrgnlAssgnmt CreateUserSimfOrgnlAssgnmt  `json:"OrgnlAssgnmt"`
	Report       CreateUserSimfReport        `json:"Rpt"`
	Mod          *UpdateAliasSimfResponseMod `json:"Mod,omitempty"`
}

// UpdateAliasSimfResponseMod eco del Mod actualizado con Pty (solo en ACCP).
type UpdateAliasSimfResponseMod struct {
	Alias     string                `json:"Alias"`
	AgentCode string                `json:"Agt"`
	Status    string                `json:"Sts"`
	Titular   CreateUserSimfTitular `json:"Pty"`
}
