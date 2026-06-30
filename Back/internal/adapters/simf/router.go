package simf

import (
	"github.com/gin-gonic/gin"
)

// RegisterRoutes monta los endpoints del adaptador SIMF sobre el router de Gin.
func RegisterRoutes(r *gin.Engine, h *SIMFHandler) {
	bdca := r.Group("/simf/bdca/v1")
	{
		bdca.GET("/identities/:SchmeNm/:Id/Alias", h.ResolveAliasByDocument)
		bdca.GET("/identities/:SchmeNm/:Id/alias/:Agt", h.ResolveAliasByDocumentWithAgent)
		bdca.POST("/aliases", h.CreateUserSimf)
		bdca.PUT("/aliases/update/:Alias/:Agt", h.UpdateAliasSimf)
		bdca.POST("/aliases/update/:Alias/:Agt", h.UpdateAliasSimf)
	}
}
