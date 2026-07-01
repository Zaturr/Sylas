import type {
  CreateAccountInput,
  CreateAccountResult,
  LoginByDocumentResult,
} from '../../../../application/simulation/authSimulation.port';
import { generateBankAccountNumber } from '../../../../domain/simulation/accountNumber';
import { parseDocumentInput } from '../../../../domain/simulation/documentParser';
import { validateCreateAccountDraft } from '../../../../domain/simulation/createAccountValidation';
import { appConfig } from '../../app.config';
import {
  buildRegistrationPayload,
} from '../shared/registrationPayload.builder';
import { resolveByDocument, postRegisterUser } from '../alias/aliasHttp.client';
import { mapResolveFailure } from './authSession.mapper';
import { buildSimulationSession } from './sessionAccount.service';

export async function loginByDocument(
  documentInput: string,
  signal?: AbortSignal,
): Promise<LoginByDocumentResult> {
  const document = parseDocumentInput(documentInput);
  if (!document) {
    return {
      ok: false,
      reason: 'invalid-document',
      message: 'Formato de cédula inválido (ej. V12345678).',
    };
  }

  const resolved = await resolveByDocument(
    document.documentType,
    document.documentNumber,
    signal,
  );

  if (!resolved.ok) {
    return mapResolveFailure(resolved.status, resolved.message);
  }

  const sessionResult = await buildSimulationSession(resolved.data, document, signal);
  if (!sessionResult.ok) {
    return {
      ok: false,
      reason: 'error',
      message: sessionResult.message,
    };
  }

  return {
    ok: true,
    session: sessionResult.session,
  };
}

export async function createAccount(
  input: CreateAccountInput,
  signal?: AbortSignal,
): Promise<CreateAccountResult> {
  const validation = validateCreateAccountDraft(
    input.documentInput,
    input.firstName,
    input.lastName,
  );

  if (!validation.ok) {
    return { ok: false, message: validation.error };
  }

  const document = parseDocumentInput(input.documentInput.trim());
  if (!document) {
    return {
      ok: false,
      message: 'Formato de cédula inválido (ej. V12345678).',
    };
  }

  const docKey = `${document.documentType.toLowerCase()}${document.documentNumber}`;
  const pendingAlias = `pending.${docKey}`;

  let lastError = 'No se pudo crear la cuenta.';

  for (let attempt = 0; attempt < appConfig.simulation.maxAccountGenerationAttempts; attempt += 1) {
    const accountNumber = generateBankAccountNumber(
      appConfig.simulation.bankCode,
      appConfig.simulation.accountSuffixLength,
    );

    const payload = buildRegistrationPayload(
      document.documentType,
      document.documentNumber,
      input.firstName,
      input.lastName,
      accountNumber,
      pendingAlias,
    );

    const registered = await postRegisterUser(payload, signal, 'Error al crear la cuenta');

    if (registered.ok) {
      const resolved = await resolveByDocument(
        document.documentType,
        document.documentNumber,
        signal,
      );

      if (resolved.ok) {
        const sessionResult = await buildSimulationSession(resolved.data, document, signal);
        if (!sessionResult.ok) {
          return {
            ok: false,
            message: sessionResult.message,
          };
        }

        return {
          ok: true,
          session: sessionResult.session,
        };
      }

      return {
        ok: false,
        message: 'La cuenta se creó, pero no se pudo iniciar sesión automáticamente.',
      };
    }

    lastError = registered.message;

    const normalizedError = lastError.toLowerCase();
    const isAccountCollision =
      normalizedError.includes('cuenta') && normalizedError.includes('registrad');

    if (!isAccountCollision) {
      break;
    }
  }

  return { ok: false, message: lastError };
}
