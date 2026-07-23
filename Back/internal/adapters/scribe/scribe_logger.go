package scribe

import (
	"fmt"

	appconfig "Alias_bdca/Back/internal/config"

	scribelib "github.com/SOLUCIONESSYCOM/scribe"
)

func NewScribeLogger(cfg appconfig.Observability) (*scribelib.Scribe, error) {
	scribeConfig := &scribelib.ConfigLogger{
		FilePath:          cfg.ScribeFilePath,
		MinLevel:          cfg.ScribeMinLevel,
		RotationMaxSizeMB: cfg.ScribeRotationMaxMB,
		MaxBackups:        cfg.ScribeMaxBackups,
		MaxAgeDay:         cfg.ScribeMaxAgeDay,
		Compress:          cfg.ScribeCompress,
		Console:           cfg.ScribeConsole,
		BeutifyConsoleLog: false,
		File:              cfg.ScribeFile,
		ActiveZerologHook: false,
	}

	logger, err := scribelib.New(scribeConfig, nil, nil)
	if err != nil {
		return nil, fmt.Errorf("crear logger Scribe: %w", err)
	}
	return logger, nil
}
