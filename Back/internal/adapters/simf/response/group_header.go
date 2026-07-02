package response

import (
	"fmt"
	"strings"
	"time"

	simfdomain "Alias_bdca/Back/internal/domain/simf"
)

const defaultProcessingCenter = "01"

// NewGroupHeader genera MsgId (28) y CreDtTm ISO.
// El MsgId inicia con el código de banco (Agt, 4 chars) + centro (01) + fecha + secuencial.
func NewGroupHeader(agentCode string) simfdomain.GroupHeader {
	now := time.Now().UTC()
	sequential := now.UnixNano() % 100000000
	emisor := normalizeAgentCode(agentCode)
	msgID := fmt.Sprintf("%s%s%s%08d", emisor, defaultProcessingCenter, now.Format("20060102150405"), sequential)
	if len(msgID) > 28 {
		msgID = msgID[:28]
	}

	return simfdomain.GroupHeader{
		MsgID:   msgID,
		CreDtTm: now.Format("2006-01-02T15:04:05") + "Z",
	}
}

func normalizeAgentCode(agentCode string) string {
	agentCode = strings.TrimSpace(agentCode)
	if len(agentCode) >= 4 {
		return agentCode[:4]
	}
	return fmt.Sprintf("%04s", agentCode)
}
