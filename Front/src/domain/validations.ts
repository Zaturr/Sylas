export const ALLOWED_DOCUMENT_TYPES = ['V', 'E', 'J', 'G', 'C', 'P'] as const;

export type AllowedDocumentType = (typeof ALLOWED_DOCUMENT_TYPES)[number];

export type SimfSchemeName = 'SCID' | 'SRIF' | 'SPAS';

export type ParsedDocument = {
  documentType: string;
  documentNumber: string;
};

export type DocumentValidationResult =
  | {
      ok: true;
      documentType: string;
      documentNumber: string;
      schemeName: SimfSchemeName;
    }
  | { ok: false; error: string };

const allowedDocumentTypeSet = new Set<string>(ALLOWED_DOCUMENT_TYPES);

export function isValidDocumentType(documentType: string): boolean {
  return allowedDocumentTypeSet.has(documentType.trim().toUpperCase());
}

/** Mapea el tipo de documento al esquema SIMF (SchmeNm). */
export function mapDocumentTypeToSimfScheme(documentType: string): SimfSchemeName | null {
  switch (documentType.trim().toUpperCase()) {
    case 'V':
    case 'E':
      return 'SCID';
    case 'J':
    case 'G':
    case 'C':
      return 'SRIF';
    case 'P':
      return 'SPAS';
    default:
      return null;
  }
}

export function buildSimfDocumentId(documentType: string, documentNumber: string): string {
  return `${documentType.trim().toUpperCase()}${documentNumber.trim()}`;
}

export function formatDocumentInput(documentType: string, documentNumber: string): string {
  return buildSimfDocumentId(documentType, documentNumber);
}

function validateDocumentNumberForScheme(
  schemeName: SimfSchemeName,
  documentNumber: string,
): string | null {
  const trimmed = documentNumber.trim();

  if (!trimmed) {
    return 'El número de documento es requerido.';
  }

  switch (schemeName) {
    case 'SCID':
      if (!/^\d{1,34}$/.test(trimmed)) {
        return 'La cédula (V o E) debe contener entre 1 y 34 dígitos.';
      }
      return null;
    case 'SRIF':
      if (!/^\d{9}$/.test(trimmed)) {
        return 'El RIF (J, G o C) debe tener exactamente 9 dígitos para cumplir con el esquema de alias (SRIF).';
      }
      return null;
    case 'SPAS':
      if (!/^\d{1,34}$/.test(trimmed)) {
        return 'El pasaporte (P) debe tener entre 1 y 34 dígitos, sin espacios ni caracteres especiales (esquema SPAS).';
      }
      return null;
    default:
      return 'Tipo de documento inválido.';
  }
}

/** Valida tipo y número por separado (formulario core). */
export function validateDocumentFields(
  documentType: string,
  documentNumber: string,
): DocumentValidationResult {
  const normalizedType = documentType.trim().toUpperCase();

  if (!isValidDocumentType(normalizedType)) {
    return {
      ok: false,
      error: 'Tipo de documento inválido. Use V, E, J, G, C o P.',
    };
  }

  const schemeName = mapDocumentTypeToSimfScheme(normalizedType);
  if (!schemeName) {
    return {
      ok: false,
      error: 'Tipo de documento inválido. Use V, E, J, G, C o P.',
    };
  }

  const numberError = validateDocumentNumberForScheme(schemeName, documentNumber);
  if (numberError) {
    return { ok: false, error: numberError };
  }

  return {
    ok: true,
    documentType: normalizedType,
    documentNumber: documentNumber.trim(),
    schemeName,
  };
}

/** Parsea un documento combinado (ej. V12345678, J-123456789). */
export function parseDocumentInput(value: string): ParsedDocument | null {
  const match = value.trim().match(/^([VEJGCP])-?(\d+)$/i);
  if (!match) {
    return null;
  }

  const validation = validateDocumentFields(match[1], match[2]);
  if (!validation.ok) {
    return null;
  }

  return {
    documentType: validation.documentType,
    documentNumber: validation.documentNumber,
  };
}

/** Valida un documento combinado y devuelve mensaje de error detallado (simulador). */
export function validateDocumentInput(value: string): DocumentValidationResult {
  const trimmed = value.trim();

  if (!trimmed) {
    return { ok: false, error: 'Ingresa el documento del titular.' };
  }

  const match = trimmed.match(/^([VEJGCP])-?(\d+)$/i);
  if (!match) {
    return {
      ok: false,
      error: 'Formato inválido. Ejemplos: V12345678, J123456789, P12345678.',
    };
  }

  return validateDocumentFields(match[1], match[2]);
}

export const GMAIL_DOMAIN = '@gmail.com';

function sanitizeEmailLocalPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, '')
    .replace(/^\.+|\.+$/g, '');
}

function documentEmailSuffix(documentNumber: string): string {
  const digits = documentNumber.replace(/\D/g, '');
  if (digits.length <= 4) {
    return digits;
  }
  return digits.slice(-4);
}

export function ensureGmailAddress(email: string): string {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    return '';
  }

  const localPart = sanitizeEmailLocalPart(
    trimmed.includes('@') ? trimmed.slice(0, trimmed.indexOf('@')) : trimmed,
  );

  return `${localPart || 'usuario'}${GMAIL_DOMAIN}`;
}

export function buildGmailFromCustomer(
  firstName: string,
  _middleName: string,
  lastName: string,
  _secondLastName: string,
  documentNumber: string,
): string {
  // Ignoramos middleName y secondLastName para la generación del correo
  // para mantener la compatibilidad con el formato anterior si se desea,
  // o podemos incluirlos. Por ahora los ignoramos como lo pedía el linter.
  const first = sanitizeEmailLocalPart(firstName.trim());
  const last = sanitizeEmailLocalPart(lastName.trim());
  const suffix = documentEmailSuffix(documentNumber);

  if (!first && !last) {
    return `usuario${suffix}${GMAIL_DOMAIN}`;
  }
  if (!last) {
    return `${first}${suffix}${GMAIL_DOMAIN}`;
  }
  if (!first) {
    return `${last}${suffix}${GMAIL_DOMAIN}`;
  }

  return `${first}.${last}${suffix}${GMAIL_DOMAIN}`;
}

export function buildGmailFromAlias(alias: string): string {
  const localPart = sanitizeEmailLocalPart(alias.trim());
  return `${localPart || 'usuario'}${GMAIL_DOMAIN}`;
}

const venezuelaMobilePhonePattern = /^0(412|414|416|424|426)\d{7}$/;

export const VENEZUELA_MOBILE_PREFIXES = ['0412', '0414', '0416', '0424', '0426'] as const;

/** Valida móviles venezolanos: 04XX + 7 dígitos (11 en total). */
export function isValidVenezuelanPhone(phone: string): boolean {
  return venezuelaMobilePhonePattern.test(phone.trim());
}

/** Genera un teléfono móvil venezolano determinístico desde el número de documento. */
export function buildVenezuelanPhoneFromDocument(documentNumber: string): string {
  const digits = documentNumber.replace(/\D/g, '');
  const seedSource = digits.length > 9 ? digits.slice(-9) : digits;
  const seed = seedSource === '' ? 0 : Number.parseInt(seedSource, 10) || 0;
  const prefix =
    VENEZUELA_MOBILE_PREFIXES[seed % VENEZUELA_MOBILE_PREFIXES.length];
  const suffix = String(seed % 10_000_000).padStart(7, '0');

  return `${prefix}${suffix}`;
}
