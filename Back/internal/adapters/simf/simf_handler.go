package simf

import (
	"Alias_bdca/Back/internal/ports"
)

// SIMFHandler expone los endpoints del protocolo SIMF.
type SIMFHandler struct {
	core ports.AliasService
}

// NewSIMFHandler crea el handler inyectando el servicio del core.
func NewSIMFHandler(core ports.AliasService) *SIMFHandler {
	return &SIMFHandler{core: core}
}
