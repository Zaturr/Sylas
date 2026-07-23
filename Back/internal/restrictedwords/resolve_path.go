package restrictedwords

import (
	"os"
	"path/filepath"
	"strings"
)

const defaultRelativePath = "restricted word/" + DefaultFileName

// ResolvePath busca el archivo de palabras restringidas cerca del config, exe o cwd.
func ResolvePath(configPath, configuredPath string) string {
	configuredPath = strings.TrimSpace(configuredPath)
	if configuredPath == "" {
		configuredPath = defaultRelativePath
	}
	if filepath.IsAbs(configuredPath) {
		return configuredPath
	}

	for _, base := range searchBases(configPath) {
		candidate := filepath.Join(base, configuredPath)
		if _, err := os.Stat(candidate); err == nil {
			if abs, err := filepath.Abs(candidate); err == nil {
				return abs
			}
			return candidate
		}
	}

	if abs, err := filepath.Abs(configuredPath); err == nil {
		return abs
	}
	return configuredPath
}

func searchBases(configPath string) []string {
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

	if exe, err := os.Executable(); err == nil {
		add(filepath.Dir(exe))
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
