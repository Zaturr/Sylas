import type { ResolvePaymentAliasResult } from '../../../../application/simulation/paymentSimulation.port';
import { SIMF_ALIAS_STATUS } from '../../../../domain/simulation/aliasStatus';
import { isSimfNotFoundReason } from '../../../../domain/simulation/simf.constants';
import { DESTINATION_BLOCKED_ALIAS_PAYMENT_MESSAGE } from '../../../../domain/simulation/paymentValidation';
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

function splitTitularName(fullName: string): { firstName: string; lastName: string } {
  const normalized = fullName.trim();

  if (!normalized) {
    return { firstName: '', lastName: '' };
  }

  const spaceIndex = normalized.indexOf(' ');

  if (spaceIndex === -1) {
    return { firstName: normalized, lastName: '' };
  }

  return {
    firstName: normalized.slice(0, spaceIndex).trim(),
    lastName: normalized.slice(spaceIndex + 1).trim(),
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

  const { firstName, lastName } = splitTitularName(titular.Nm ?? '');

  if (!firstName && !lastName) {
    return null;
  }

  return {
    alias: aliasValue.trim(),
    firstName,
    lastName,
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
    return { ok: false, error: 'Respuesta SIMF inválida.' };
  }

  const result = (report.Result ?? '').trim().toUpperCase();
  const reason = (report.Rsn ?? '').trim().toUpperCase();

  if (result === SIMF_RESULT_REJECT) {
    if (isSimfNotFoundReason(reason)) {
      return { ok: false, error: 'Alias no encontrado en el sistema' };
    }

    if (reason === 'RR10') {
      return { ok: false, error: 'Formato de alias inválido.' };
    }

    return { ok: false, error: 'No se pudo resolver el alias destino.' };
  }

  if (result !== SIMF_RESULT_ACCEPT) {
    return { ok: false, error: 'No se pudo resolver el alias destino.' };
  }

  const agentStatus = resolveAgentStatus(report, aliasValue, bankCode);

  if (agentStatus === SIMF_ALIAS_STATUS.BLOCKED) {
    return { ok: false, error: DESTINATION_BLOCKED_ALIAS_PAYMENT_MESSAGE };
  }

  if (
    agentStatus === SIMF_ALIAS_STATUS.PENDING ||
    agentStatus === SIMF_ALIAS_STATUS.INACTIVE ||
    agentStatus === SIMF_ALIAS_STATUS.UNREGISTERED
  ) {
    return { ok: false, error: 'El alias destino no está activo.' };
  }

  const recipient = report.Pty ? buildRecipientFromTitular(aliasValue, report.Pty) : null;

  if (!recipient) {
    return { ok: false, error: 'Titular no se encuentra en el sistema' };
  }

  return { ok: true, recipient };
}
