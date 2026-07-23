import type {
  ChangeLinkedAccountResult,
  CheckAliasResult,
  CheckAliasSuccessPayload,
  DeleteAliasResult,
  RegisterAliasResult,
  UpdateAliasStatusInput,
  UpdateAliasStatusResult,
} from '../../../../application/simulation/authSimulation.port';
import type {
  AliasResolveEntry,
  SimulationSession,
} from '../../../../domain/simulation/auth.types';
import { isPendingAlias } from '../../../../domain/simulation/auth.types';
import type { ParsedDocument } from '../../../../domain/simulation/documentParser';
import { parseDocumentInput } from '../../../../domain/simulation/documentParser';
import { validateAliasValue } from '../../../../domain/simulation/aliasValidation';
import { isAliasGloballyBlocked } from '../../../../domain/simulation/aliasStatus';
import { buildSimfTraceSessionKey } from '../../../../domain/peticiones';
import { appConfig } from '../../app.config';
import { getPrimaryAccount, withPrimaryAccount } from '../../../../domain/simulation/aliasFlow';
import {
  resolveByDocument,
  deleteAliasByValue,
  updateAliasLinkedAccount,
} from './aliasHttp.client';
import { buildAliasCheckFromResolve } from './aliasCheck.mapper';
import { buildFilteredSession } from '../auth/sessionAccount.service';
import type { createBlockAliasViaSimf } from '../simf/simfAliasBlock.client';
import type { createRegisterAliasViaSimf } from '../simf/simfAliasCreate.client';
import type { createResolveAliasViaSimf } from '../simf/simfAliasResolve.client';
import type { createUpdateAliasViaSimf } from '../simf/simfAliasUpdate.client';
import type { ResolveAliasResponse } from './alias.types';

function attachSessionToCheck(
  check: CheckAliasSuccessPayload,
  resolved: ResolveAliasResponse,
  document: ParsedDocument,
): Extract<CheckAliasResult, { ok: true }> {
  const session = buildFilteredSession(resolved, document);

  if (check.status === 'found') {
    return {
      ok: true,
      status: 'found',
      alias: check.alias,
      message: check.message,
      agentStatus: check.agentStatus,
      bankCode: check.bankCode,
      session,
    };
  }

  return {
    ok: true,
    status: 'not-found',
    reason: check.reason,
    message: check.message,
    agentStatus: check.agentStatus,
    bankCode: check.bankCode,
    session,
  };
}

export type SimfAliasClients = {
  resolveAliasViaSimf: ReturnType<typeof createResolveAliasViaSimf>;
  registerAliasViaSimf: ReturnType<typeof createRegisterAliasViaSimf>;
  blockAliasViaSimf: ReturnType<typeof createBlockAliasViaSimf>;
  updateAliasViaSimf: ReturnType<typeof createUpdateAliasViaSimf>;
};

export type AliasSimulationService = {
  checkAliasByDocument(
    documentInput: string,
    signal?: AbortSignal,
  ): Promise<CheckAliasResult>;
  updateAliasStatus(
    session: SimulationSession,
    input: UpdateAliasStatusInput,
    signal?: AbortSignal,
  ): Promise<UpdateAliasStatusResult>;
  changeLinkedAccount(
    session: SimulationSession,
    accountId: string,
    signal?: AbortSignal,
  ): Promise<ChangeLinkedAccountResult>;
  registerAlias(
    session: SimulationSession,
    aliasValue: string,
    accountId?: string,
    signal?: AbortSignal,
  ): Promise<RegisterAliasResult>;
  deleteAlias(
    session: SimulationSession,
    signal?: AbortSignal,
  ): Promise<DeleteAliasResult>;
  verifyAliasViaSimf(
    session: SimulationSession,
    bankCode?: string,
    signal?: AbortSignal,
  ): Promise<void>;
};

function getSessionKeyFromSimulationSession(session: SimulationSession): string {
  return buildSimfTraceSessionKey(
    session.mappedDocument.documentType,
    session.mappedDocument.documentNumber,
  );
}

function applyRegisteredAliasToSession(
  session: SimulationSession,
  aliasValue: string,
  accountId: string,
): SimulationSession {
  const updatedSession = {
    ...withPrimaryAccount(session, accountId),
    alias: aliasValue,
    hasConfiguredAlias: true,
    aliasCoreStatus: 'ACTV',
  };

  if (!session.isLegalEntity) {
    return updatedSession;
  }

  const entry: AliasResolveEntry = {
    alias_value: aliasValue,
    alias_status: 'ACTV',
    account_id: accountId,
  };

  return {
    ...updatedSession,
    registeredAliases: [...session.registeredAliases, entry],
  };
}

export function createAliasSimulationService(
  simfClients: SimfAliasClients,
): AliasSimulationService {
  return {
    async checkAliasByDocument(documentInput, signal) {
      const document = parseDocumentInput(documentInput);
      if (!document) {
        return {
          ok: false,
          message: 'Formato de cédula inválido (ej. V12345678).',
        };
      }

      const sessionKey = buildSimfTraceSessionKey(
        document.documentType,
        document.documentNumber,
      );

      await simfClients.resolveAliasViaSimf(
        document.documentType,
        document.documentNumber,
        appConfig.simulation.bankCode,
        sessionKey,
        signal,
      );

      const resolved = await resolveByDocument(
        document.documentType,
        document.documentNumber,
        signal,
      );

      if (!resolved.ok) {
        if (resolved.status === 404) {
          return {
            ok: false,
            message: 'No se encontró un titular para esta cédula.',
          };
        }

        return {
          ok: false,
          message: resolved.message,
        };
      }

      const check = attachSessionToCheck(
        buildAliasCheckFromResolve(resolved.data),
        resolved.data,
        document,
      );

      return check;
    },

    async changeLinkedAccount(session, accountId, signal) {
      const aliasValue = session.alias?.trim();
      if (!aliasValue || isPendingAlias(aliasValue)) {
        return { ok: false, message: 'No hay un alias configurado para vincular la cuenta.' };
      }

      const selectedAccount = session.accounts.find((account) => account.id === accountId);
      if (!selectedAccount) {
        return { ok: false, message: 'La cuenta seleccionada no existe en la sesión.' };
      }
      if (selectedAccount.account_type?.toLowerCase() === 'dolares') {
        return { ok: false, message: 'No se puede vincular un alias a una cuenta en dólares.' };
      }

      const linked = await updateAliasLinkedAccount(aliasValue, accountId, signal);
      if (!linked.ok) {
        return { ok: false, message: linked.message };
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
          message: 'La cuenta se vinculó, pero no se pudo refrescar la sesión.',
        };
      }

      return {
        ok: true,
        session: buildFilteredSession(resolved.data, document),
      };
    },

    async updateAliasStatus(session, input, signal) {
      const sessionKey = getSessionKeyFromSimulationSession(session);
      const updated = await simfClients.updateAliasViaSimf(
        input.aliasValue,
        input.bankCode,
        input.targetStatus,
        sessionKey,
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

      const check = attachSessionToCheck(
        buildAliasCheckFromResolve(resolved.data),
        resolved.data,
        document,
      );

      return {
        ok: true,
        session: check.session,
        check,
      };
    },

    async registerAlias(session, aliasValue, accountId, signal) {
      const validation = validateAliasValue(aliasValue);
      if (!validation.ok) {
        return { ok: false, message: validation.error };
      }

      const trimmedAlias = validation.value;
      const currentAlias = session.alias?.trim() || null;
      const aliasIsBlocked = isAliasGloballyBlocked(session.aliasCoreStatus);
      const resolvedAccountId = accountId?.trim() || session.primaryAccountId?.trim() || '';

      if (!session.isLegalEntity) {
        if (session.hasConfiguredAlias && !aliasIsBlocked) {
          return {
            ok: false,
            message: 'Este titular ya tiene un alias configurado.',
          };
        }
      }

      if (session.isLegalEntity && !resolvedAccountId) {
        return {
          ok: false,
          message: 'Debes seleccionar una cuenta para registrar el alias.',
        };
      }

      const workingSession = resolvedAccountId
        ? withPrimaryAccount(session, resolvedAccountId)
        : session;

      if (currentAlias && isPendingAlias(currentAlias)) {
        const deleted = await deleteAliasByValue(currentAlias, signal);
        if (!deleted) {
          return {
            ok: false,
            message: 'No se pudo eliminar el alias temporal previo.',
          };
        }
      }

      const created = await simfClients.registerAliasViaSimf(
        workingSession,
        trimmedAlias,
        appConfig.simulation.bankCode,
        getSessionKeyFromSimulationSession(session),
        signal,
      );
      if (!created.ok) {
        return { ok: false, message: created.message };
      }

      const primaryAccount = getPrimaryAccount(workingSession);
      if (!primaryAccount) {
        return { ok: false, message: 'Debes seleccionar una cuenta para vincular al alias.' };
      }

      const linked = await updateAliasLinkedAccount(trimmedAlias, primaryAccount.id, signal);
      if (!linked.ok) {
        return {
          ok: false,
          message: linked.message,
        };
      }

      return {
        ok: true,
        session: applyRegisteredAliasToSession(workingSession, trimmedAlias, primaryAccount.id),
      };
    },

    async deleteAlias(session, signal) {
      const aliasValue = session.alias?.trim();
      if (!aliasValue || isPendingAlias(aliasValue)) {
        return { ok: false, message: 'No hay un alias configurado para bloquear.' };
      }

      const bankCode = appConfig.simulation.bankCode;
      const sessionKey = getSessionKeyFromSimulationSession(session);
      const blocked = await simfClients.blockAliasViaSimf(
        aliasValue,
        bankCode,
        sessionKey,
        signal,
      );

      if (!blocked.ok) {
        return { ok: false, message: blocked.message };
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
          message: 'El alias se bloqueó, pero no se pudo refrescar la consulta.',
        };
      }

      const check = attachSessionToCheck(
        buildAliasCheckFromResolve(resolved.data),
        resolved.data,
        document,
      );

      return {
        ok: true,
        session: check.session,
        check,
      };
    },

    async verifyAliasViaSimf(session, bankCode, signal) {
      const resolvedBankCode = bankCode?.trim() || appConfig.simulation.bankCode;
      const sessionKey = getSessionKeyFromSimulationSession(session);

      await simfClients.resolveAliasViaSimf(
        session.mappedDocument.documentType,
        session.mappedDocument.documentNumber,
        resolvedBankCode,
        sessionKey,
        signal,
      );
    },
  };
}
