package response

import (
	"fmt"
	"time"

	simfdomain "Alias_bdsa/Back/internal/domain/simf"
)

// NewGroupHeader genera MsgId (28) y CreDtTm ISO para respuestas SIMF.
func NewGroupHeader() simfdomain.GroupHeader {
	now := time.Now().UTC()
	sequential := now.UnixNano() % 100000000
	msgID := fmt.Sprintf("000101%s%08d", now.Format("20060102150405"), sequential)
	if len(msgID) > 28 {
		msgID = msgID[:28]
	}

	return simfdomain.GroupHeader{
		MsgID:   msgID,
		CreDtTm: now.Format("2006-01-02T15:04:05") + "Z",
	}
}
