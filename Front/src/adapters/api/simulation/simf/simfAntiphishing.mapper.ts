import type { ResolvePaymentAliasResult } from '../../../../application/simulation/paymentSimulation.port';
import { SIMF_ALIAS_STATUS } from '../../../../domain/simulation/aliasStatus';
import type { PaymentRecipient } from '../../../../domain/simulation';

const SIMF_RESULT_ACCEPT = 'ACCP';
const SIMF_RESULT_REJECT = 'RJCT';

type SimfAntiphishingTitular = {
  Nm?: string;
  Id?: string;
  SchmeNm?: string;
};

type SimfAntiphishingReport = {
  Result?: string;
  Rsn?: string;
  Pty?: SimfAntiphishingTitular;
  AliasList?: Array<{
    Alias?: string;
    AgtList?: Array<{
      Agt?: string;
      Sts?: string;
    }>;
  }>;
};

type SimfAntiphishingMessage = {
  AlisIdInqRes?: {
    InqRpt?: SimfAntiphishingReport;
  };
};

function parseSimfDocumentId(documentId: string): { documentType: string; documentNumber: string } | null {
  const match = /^([VEJGP])(\d+)$/i.exec(documentId.trim());

  if (!match) {
    return null;
  }

  return {
    documentType: match[1].toUpperCase(),
    documentNumber: match[2],
  };
}

function splitTitularName(fullName: string): {
  firstName: string;
  middleName: string;
  lastName: string;
  secondLastName: string;
} {
  const normalized = fullName.trim().replace(/\s+/g, ' ');

  if (!normalized) {
    return { firstName: '', middleName: '', lastName: '', secondLastName: '' };
  }

  const parts = normalized.split(' ');

  if (parts.length === 1) {
    return { firstName: parts[0], middleName: '', lastName: '', secondLastName: '' };
  }

  if (parts.length === 2) {
    return { firstName: parts[0], middleName: '', lastName: parts[1], secondLastName: '' };
  }

  if (parts.length === 3) {
    return { firstName: parts[0], middleName: '', lastName: parts[1], secondLastName: parts[2] };
  }

  return {
    firstName: parts[0],
    middleName: parts[1],
    lastName: parts[2],
    secondLastName: parts.slice(3).join(' '),
  };
}

function resolveAgentStatus(
  report: SimfAntiphishingReport,
  aliasValue: string,
  bankCode: string,
): string | null {
  const aliasEntry = report.AliasList?.find(
    (entry) => (entry.Alias ?? '').trim().toLowerCase() === aliasValue.trim().toLowerCase(),
  );

  const agentEntry = aliasEntry?.AgtList?.find((entry) => entry.Agt === bankCode);
  return agentEntry?.Sts?.trim().toUpperCase() ?? null;
}

function buildRecipientFromTitular(
  aliasValue: string,
  titular: SimfAntiphishingTitular,
): PaymentRecipient | null {
  const document = parseSimfDocumentId(titular.Id ?? '');

  if (!document) {
    return null;
  }

  const { firstName, middleName, lastName, secondLastName } = splitTitularName(titular.Nm ?? '');

  if (!firstName && !lastName) {
    return null;
  }

  return {
    alias: aliasValue.trim(),
    firstName,
    middleName,
    lastName,
    secondLastName,
    email: '',
    documentType: document.documentType,
    documentNumber: document.documentNumber,
  };
}

export function mapAntiphishingResponseToPaymentAlias(
  aliasValue: string,
  bankCode: string,
  data: unknown,
): ResolvePaymentAliasResult {
  const message = data as SimfAntiphishingMessage;
  const report = message?.AlisIdInqRes?.InqRpt;

  if (!report) {
    return { ok: false, error: 'Respuesta de alias inválida.' };
  }

  const result = (report.Result ?? '').trim().toUpperCase();
  const reason = (report.Rsn ?? '').trim().toUpperCase();

  const GENERIC_ERROR = 'El alias no esta disponible en este momento, por favor valide con el banco destino';

  if (result === SIMF_RESULT_REJECT) {
    if (reason === 'RR10') {
      return { ok: false, error: 'Formato de alias inválido.' };
    }
    return { ok: false, error: GENERIC_ERROR };
  }

  if (result !== SIMF_RESULT_ACCEPT) {
    return { ok: false, error: GENERIC_ERROR };
  }

  const agentStatus = resolveAgentStatus(report, aliasValue, bankCode);

  if (
    agentStatus === SIMF_ALIAS_STATUS.BLOCKED ||
    agentStatus === SIMF_ALIAS_STATUS.UNREGISTERED ||
    agentStatus === SIMF_ALIAS_STATUS.PENDING ||
    agentStatus === SIMF_ALIAS_STATUS.INACTIVE
  ) {
    return { ok: false, error: GENERIC_ERROR };
  }

  const recipient = report.Pty ? buildRecipientFromTitular(aliasValue, report.Pty) : null;

  if (!recipient) {
    return { ok: false, error: GENERIC_ERROR };
  }

  return { ok: true, recipient };
}
