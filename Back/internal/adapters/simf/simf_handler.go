package simf

import (
	"Alias_bdsa/Back/internal/ports"
)

// SIMFHandler expone los endpoints del protocolo SIMF.
// Delega toda la lógica de negocio al core (AliasService / AppService).
type SIMFHandler struct {
	core ports.AliasService
}

// NewSIMFHandler crea el handler inyectando el servicio del core.
func NewSIMFHandler(core ports.AliasService) *SIMFHandler {
	return &SIMFHandler{core: core}
}
