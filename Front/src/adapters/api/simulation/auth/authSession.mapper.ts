import type { LoginByDocumentResult } from '../../../../application/simulation/authSimulation.port';
import { applyBankAccountFilter } from '../../../../domain/simulation/aliasFlow';
import { hasConfiguredAliasValue } from '../../../../domain/simulation/auth.types';
import type { SimulationSession } from '../../../../domain/simulation/auth.types';
import type { ParsedDocument } from '../../../../domain/simulation/documentParser';
import { appConfig } from '../../app.config';
import type { ResolveAliasResponse } from '../alias/alias.types';

export function buildSession(
  response: ResolveAliasResponse,
  mappedDocument: ParsedDocument,
): SimulationSession {
  const alias = response.alias?.trim() || null;

  return applyBankAccountFilter(
    {
      customer: response.customer,
      accounts: response.accounts ?? [],
      alias,
      hasConfiguredAlias: hasConfiguredAliasValue(alias),
      mappedDocument,
      primaryAccountId: null,
      aliasCoreStatus: response.alias_status?.trim() || 'UNRG',
    },
    appConfig.simulation.bankCode,
  );
}

export function mapResolveFailure(status: number, message: string): LoginByDocumentResult {
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
