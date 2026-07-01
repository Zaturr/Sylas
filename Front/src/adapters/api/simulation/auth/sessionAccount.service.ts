import { appConfig } from '../../app.config';
import { generateBankAccountNumber } from '../../../../domain/simulation/accountNumber';
import { filterAccountsByBankCode } from '../../../../domain/simulation/aliasFlow';
import type { ParsedDocument } from '../../../../domain/simulation/documentParser';
import type { SimulationSession } from '../../../../domain/simulation/auth.types';
import type { ResolveAliasResponse } from '../alias/alias.types';
import { addAccountForCustomer, resolveByDocument } from '../alias/aliasHttp.client';
import { buildSession } from './authSession.mapper';
function isAccountNumberCollision(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes('cuenta') && normalized.includes('registrad');
}

function isBankAccountAlreadyRegistered(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes('ya tiene una cuenta') && normalized.includes('banco');
}

/**
 * POST /accounts — agrega cuenta al cliente existente (handler add_account.go).
 * Solo se invoca cuando el titular no tiene cuenta en el banco configurado.
 */
async function addConfiguredBankAccountIfMissing(
  session: SimulationSession,
  signal?: AbortSignal,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const aliasValue = session.alias?.trim();
  if (!aliasValue) {
    return {
      ok: false,
      message: 'No hay alias asociado para registrar la cuenta del banco configurado.',
    };
  }

  const { bankCode, accountSuffixLength, accountType, maxAccountGenerationAttempts } =
    appConfig.simulation;

  let lastError = 'No se pudo crear la cuenta del banco configurado.';

  for (let attempt = 0; attempt < maxAccountGenerationAttempts; attempt += 1) {
    const accountNumber = generateBankAccountNumber(bankCode, accountSuffixLength);

    const result = await addAccountForCustomer(
      {
        document_number: session.mappedDocument.documentNumber,
        email: session.customer.email.trim(),
        alias_value: aliasValue,
        bank_id: bankCode,
        account_number: accountNumber,
        account_type: accountType,
      },
      signal,
    );

    if (result.ok) {
      return { ok: true };
    }

    lastError = result.message;

    if (isBankAccountAlreadyRegistered(lastError)) {
      return { ok: true };
    }

    if (!isAccountNumberCollision(lastError)) {
      break;
    }
  }

  return { ok: false, message: lastError };
}

/** Sesión con cuentas filtradas al banco configurado en app.config. */
export function buildFilteredSession(
  response: ResolveAliasResponse,
  mappedDocument: ParsedDocument,
): SimulationSession {
  return buildSession(response, mappedDocument);
}

/**
 * Login / alta de titular: filtra cuentas del banco configurado y, si no tiene
 * ninguna en ese banco, crea una vía POST /accounts (add_account.go).
 */
export async function buildSimulationSession(
  response: ResolveAliasResponse,
  mappedDocument: ParsedDocument,
  signal?: AbortSignal,
): Promise<{ ok: true; session: SimulationSession } | { ok: false; message: string }> {
  const bankCode = appConfig.simulation.bankCode;
  const accountsAtBank = filterAccountsByBankCode(response.accounts ?? [], bankCode);

  if (accountsAtBank.length > 0) {
    return {
      ok: true,
      session: buildFilteredSession(response, mappedDocument),
    };
  }

  const baseSession = buildSession(response, mappedDocument);
  const created = await addConfiguredBankAccountIfMissing(baseSession, signal);
  if (!created.ok) {
    return created;
  }

  const resolved = await resolveByDocument(
    mappedDocument.documentType,
    mappedDocument.documentNumber,
    signal,
  );

  if (!resolved.ok) {
    return {
      ok: false,
      message: 'La cuenta se creó, pero no se pudo refrescar la sesión.',
    };
  }

  const session = buildFilteredSession(resolved.data, mappedDocument);

  if (session.accounts.length === 0) {
    return {
      ok: false,
      message: 'No se encontró la cuenta del banco configurado para este titular.',
    };
  }

  return { ok: true, session };
}
