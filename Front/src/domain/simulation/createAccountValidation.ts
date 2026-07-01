import { parseDocumentInput } from './documentParser';

export type ValidateCreateAccountDraftResult =
  | { ok: true }
  | { ok: false; error: string };

export function validateCreateAccountDraft(
  documentInput: string,
  firstName: string,
  lastName: string,
): ValidateCreateAccountDraftResult {
  const trimmedDocument = documentInput.trim();
  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();

  if (!trimmedDocument) {
    return { ok: false, error: 'Ingresa la cédula del titular.' };
  }

  if (!parseDocumentInput(trimmedDocument)) {
    return { ok: false, error: 'Formato de cédula inválido (ej. V12345678).' };
  }

  if (!trimmedFirstName) {
    return { ok: false, error: 'Ingresa el nombre del titular.' };
  }

  if (!trimmedLastName) {
    return { ok: false, error: 'Ingresa el apellido del titular.' };
  }

  return { ok: true };
}
