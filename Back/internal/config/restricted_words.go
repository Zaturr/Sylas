package config

import (
	"encoding/json"
	"fmt"
	"os"
)

const defaultRestrictedWordsFile = "words.txt"

func LoadRestrictedWordsFile(configPath string) (string, error) {
	if configPath == "" {
		return defaultRestrictedWordsFile, nil
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		return defaultRestrictedWordsFile, fmt.Errorf("leer config para palabras restringidas: %w", err)
	}

	var file struct {
		RESTRICTED_WORDS_FILE string `json:"RESTRICTED_WORDS_FILE"`
	}
	if err := json.Unmarshal(data, &file); err != nil {
		return defaultRestrictedWordsFile, fmt.Errorf("parsear RESTRICTED_WORDS_FILE: %w", err)
	}

	if file.RESTRICTED_WORDS_FILE != "" {
		return file.RESTRICTED_WORDS_FILE, nil
	}
	return defaultRestrictedWordsFile, nil
}
