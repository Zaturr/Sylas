package main

import (
	"embed"
	"io/fs"
	"net/http"
	"path"
	"strings"

	"github.com/gin-gonic/gin"
)

//go:embed all:web
var embeddedWeb embed.FS

// registerWebUI sirve el frontend embebido (Front/dist copiado a web/)
// y hace fallback SPA a index.html para rutas del cliente React.
// No intercepta /api ni /simf.
func registerWebUI(r *gin.Engine) error {
	sub, err := fs.Sub(embeddedWeb, "web")
	if err != nil {
		return err
	}

	fileServer := http.FileServer(http.FS(sub))

	r.NoRoute(func(c *gin.Context) {
		reqPath := c.Request.URL.Path

		if strings.HasPrefix(reqPath, "/api/") || strings.HasPrefix(reqPath, "/simf/") {
			c.JSON(http.StatusNotFound, gin.H{"error": "ruta no encontrada"})
			return
		}

		rel := strings.TrimPrefix(path.Clean(reqPath), "/")
		if rel == "." || rel == "" {
			rel = "index.html"
		}

		// config.json siempre viene de disco (registerConfigFileRoute), no del embed.
		if rel == "config.json" {
			c.JSON(http.StatusNotFound, gin.H{"error": "config.json debe servirse desde disco"})
			return
		}

		if f, err := sub.Open(rel); err == nil {
			_ = f.Close()
			fileServer.ServeHTTP(c.Writer, c.Request)
			return
		}

		// SPA: rutas sin archivo real (ej. /dashboard) → index.html
		if looksLikeStaticAsset(rel) {
			c.Status(http.StatusNotFound)
			return
		}

		c.Request.URL.Path = "/"
		fileServer.ServeHTTP(c.Writer, c.Request)
	})

	return nil
}

func looksLikeStaticAsset(rel string) bool {
	base := path.Base(rel)
	return strings.Contains(base, ".")
}
