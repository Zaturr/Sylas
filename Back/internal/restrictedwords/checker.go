package restrictedwords

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

const DefaultFileName = "words.txt"

// Checker valida alias contra un listado de palabras prohibidas.
type Checker struct {
	words map[string]struct{}
	path  string
}

// Load lee el archivo de palabras (una por línea).
func Load(filePath string) (*Checker, error) {
	filePath = strings.TrimSpace(filePath)
	if filePath == "" {
		return &Checker{words: map[string]struct{}{}}, nil
	}

	file, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("abrir listado de palabras restringidas (%s): %w", filePath, err)
	}
	defer file.Close()

	words := make(map[string]struct{})
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		word := normalizeWord(scanner.Text())
		if word == "" {
			continue
		}
		words[word] = struct{}{}
	}
	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("leer listado de palabras restringidas: %w", err)
	}

	return &Checker{words: words, path: filePath}, nil
}

// Path devuelve la ruta del archivo cargado.
func (c *Checker) Path() string {
	if c == nil {
		return ""
	}
	return c.path
}

// Count devuelve cuántas palabras hay cargadas.
func (c *Checker) Count() int {
	if c == nil {
		return 0
	}
	return len(c.words)
}

// IsRestricted indica si el alias contiene alguna palabra prohibida.
// La coincidencia es parcial: zorra bloquea zorra.12, zorrabien y mi.zorras.
func (c *Checker) IsRestricted(alias string) bool {
	if c == nil || len(c.words) == 0 {
		return false
	}

	alias = strings.TrimSpace(strings.ToLower(alias))
	if alias == "" {
		return false
	}

	compact := strings.ReplaceAll(alias, ".", "")

	seen := make(map[string]struct{}, 2)
	for _, candidate := range []string{alias, compact} {
		if candidate == "" {
			continue
		}
		if _, ok := seen[candidate]; ok {
			continue
		}
		seen[candidate] = struct{}{}

		for word := range c.words {
			if strings.Contains(candidate, word) {
				return true
			}
		}
	}

	return false
}

func normalizeWord(line string) string {
	line = strings.TrimSpace(line)
	if line == "" || strings.HasPrefix(line, "#") {
		return ""
	}
	return strings.ToLower(line)
}
