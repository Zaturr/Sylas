package validate_test

import (
	"strings"
	"testing"

	"Alias_bdca/Back/internal/adapters/simf/validate"
)

func TestValidateIdModAdvcJSON_wrongMsgIdReturnsStructural(t *testing.T) {
	raw := []byte(`{"IdModAdvc":{"GrpHdr":{"MsgId":"corto","CreDtTm":"2026-07-23T12:00:00"},"Mod":{"Agt":"0105","EndToEndId":"01050260707113000000000051","Alias":"juan.perez","Pty":{"Nm":"JUAN PEREZ","Id":"V12345678","SchmeNm":"SCID"}}}}`)
	result, err := validate.ValidateIdModAdvcJSON(raw)
	if err != nil {
		t.Fatalf("ValidateIdModAdvcJSON: %v", err)
	}
	if !result.HasStructural() {
		t.Fatalf("expected structural (409) for MsgId invalido, got value=%v structural=%v", result.Value, result.Structural)
	}

	body := validate.BuildSchemaConflictBody(result.Structural)
	if !strings.Contains(body.Error, "MsgId") {
		t.Fatalf("expected MsgId in summary error, got: %s", body.Error)
	}
}

func TestValidateIdModAdvcJSON_wrongEndToEndIdReturnsStructural(t *testing.T) {
	raw := []byte(`{"IdModAdvc":{"GrpHdr":{"MsgId":"01050260707113000000000000001","CreDtTm":"2026-07-23T12:00:00"},"Mod":{"Agt":"0105","EndToEndId":"mantequilla","Alias":"juan.perez","Pty":{"Nm":"JUAN PEREZ","Id":"V12345678","SchmeNm":"SCID"}}}}`)
	result, err := validate.ValidateIdModAdvcJSON(raw)
	if err != nil {
		t.Fatalf("ValidateIdModAdvcJSON: %v", err)
	}
	if !result.HasStructural() {
		t.Fatalf("expected structural (409) for EndToEndId invalido, got value=%v structural=%v", result.Value, result.Structural)
	}

	body := validate.BuildSchemaConflictBody(result.Structural)
	if !strings.Contains(body.Error, "EndToEndId") {
		t.Fatalf("expected EndToEndId in summary error, got: %s", body.Error)
	}
}

func TestValidateIdModAdvcJSON_wrongMsgIdKeyReturnsStructural(t *testing.T) {
	raw := []byte(`{"IdModAdvc":{"GrpHdr":{"MsgID":"01050260707113000000000000001","CreDtTm":"2026-07-23T12:00:00"},"Mod":{"Agt":"0105","EndToEndId":"01050260707113000000000051","Alias":"juan.perez","Pty":{"Nm":"JUAN PEREZ","Id":"V12345678","SchmeNm":"SCID"}}}}`)
	result, err := validate.ValidateIdModAdvcJSON(raw)
	if err != nil {
		t.Fatalf("ValidateIdModAdvcJSON: %v", err)
	}
	if !result.HasStructural() {
		t.Fatalf("expected structural (409) for MsgID key, got value=%v structural=%v", result.Value, result.Structural)
	}

	body := validate.BuildSchemaConflictBody(result.Structural)
	if !strings.Contains(body.Error, "MsgId") && !strings.Contains(body.Error, "MsgID") {
		t.Fatalf("expected MsgId/MsgID mention in summary error, got: %s", body.Error)
	}
}

func TestValidateIdModAdvcJSON_validPayload(t *testing.T) {
	raw := []byte(`{"IdModAdvc":{"GrpHdr":{"MsgId":"0105026070711300000000000001","CreDtTm":"2026-07-23T12:00:00"},"Mod":{"Agt":"0105","EndToEndId":"01050260707113000000000051","Alias":"juan.perez","Pty":{"Nm":"JUAN PEREZ","Id":"V12345678","SchmeNm":"SCID"}}}}`)
	result, err := validate.ValidateIdModAdvcJSON(raw)
	if err != nil {
		t.Fatalf("ValidateIdModAdvcJSON: %v", err)
	}
	if result.HasStructural() || result.HasValue() {
		t.Fatalf("expected valid payload, got structural=%v value=%v", result.Structural, result.Value)
	}
}

func TestBuildSchemaConflictBody_concatenatesMultipleFields(t *testing.T) {
	body := validate.BuildSchemaConflictBody([]validate.SchemaViolation{
		{Field: "/IdModAdvc/GrpHdr/MsgId", Message: "maxLength: got 5, want 28"},
		{Field: "/IdModAdvc/Mod/EndToEndId", Message: "does not match pattern"},
	})

	if !strings.Contains(body.Error, "MsgId") || !strings.Contains(body.Error, "EndToEndId") {
		t.Fatalf("expected both fields in summary, got: %s", body.Error)
	}
	if !strings.Contains(body.Error, "|") {
		t.Fatalf("expected concatenated summary with separator, got: %s", body.Error)
	}
	if len(body.Details) != 2 {
		t.Fatalf("expected 2 detail entries, got %d", len(body.Details))
	}
}
