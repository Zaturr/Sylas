import type { Account } from '../../../domain/account';
import type { Customer } from '../../../domain/user';
import { generateBankAccountNumber } from '../../../domain/simulation/accountNumber';
import {
  hasConfiguredAliasValue,
  isPendingAlias,
  type SimulationSession,
} from '../../../domain/simulation/auth.types';
import {
  parseDocumentInput,
  type ParsedDocument,
} from '../../../domain/simulation/documentParser';
import { SIMF_REASON_NOT_FOUND } from '../../../domain/simulation/simf.constants';
import {
  SIMF_ALIAS_STATUS,
  coreAccountStatusToSimf,
  type SimfAliasStatus,
  type UserModifiableAliasStatus,
} from '../../../domain/simulation/aliasStatus';
import type {
  AuthSimulationService,
  CheckAliasResult,
  CreateAccountInput,
  CreateAccountResult,
  LoginByDocumentResult,
  RegisterAliasResult,
  UpdateAliasStatusInput,
  UpdateAliasStatusResult,
} from '../../../application/simulation/authSimulation.port';
import { validateAliasValue } from '../../../domain/simulation/aliasValidation';
import { validateCreateAccountDraft } from '../../../domain/simulation/createAccountValidation';
import { simulationConfig } from './simulation.config';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';

const SIMF_BASE_URL = `${new URL(API_BASE_URL).origin}/simf/bdca/v1`;

type ResolveAliasResponse = {
  alias: string;
  customer: Customer;
  accounts: Account[];
};

async function readApiError(response: Response, fallback: string): Promise<string> {
  const data = await response.json().catch(() => null);
  if (data && typeof data.error === 'string') {
    return data.error;
  }
  return fallback;
}

function buildSession(
  response: ResolveAliasResponse,
  mappedDocument: ParsedDocument,
): SimulationSession {
  const alias = response.alias?.trim() || null;

  return {
    customer: response.customer,
    accounts: response.accounts ?? [],
    alias,
    hasConfiguredAlias: hasConfiguredAliasValue(alias),
    mappedDocument,
  };
}

function buildRegistrationPayload(
  documentType: string,
  documentNumber: string,
  firstName: string,
  lastName: string,
  accountNumber: string,
  aliasValue: string,
) {
  const normalizedType = documentType.toUpperCase();
  const docKey = `${normalizedType.toLowerCase()}${documentNumber}`;

  return {
    document_type: normalizedType,
    document_number: documentNumber,
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    email: `${docKey}@simf.local`,
    phone: `SIMF${normalizedType}${documentNumber}`,
    alias_value: aliasValue,
    accounts: [
      {
        bank_id: simulationConfig.bankCode,
        account_number: accountNumber,
        account_type: simulationConfig.accountType,
      },
    ],
  };
}

function buildRegistrationPayloadFromSession(
  session: SimulationSession,
  aliasValue: string,
) {
  const primaryAccount = session.accounts[0];
  const accountNumber = primaryAccount?.account_number
    ?? generateBankAccountNumber(
      simulationConfig.bankCode,
      simulationConfig.accountSuffixLength,
    );

  return buildRegistrationPayload(
    session.mappedDocument.documentType,
    session.mappedDocument.documentNumber,
    session.customer.first_name,
    session.customer.last_name,
    accountNumber,
    aliasValue,
  );
}

async function resolveByDocument(
  documentType: string,
  documentNumber: string,
  signal?: AbortSignal,
): Promise<{ ok: true; data: ResolveAliasResponse } | { ok: false; status: number; message: string }> {
  const params = new URLSearchParams({
    document_type: documentType,
    document_number: documentNumber,
  });

  const response = await fetch(`${API_BASE_URL}/alias/resolve?${params.toString()}`, {
    signal,
  });

  if (response.ok) {
    const data = (await response.json()) as ResolveAliasResponse;
    return { ok: true, data };
  }

  return {
    ok: false,
    status: response.status,
    message: await readApiError(response, 'No se pudo validar la cédula'),
  };
}

function mapResolveFailure(status: number, message: string): LoginByDocumentResult {
  if (status === 404) {
    if (message.toLowerCase().includes('alias')) {
      return {
        ok: false,
        reason: 'no-alias',
        message: 'Este titular existe pero aún no tiene alias configurado.',
      };
    }

    return {
      ok: false,
      reason: 'not-found',
      message: 'No encontramos una cuenta asociada a esta cédula.',
    };
  }

  return {
    ok: false,
    reason: 'error',
    message,
  };
}

function resolveAgentStatus(accounts: Account[], bankCode: string): SimfAliasStatus {
  const account = accounts.find((item) => item.bank_id === bankCode);
  if (!account) {
    return SIMF_ALIAS_STATUS.UNREGISTERED;
  }
  return coreAccountStatusToSimf(account.status);
}

function buildAliasCheckFromResolve(resolved: ResolveAliasResponse): Extract<CheckAliasResult, { ok: true }> {
  const alias = resolved.alias?.trim() || null;
  const bankCode = simulationConfig.bankCode;
  const agentStatus = resolveAgentStatus(resolved.accounts ?? [], bankCode);

  if (!hasConfiguredAliasValue(alias)) {
    return {
      ok: true,
      status: 'not-found',
      reason: SIMF_REASON_NOT_FOUND,
      message: 'No se encontró un alias configurado para esta cédula.',
      agentStatus: SIMF_ALIAS_STATUS.UNREGISTERED,
      bankCode,
    };
  }

  return {
    ok: true,
    status: 'found',
    alias: alias as string,
    message: `Alias registrado: ${alias}`,
    agentStatus,
    bankCode,
  };
}

function mapAliasCheck(resolved: ResolveAliasResponse): CheckAliasResult {
  return buildAliasCheckFromResolve(resolved);
}

function buildSimfUpdatePayload(
  aliasValue: string,
  bankCode: string,
  status: UserModifiableAliasStatus,
) {
  const timestamp = Date.now();
  const creDtTm = new Date().toISOString().slice(0, 19);

  return {
    IdModAdvc: {
      GrpHdr: {
        MsgID: `sim-${timestamp}`,
        CreDtTm: creDtTm,
      },
      Mod: {
        EndToEndId: `sim-e2e-${timestamp}`,
        Alias: aliasValue,
        Agt: bankCode,
        Sts: status,
      },
    },
  };
}

async function updateAliasViaSimf(
  aliasValue: string,
  bankCode: string,
  status: UserModifiableAliasStatus,
  signal?: AbortSignal,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const response = await fetch(
    `${SIMF_BASE_URL}/aliases/update/${encodeURIComponent(aliasValue)}/${bankCode}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildSimfUpdatePayload(aliasValue, bankCode, status)),
      signal,
    },
  );

  if (!response.ok) {
    return {
      ok: false,
      message: 'No se pudo actualizar el estado del alias.',
    };
  }

  const data = await response.json().catch(() => null);
  const resultCode = data?.IdVrfctnRpt?.Rpt?.Result?.trim();

  if (resultCode !== 'ACCP') {
    const reason = data?.IdVrfctnRpt?.Rpt?.Rsn?.trim() || 'RJCT';
    return {
      ok: false,
      message: `Actualización rechazada (${reason}).`,
    };
  }

  return { ok: true };
}

async function deleteAliasByValue(aliasValue: string, signal?: AbortSignal): Promise<boolean> {
  const response = await fetch(
    `${API_BASE_URL}/alias/${encodeURIComponent(aliasValue)}`,
    { method: 'DELETE', signal },
  );

  return response.ok;
}

async function createAliasForCustomer(
  customerId: string,
  aliasValue: string,
  signal?: AbortSignal,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const response = await fetch(`${API_BASE_URL}/alias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_id: customerId,
      alias_value: aliasValue,
    }),
    signal,
  });

  if (response.ok) {
    return { ok: true };
  }

  return {
    ok: false,
    message: await readApiError(response, 'No se pudo registrar el alias'),
  };
}

export function createAuthSimulationService(): AuthSimulationService {
  return {
    async loginByDocument(documentInput, signal): Promise<LoginByDocumentResult> {
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

      return {
        ok: true,
        session: buildSession(resolved.data, document),
      };
    },

    async createAccount(input: CreateAccountInput, signal): Promise<CreateAccountResult> {
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

      for (let attempt = 0; attempt < simulationConfig.maxAccountGenerationAttempts; attempt += 1) {
        const accountNumber = generateBankAccountNumber(
          simulationConfig.bankCode,
          simulationConfig.accountSuffixLength,
        );

        const payload = buildRegistrationPayload(
          document.documentType,
          document.documentNumber,
          input.firstName,
          input.lastName,
          accountNumber,
          pendingAlias,
        );

        const response = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal,
        });

        if (response.ok) {
          const resolved = await resolveByDocument(
            document.documentType,
            document.documentNumber,
            signal,
          );

          if (resolved.ok) {
            return {
              ok: true,
              session: buildSession(resolved.data, document),
            };
          }

          return {
            ok: false,
            message: 'La cuenta se creó, pero no se pudo iniciar sesión automáticamente.',
          };
        }

        lastError = await readApiError(response, 'Error al crear la cuenta');

        const normalizedError = lastError.toLowerCase();
        const isAccountCollision =
          normalizedError.includes('cuenta') && normalizedError.includes('registrad');

        if (!isAccountCollision) {
          break;
        }
      }

      return { ok: false, message: lastError };
    },

    async checkAliasByDocument(documentInput, signal): Promise<CheckAliasResult> {
      const document = parseDocumentInput(documentInput);
      if (!document) {
        return {
          ok: false,
          message: 'Formato de cédula inválido (ej. V12345678).',
        };
      }

      const resolved = await resolveByDocument(
        document.documentType,
        document.documentNumber,
        signal,
      );

      if (!resolved.ok) {
        if (resolved.status === 404) {
          return {
            ok: true,
            status: 'not-found',
            reason: SIMF_REASON_NOT_FOUND,
            message: 'No se encontró un alias configurado para esta cédula.',
            agentStatus: SIMF_ALIAS_STATUS.UNREGISTERED,
            bankCode: simulationConfig.bankCode,
          };
        }

        return {
          ok: false,
          message: resolved.message,
        };
      }

      return mapAliasCheck(resolved.data);
    },

    async updateAliasStatus(session, input, signal): Promise<UpdateAliasStatusResult> {
      const updated = await updateAliasViaSimf(
        input.aliasValue,
        input.bankCode,
        input.targetStatus,
        signal,
      );

      if (!updated.ok) {
        return { ok: false, message: updated.message };
      }

      const document = session.mappedDocument;
      const resolved = await resolveByDocument(
        document.documentType,
        document.documentNumber,
        signal,
      );

      if (!resolved.ok) {
        return {
          ok: false,
          message: 'El estado se actualizó, pero no se pudo refrescar la consulta.',
        };
      }

      const check = buildAliasCheckFromResolve(resolved.data);

      return {
        ok: true,
        session: buildSession(resolved.data, document),
        check,
      };
    },

    async registerAlias(session, aliasValue, signal): Promise<RegisterAliasResult> {
      const validation = validateAliasValue(aliasValue);
      if (!validation.ok) {
        return { ok: false, message: validation.error };
      }

      const trimmedAlias = validation.value;

      const document = session.mappedDocument;
      const currentAlias = session.alias?.trim() || null;

      if (currentAlias && isPendingAlias(currentAlias)) {
        const deleted = await deleteAliasByValue(currentAlias, signal);
        if (!deleted) {
          return {
            ok: false,
            message: 'No se pudo reemplazar el alias temporal del titular.',
          };
        }

        const payload = buildRegistrationPayloadFromSession(session, trimmedAlias);
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal,
        });

        if (!response.ok) {
          return {
            ok: false,
            message: await readApiError(response, 'No se pudo registrar el alias'),
          };
        }
      } else if (!session.hasConfiguredAlias) {
        const created = await createAliasForCustomer(session.customer.id, trimmedAlias, signal);
        if (!created.ok) {
          return { ok: false, message: created.message };
        }
      } else {
        return {
          ok: false,
          message: 'Este titular ya tiene un alias configurado.',
        };
      }

      const resolved = await resolveByDocument(
        document.documentType,
        document.documentNumber,
        signal,
      );

      if (!resolved.ok) {
        return {
          ok: false,
          message: 'El alias se registró, pero no se pudo refrescar la sesión.',
        };
      }

      return {
        ok: true,
        session: buildSession(resolved.data, document),
      };
    },
  };
}
