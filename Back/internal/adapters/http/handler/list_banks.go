package handler

import "github.com/gin-gonic/gin"

// ListBanks retorna el catálogo de bancos disponibles para formularios.
func (h *HTTPHandler) ListBanks(c *gin.Context) {
	banks, err := h.service.GetBanks(c.Request.Context())
	if err != nil {
		respondError(c, 500, "No se pudieron obtener los bancos")
		return
	}

	c.JSON(200, banks)
}
