package main

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// registerConfigFileRoute expone GET /config.json leyendo siempre el archivo
// editable en disco (nunca el embebido en web/). Así se puede cambiar la
// configuración después del build sin recompilar.
func registerConfigFileRoute(r *gin.Engine, configPath string) {
	r.GET("/config.json", func(c *gin.Context) {
		if configPath == "" {
			c.JSON(http.StatusNotFound, gin.H{"error": "config.json no disponible"})
			return
		}

		data, err := os.ReadFile(configPath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "no se pudo leer config.json",
				"path":  configPath,
			})
			return
		}

		c.Header("Cache-Control", "no-store, no-cache, must-revalidate")
		c.Header("Pragma", "no-cache")
		c.Data(http.StatusOK, "application/json; charset=utf-8", data)
	})
}
