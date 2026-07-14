import { validateDocumentInput } from '../validations';

export type ValidateCreateAccountDraftResult =
  | { ok: true }
  | { ok: false; error: string };

export function validateCreateAccountDraft(
  documentInput: string,
  firstName: string,
  lastName: string,
  secondLastName: string,
): ValidateCreateAccountDraftResult {
  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();
  const trimmedSecondLastName = secondLastName.trim();

  const documentValidation = validateDocumentInput(documentInput);
  if (!documentValidation.ok) {
    return { ok: false, error: documentValidation.error };
  }

  if (!trimmedFirstName) {
    return { ok: false, error: 'Ingresa el primer nombre del titular.' };
  }

  if (!trimmedLastName) {
    return { ok: false, error: 'Ingresa el primer apellido del titular.' };
  }

  if (!trimmedSecondLastName) {
    return { ok: false, error: 'Ingresa el segundo apellido del titular.' };
  }

  return { ok: true };
}
