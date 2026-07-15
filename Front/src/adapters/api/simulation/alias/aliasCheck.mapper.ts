import type { Account } from '../../../../domain/account';
import type { CheckAliasResult } from '../../../../application/simulation/authSimulation.port';
import { filterAccountsByBankCode } from '../../../../domain/simulation/aliasFlow';
import { hasConfiguredAliasValue, type AliasResolveEntry } from '../../../../domain/simulation/auth.types';
import { SIMF_REASON_NOT_FOUND } from '../../../../domain/simulation/simf.constants';
import {
  SIMF_ALIAS_STATUS,
  coreAccountStatusToSimf,
  isAliasGloballyBlocked,
  type SimfAliasStatus,
} from '../../../../domain/simulation/aliasStatus';
import { appConfig } from '../../app.config';
import type { ResolveAliasResponse } from './alias.types';

function resolveAgentStatus(
  accounts: Account[],
  bankCode: string,
  linkedAccountId?: string | null,
  bankLinks?: ResolveAliasResponse['bank_links'],
): SimfAliasStatus {
  const linkedBank = bankLinks?.find((item) => item.bank_id === bankCode);
  if (linkedBank) {
    const linkedAccount = accounts.find((item) => item.id === linkedBank.account_id);
    if (linkedAccount) {
      return coreAccountStatusToSimf(linkedAccount.status);
    }
    return coreAccountStatusToSimf(linkedBank.status);
  }

  const linkedId = linkedAccountId?.trim();
  if (linkedId) {
    const linkedAccount = accounts.find((item) => item.id === linkedId && item.bank_id === bankCode);
    if (linkedAccount) {
      return coreAccountStatusToSimf(linkedAccount.status);
    }
  }

  return SIMF_ALIAS_STATUS.UNREGISTERED;
}

export function buildAliasCheckFromAliasEntry(
  entry: AliasResolveEntry,
  accounts: Account[],
): Extract<CheckAliasResult, { ok: true }> {
  const bankCode = appConfig.simulation.bankCode;
  const bankAccounts = filterAccountsByBankCode(accounts, bankCode);
  const agentStatus = isAliasGloballyBlocked(entry.alias_status)
    ? SIMF_ALIAS_STATUS.BLOCKED
    : resolveAgentStatus(bankAccounts, bankCode, entry.account_id, entry.bank_links);

  return {
    ok: true,
    status: 'found',
    alias: entry.alias_value,
    message:
      agentStatus === SIMF_ALIAS_STATUS.BLOCKED
        ? `Alias bloqueado: ${entry.alias_value}`
        : `Alias registrado: ${entry.alias_value}`,
    agentStatus,
    bankCode,
  };
}

export function buildAliasCheckFromResolve(
  resolved: ResolveAliasResponse,
): Extract<CheckAliasResult, { ok: true }> {
  const alias = resolved.alias?.trim() || null;
  const bankCode = appConfig.simulation.bankCode;
  const bankAccounts = filterAccountsByBankCode(resolved.accounts ?? [], bankCode);
  const agentStatus = isAliasGloballyBlocked(resolved.alias_status)
    ? SIMF_ALIAS_STATUS.BLOCKED
    : resolveAgentStatus(bankAccounts, bankCode, resolved.account_id, resolved.bank_links);

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
    message:
      agentStatus === SIMF_ALIAS_STATUS.BLOCKED
        ? `Alias bloqueado: ${alias}`
        : `Alias registrado: ${alias}`,
    agentStatus,
    bankCode,
  };
}

export function mapAliasCheckFromResolve(resolved: ResolveAliasResponse): CheckAliasResult {
  return buildAliasCheckFromResolve(resolved);
}
