import type {
  CreateAccountInput,
  CreateAccountResult,
  LoginByDocumentResult,
} from '../../../../application/simulation/authSimulation.port';
import { buildSimfTraceSessionKey } from '../../../../domain/peticiones';
import { generateBankAccountNumber } from '../../../../domain/simulation/accountNumber';
import { parseDocumentInput } from '../../../../domain/simulation/documentParser';
import { validateCreateAccountDraft } from '../../../../domain/simulation/createAccountValidation';
import { appConfig } from '../../app.config';
import { buildRegistrationPayload } from '../shared/registrationPayload.builder';
import { resolveByDocument, postRegisterUser } from '../alias/aliasHttp.client';
import type { createResolveAliasViaSimf } from '../simf/simfAliasResolve.client';
import { mapResolveFailure } from './authSession.mapper';
import { buildSimulationSession } from './sessionAccount.service';

export type AuthSimulationHandlersDeps = {
  resolveAliasViaSimf: ReturnType<typeof createResolveAliasViaSimf>;
};

async function traceSimfResolveByDocument(
  documentType: string,
  documentNumber: string,
  resolveAliasViaSimf: AuthSimulationHandlersDeps['resolveAliasViaSimf'],
  signal?: AbortSignal,
): Promise<void> {
  const sessionKey = buildSimfTraceSessionKey(documentType, documentNumber);

  await resolveAliasViaSimf(
    documentType,
    documentNumber,
    appConfig.simulation.bankCode,
    sessionKey,
    signal,
  );
}

export function createAuthSimulationHandlers(deps: AuthSimulationHandlersDeps) {
  return {
    async loginByDocument(
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

      await traceSimfResolveByDocument(
        document.documentType,
        document.documentNumber,
        deps.resolveAliasViaSimf,
        signal,
      );

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
    },

    async createAccount(
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
        );

        const registered = await postRegisterUser(payload, signal, 'Error al crear la cuenta');

        if (registered.ok) {
          await traceSimfResolveByDocument(
            document.documentType,
            document.documentNumber,
            deps.resolveAliasViaSimf,
            signal,
          );

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
    },
  };
}
