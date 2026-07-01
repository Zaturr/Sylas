export const ALIAS_FORMAT_ERROR_MESSAGE =
  'El alias solo puede tener un punto (.), debe estar en minúsculas, tener mínimo 6 caracteres y máximo 15. El punto es el único carácter especial permitido y debe ser solo uno.';

export type ValidateAliasValueResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

export function validateAliasValue(rawValue: string): ValidateAliasValueResult {
  const trimmed = rawValue.trim();

  if (!trimmed) {
    return { ok: false, error: 'Ingresa un alias válido.' };
  }

  if (trimmed !== trimmed.toLowerCase()) {
    return { ok: false, error: ALIAS_FORMAT_ERROR_MESSAGE };
  }

  if (!isValidAliasFormat(trimmed)) {
    return { ok: false, error: ALIAS_FORMAT_ERROR_MESSAGE };
  }

  return { ok: true, value: trimmed };
}

function isValidAliasFormat(alias: string): boolean {
  if (alias.length < 6 || alias.length > 15) {
    return false;
  }

  if (alias.startsWith('.') || alias.endsWith('.') || alias.includes('..')) {
    return false;
  }

  const dotCount = (alias.match(/\./g) ?? []).length;
  if (dotCount > 1) {
    return false;
  }

  const segments = alias.split('.');
  for (const segment of segments) {
    if (segment === '') {
      return false;
    }

    for (const char of segment) {
      const isLowercaseLetter = char >= 'a' && char <= 'z';
      const isDigit = char >= '0' && char <= '9';
      if (!isLowercaseLetter && !isDigit) {
        return false;
      }
    }
  }

  return true;
}
