package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

type Observability struct {
	TraceEnabled        bool
	TraceBufferSize     int
	TraceFilesEnabled   bool
	TraceFilesDir       string
	ScribeFilePath      string
	ScribeMinLevel      string
	ScribeConsole       bool
	ScribeFile          bool
	ScribeRotationMaxMB int
	ScribeMaxBackups    int
	ScribeMaxAgeDay     int
	ScribeCompress      bool
}

type observabilityFileConfig struct {
	TRACE_ENABLED          *bool  `json:"TRACE_ENABLED"`
	TRACE_BUFFER_SIZE      int    `json:"TRACE_BUFFER_SIZE"`
	TRACE_FILES_ENABLED    *bool  `json:"TRACE_FILES_ENABLED"`
	TRACE_FILES_DIR        string `json:"TRACE_FILES_DIR"`
	SCRIBE_FILE_PATH       string `json:"SCRIBE_FILE_PATH"`
	SCRIBE_MIN_LEVEL       string `json:"SCRIBE_MIN_LEVEL"`
	SCRIBE_CONSOLE         *bool  `json:"SCRIBE_CONSOLE"`
	SCRIBE_FILE            *bool  `json:"SCRIBE_FILE"`
	SCRIBE_ROTATION_MAX_MB int    `json:"SCRIBE_ROTATION_MAX_MB"`
	SCRIBE_MAX_BACKUPS     int    `json:"SCRIBE_MAX_BACKUPS"`
	SCRIBE_MAX_AGE_DAY     int    `json:"SCRIBE_MAX_AGE_DAY"`
	SCRIBE_COMPRESS        *bool  `json:"SCRIBE_COMPRESS"`
}

func DefaultObservability() Observability {
	return Observability{
		TraceEnabled:        true,
		TraceBufferSize:     1024,
		TraceFilesEnabled:   false,
		TraceFilesDir:       "logs/traces",
		ScribeFilePath:      "logs",
		ScribeMinLevel:      "trace",
		ScribeConsole:       true,
		ScribeFile:          true,
		ScribeRotationMaxMB: 10,
		ScribeMaxBackups:    5,
		ScribeMaxAgeDay:     30,
		ScribeCompress:      false,
	}
}

func LoadObservability(configPath string) (Observability, error) {
	cfg := DefaultObservability()
	if configPath == "" {
		return cfg, nil
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		return cfg, fmt.Errorf("leer config para observabilidad: %w", err)
	}

	var file observabilityFileConfig
	if err := json.Unmarshal(data, &file); err != nil {
		return cfg, fmt.Errorf("parsear observabilidad en config: %w", err)
	}

	if file.TRACE_ENABLED != nil {
		cfg.TraceEnabled = *file.TRACE_ENABLED
	}
	if file.TRACE_BUFFER_SIZE > 0 {
		cfg.TraceBufferSize = file.TRACE_BUFFER_SIZE
	}
	if file.TRACE_FILES_ENABLED != nil {
		cfg.TraceFilesEnabled = *file.TRACE_FILES_ENABLED
	}
	if file.TRACE_FILES_DIR != "" {
		cfg.TraceFilesDir = file.TRACE_FILES_DIR
	}
	if file.SCRIBE_FILE_PATH != "" {
		cfg.ScribeFilePath = file.SCRIBE_FILE_PATH
	}
	if file.SCRIBE_MIN_LEVEL != "" {
		cfg.ScribeMinLevel = file.SCRIBE_MIN_LEVEL
	}
	if file.SCRIBE_CONSOLE != nil {
		cfg.ScribeConsole = *file.SCRIBE_CONSOLE
	}
	if file.SCRIBE_FILE != nil {
		cfg.ScribeFile = *file.SCRIBE_FILE
	}
	if file.SCRIBE_ROTATION_MAX_MB > 0 {
		cfg.ScribeRotationMaxMB = file.SCRIBE_ROTATION_MAX_MB
	}
	if file.SCRIBE_MAX_BACKUPS > 0 {
		cfg.ScribeMaxBackups = file.SCRIBE_MAX_BACKUPS
	}
	if file.SCRIBE_MAX_AGE_DAY > 0 {
		cfg.ScribeMaxAgeDay = file.SCRIBE_MAX_AGE_DAY
	}
	if file.SCRIBE_COMPRESS != nil {
		cfg.ScribeCompress = *file.SCRIBE_COMPRESS
	}

	cfg.resolveResourcePaths(configPath)
	return cfg, nil
}

func (cfg *Observability) resolveResourcePaths(configPath string) {
	cfg.TraceFilesDir = resolveResourcePath(configPath, cfg.TraceFilesDir)
	cfg.ScribeFilePath = resolveResourcePath(configPath, cfg.ScribeFilePath)
}

func resolveResourcePath(configPath, resourcePath string) string {
	if resourcePath == "" {
		return resourcePath
	}
	if filepath.IsAbs(resourcePath) {
		return resourcePath
	}

	for _, base := range resourceSearchBases(configPath) {
		candidate := filepath.Join(base, resourcePath)
		if _, err := os.Stat(candidate); err == nil {
			abs, err := filepath.Abs(candidate)
			if err == nil {
				return abs
			}
			return candidate
		}
	}

	abs, err := filepath.Abs(resourcePath)
	if err != nil {
		return resourcePath
	}
	return abs
}

func resourceSearchBases(configPath string) []string {
	seen := make(map[string]struct{})
	bases := make([]string, 0, 8)

	add := func(base string) {
		if base == "" {
			return
		}
		abs, err := filepath.Abs(base)
		if err != nil {
			abs = base
		}
		if _, ok := seen[abs]; ok {
			return
		}
		seen[abs] = struct{}{}
		bases = append(bases, abs)
	}

	if configPath != "" {
		add(filepath.Dir(configPath))
	}

	cwd, err := os.Getwd()
	if err != nil {
		return bases
	}

	dir := cwd
	for i := 0; i < 8; i++ {
		add(dir)
		if _, err := os.Stat(filepath.Join(dir, "go.mod")); err == nil {
			add(dir)
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}

	return bases
}
