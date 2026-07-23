package simf

import (
	"Alias_bdca/Back/internal/ports"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes monta los endpoints del adaptador SIMF sobre el router de Gin.
func RegisterRoutes(r *gin.Engine, h *SIMFHandler, bus ports.EventBus) {
	bdca := r.Group("/simf/bdca/v1")

	if bus != nil {
		bdca.Use(TraceMiddleware(bus))
	}

	{
		bdca.GET("/aliases/:Alias/resolutions/:Agt_Destino", h.AntiphishingSimf)
		bdca.GET("/identities/:SchmeNm/:Id/Alias", h.ResolveAliasByDocument)
		bdca.GET("/identities/:SchmeNm/:Id/alias/:Agt", h.ResolveAliasByDocumentWithAgent)
		bdca.POST("/aliases", h.CreateUserSimf)
		bdca.PUT("/aliases/update/:Alias/:Agt", h.UpdateAliasSimf)
		bdca.PUT("/aliases/delete/:Alias/:Agt", h.BlockSimf)
	}
}
