import { validateDocumentInput } from '../validations';

export type ValidateCreateAccountDraftResult =
  | { ok: true }
  | { ok: false; error: string };

export function validateCreateAccountDraft(
  documentInput: string,
  firstName: string,
  lastName: string,
): ValidateCreateAccountDraftResult {
  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();

  const documentValidation = validateDocumentInput(documentInput);
  if (!documentValidation.ok) {
    return { ok: false, error: documentValidation.error };
  }

  if (!trimmedFirstName) {
    return { ok: false, error: 'Ingresa el nombre del titular.' };
  }

  if (!trimmedLastName) {
    return { ok: false, error: 'Ingresa el apellido del titular.' };
  }

  return { ok: true };
}
