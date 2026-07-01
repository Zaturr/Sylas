import type { Account } from '../../../../domain/account';
import type { CheckAliasResult } from '../../../../application/simulation/authSimulation.port';
import { filterAccountsByBankCode } from '../../../../domain/simulation/aliasFlow';
import { hasConfiguredAliasValue } from '../../../../domain/simulation/auth.types';
import { SIMF_REASON_NOT_FOUND } from '../../../../domain/simulation/simf.constants';
import {
  SIMF_ALIAS_STATUS,
  coreAccountStatusToSimf,
  isAliasGloballyBlocked,
  type SimfAliasStatus,
} from '../../../../domain/simulation/aliasStatus';
import { appConfig } from '../../app.config';
import type { ResolveAliasResponse } from './alias.types';

function resolveAgentStatus(accounts: Account[], bankCode: string): SimfAliasStatus {
  const account = accounts.find((item) => item.bank_id === bankCode);
  if (!account) {
    return SIMF_ALIAS_STATUS.UNREGISTERED;
  }
  return coreAccountStatusToSimf(account.status);
}

export function buildAliasCheckFromResolve(
  resolved: ResolveAliasResponse,
): Extract<CheckAliasResult, { ok: true }> {
  const alias = resolved.alias?.trim() || null;
  const bankCode = appConfig.simulation.bankCode;
  const bankAccounts = filterAccountsByBankCode(resolved.accounts ?? [], bankCode);
  const agentStatus = isAliasGloballyBlocked(resolved.alias_status)
    ? SIMF_ALIAS_STATUS.BLOCKED
    : resolveAgentStatus(bankAccounts, bankCode);

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
