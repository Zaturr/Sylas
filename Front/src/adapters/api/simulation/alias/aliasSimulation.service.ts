import type {
  CheckAliasResult,
  DeleteAliasResult,
  RegisterAliasResult,
  UpdateAliasStatusInput,
  UpdateAliasStatusResult,
} from '../../../../application/simulation/authSimulation.port';
import type { SimulationSession } from '../../../../domain/simulation/auth.types';
import { isPendingAlias } from '../../../../domain/simulation/auth.types';
import { parseDocumentInput } from '../../../../domain/simulation/documentParser';
import { validateAliasValue } from '../../../../domain/simulation/aliasValidation';
import { SIMF_REASON_NOT_FOUND } from '../../../../domain/simulation/simf.constants';
import { SIMF_ALIAS_STATUS } from '../../../../domain/simulation/aliasStatus';
import { appConfig } from '../../app.config';
import {
  buildRegistrationPayloadFromSession,
} from '../shared/registrationPayload.builder';
import {
  resolveByDocument,
  deleteAliasByValue,
  createAliasForCustomer,
  postRegisterUser,
} from './aliasHttp.client';
import {
  buildAliasCheckFromResolve,
  mapAliasCheckFromResolve,
} from './aliasCheck.mapper';
import { buildFilteredSession } from '../auth/sessionAccount.service';
import { updateAliasViaSimf } from '../simf/simfAliasUpdate.client';
import { blockAliasViaSimf } from '../simf/simfAliasBlock.client';

export async function checkAliasByDocument(
  documentInput: string,
  signal?: AbortSignal,
): Promise<CheckAliasResult> {
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
        bankCode: appConfig.simulation.bankCode,
      };
    }

    return {
      ok: false,
      message: resolved.message,
    };
  }

  return mapAliasCheckFromResolve(resolved.data);
}

export async function updateAliasStatus(
  session: SimulationSession,
  input: UpdateAliasStatusInput,
  signal?: AbortSignal,
): Promise<UpdateAliasStatusResult> {
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
    session: buildFilteredSession(resolved.data, document),
    check,
  };
}

export async function registerAlias(
  session: SimulationSession,
  aliasValue: string,
  signal?: AbortSignal,
): Promise<RegisterAliasResult> {
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
    const registered = await postRegisterUser(payload, signal, 'No se pudo registrar el alias');

    if (!registered.ok) {
      return { ok: false, message: registered.message };
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
    session: buildFilteredSession(resolved.data, document),
  };
}

export async function deleteAlias(
  session: SimulationSession,
  signal?: AbortSignal,
): Promise<DeleteAliasResult> {
  const aliasValue = session.alias?.trim();
  if (!aliasValue || isPendingAlias(aliasValue)) {
    return { ok: false, message: 'No hay un alias configurado para bloquear.' };
  }

  const bankCode = appConfig.simulation.bankCode;
  const blocked = await blockAliasViaSimf(aliasValue, bankCode, signal);
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

  const check = buildAliasCheckFromResolve(resolved.data);

  return {
    ok: true,
    session: buildFilteredSession(resolved.data, document),
    check,
  };
}
