package corexml

import (
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine, h *Handler) {
	// Mismas rutas SIMF estándar; en el core solo XML (servicio 3).
	core := r.Group("/simf/bdca/v1")
	core.Use(rejectNonXMLBody())
	{
		core.GET("/aliases/:Alias/resolutions/:Agt_Destino", h.AntiphishingSimf)
		core.GET("/identities/:SchmeNm/:Id/Alias", h.ResolveAliasByDocument)
		core.GET("/identities/:SchmeNm/:Id/alias/:Agt", h.ResolveAliasByDocumentWithAgent)
		core.POST("/aliases", h.CreateUserSimf)
		core.PUT("/aliases/update/:Alias/:Agt", h.UpdateAliasSimf)
		core.PUT("/aliases/delete/:Alias/:Agt", h.BlockSimf)
	}
}
