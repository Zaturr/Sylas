package main

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const defaultPort = "8080"

//go:embed default_config.json
var defaultConfigJSON []byte

// runtimeFileConfig es la parte del config.json que el backend necesita al arrancar.
// El resto (SIMULATION, etc.) lo consume el frontend en el navegador.
type runtimeFileConfig struct {
	Port          string `json:"PORT"`
	PublicBaseURL string `json:"PUBLIC_BASE_URL"`
}

func loadRuntimeConfig() (runtimeFileConfig, string, error) {
	configPath, err := ensureConfigFile()
	if err != nil {
		return runtimeFileConfig{Port: defaultPort}, "", err
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		return runtimeFileConfig{Port: defaultPort}, configPath, fmt.Errorf("no se pudo leer %s: %w", configPath, err)
	}

	var cfg runtimeFileConfig
	if err := json.Unmarshal(data, &cfg); err != nil {
		return runtimeFileConfig{Port: defaultPort}, configPath, fmt.Errorf("config.json inválido (%s): %w", configPath, err)
	}

	if strings.TrimSpace(cfg.Port) == "" {
		cfg.Port = defaultPort
	}

	return cfg, configPath, nil
}

func loadListenAddr() (addr string, configPath string, err error) {
	cfg, configPath, err := loadRuntimeConfig()
	if err != nil {
		return ":" + defaultPort, configPath, fmt.Errorf("usando puerto por defecto %s: %w", defaultPort, err)
	}

	port := strings.TrimPrefix(strings.TrimSpace(cfg.Port), ":")
	return ":" + port, configPath, nil
}

func loadPublicBaseURL() string {
	cfg, _, err := loadRuntimeConfig()
	if err != nil {
		return ""
	}
	return strings.TrimSpace(cfg.PublicBaseURL)
}

// ensureConfigFile localiza un config.json editable en disco.
// Si no existe ninguno, crea uno por defecto junto al ejecutable (o en el cwd si es go run).
func ensureConfigFile() (string, error) {
	if path, err := resolveConfigPath(); err == nil {
		return path, nil
	}

	target, err := preferredConfigWritePath()
	if err != nil {
		return "", err
	}

	if err := os.WriteFile(target, defaultConfigJSON, 0o644); err != nil {
		return "", fmt.Errorf("no se pudo crear config.json en %s: %w", target, err)
	}

	return target, nil
}

func preferredConfigWritePath() (string, error) {
	if exe, err := os.Executable(); err == nil {
		exeDir := filepath.Dir(exe)
		if !isEphemeralGoRunDir(exeDir) {
			return filepath.Join(exeDir, "config.json"), nil
		}
	}

	cwd, err := os.Getwd()
	if err != nil {
		return "", err
	}
	return filepath.Join(cwd, "config.json"), nil
}

func isEphemeralGoRunDir(dir string) bool {
	abs, err := filepath.Abs(dir)
	if err != nil {
		return false
	}
	lower := strings.ToLower(abs)
	return strings.Contains(lower, string(filepath.Separator)+"go-build") ||
		strings.Contains(lower, strings.ToLower(os.TempDir()))
}

func resolveConfigPath() (string, error) {
	candidates := make([]string, 0, 6)

	if exe, err := os.Executable(); err == nil {
		exeDir := filepath.Dir(exe)
		if !isEphemeralGoRunDir(exeDir) {
			candidates = append(candidates, filepath.Join(exeDir, "config.json"))
		}
	}

	if cwd, err := os.Getwd(); err == nil {
		candidates = append(candidates,
			filepath.Join(cwd, "config.json"),
			filepath.Join(cwd, "install", "config.json"),
			filepath.Join(cwd, "..", "..", "..", "install", "config.json"), // desde Back/cmd/simulador
			filepath.Join(cwd, "..", "..", "..", "Front", "public", "config.json"),
		)
	}

	for _, path := range candidates {
		abs, err := filepath.Abs(path)
		if err != nil {
			continue
		}
		if info, err := os.Stat(abs); err == nil && !info.IsDir() {
			return abs, nil
		}
	}

	return "", fmt.Errorf("no se encontró config.json cerca del ejecutable ni en rutas conocidas")
}
