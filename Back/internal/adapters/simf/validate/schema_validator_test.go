package validate_test

import (
	"os"
	"testing"

	"Alias_bdca/Back/internal/adapters/simf/validate"
)

func TestValidateIdModAdvcJSON_validRegistrationRequest(t *testing.T) {
	raw := []byte(`{
  "IdModAdvc": {
    "GrpHdr": {
      "MsgId": "0105012026052914483912034180",
      "CreDtTm": "2026-05-29T14:48:39Z"
    },
    "Mod": {
      "Agt": "0105",
      "EndToEndId": "01052026052914483912034180",
      "Alias": "b.requena",
      "Pty": {
        "Nm": "BELKIS REQUENA",
        "Id": "V12345678",
        "SchmeNm": "SCID"
      }
    }
  }
}`)

	result, err := validate.ValidateIdModAdvcJSON(raw)
	if err != nil {
		t.Fatalf("validador no inicializado: %v", err)
	}
	if result.HasStructural() || result.HasValue() {
		t.Fatalf("esperaba validación exitosa, obtuvo %+v", result)
	}
}

func TestValidateIdModAdvcJSON_invalidAliasLengthIsValueError(t *testing.T) {
	raw := []byte(`{
  "IdModAdvc": {
    "GrpHdr": {
      "MsgId": "0105012026052914483912034180",
      "CreDtTm": "2026-05-29T14:48:39Z"
    },
    "Mod": {
      "Agt": "0105",
      "EndToEndId": "01052026052914483912034180",
      "Alias": "abc",
      "Pty": {
        "Nm": "BELKIS REQUENA",
        "Id": "V12345678",
        "SchmeNm": "SCID"
      }
    }
  }
}`)

	result, err := validate.ValidateIdModAdvcJSON(raw)
	if err != nil {
		t.Fatalf("validador no inicializado: %v", err)
	}
	if result.HasStructural() {
		t.Fatalf("alias corto no debe ser error estructural: %+v", result.Structural)
	}
	if !result.HasValue() {
		t.Fatal("esperaba violación de valor para alias corto")
	}
}

func TestValidateIdModAdvcJSON_unknownPropertyIsStructuralError(t *testing.T) {
	raw := []byte(`{
  "IdModAdvc": {
    "GrpHdr": {
      "MsgId": "0105012026052914483912034180",
      "CreDtTm": "2026-05-29T14:48:39Z"
    },
    "Mod": {
      "Agt": "0105",
      "EndToEndId": "01052026052914483912034180",
      "Alias": "b.requena",
      "CampoExtra": "x",
      "Pty": {
        "Nm": "BELKIS REQUENA",
        "Id": "V12345678",
        "SchmeNm": "SCID"
      }
    }
  }
}`)

	result, err := validate.ValidateIdModAdvcJSON(raw)
	if err != nil {
		t.Fatalf("validador no inicializado: %v", err)
	}
	if !result.HasStructural() {
		t.Fatalf("propiedad desconocida debe ser error estructural: %+v", result)
	}
}

func TestValidateIdModAdvcJSON_embeddedSchemaPresent(t *testing.T) {
	_, err := os.Stat("schema/simf-alias-schema.json")
	if err != nil {
		t.Fatalf("schema embebido no encontrado en disco de tests: %v", err)
	}
}
