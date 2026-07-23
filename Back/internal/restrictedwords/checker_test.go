package restrictedwords

import (
	"os"
	"path/filepath"
	"testing"
)

func TestChecker_IsRestricted(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "words.txt")
	content := "admin\n# comentario\nbanco\n\nmercantil\nzorra\n"
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatalf("write temp file: %v", err)
	}

	checker, err := Load(path)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}

	cases := []struct {
		alias    string
		expected bool
	}{
		{"admin", true},
		{"ADMIN", true},
		{"admin.user", true},
		{"usuario.admin", true},
		{"banco123", true},
		{"mi.alias", false},
		{"mercantil", true},
		{"juan.perez", false},
		{"zorrabiend", true},
		{"zorra.12", true},
		{"mi.zorras", true},
		{"zo.rra", true},
		{"superzorra", true},
	}

	for _, tc := range cases {
		got := checker.IsRestricted(tc.alias)
		if got != tc.expected {
			t.Errorf("IsRestricted(%q) = %v, want %v", tc.alias, got, tc.expected)
		}
	}
}

func TestChecker_EmptyFile(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "words.txt")
	if err := os.WriteFile(path, []byte("# solo comentarios\n"), 0o644); err != nil {
		t.Fatalf("write temp file: %v", err)
	}

	checker, err := Load(path)
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if checker.IsRestricted("admin") {
		t.Fatal("expected no restrictions from empty word list")
	}
}
