import type { PaginatedAliasResponse } from '../../../../domain/alias';
import { formatDocumentInput } from '../../../../domain/validations';
import { appConfig } from '../../app.config';
import { readApiError } from '../shared/readApiError';
import type { ResolveAliasResponse, ResolveByDocumentResult } from './alias.types';

const LOGIN_DOCUMENTS_PAGE_LIMIT = 100;

/** Lista cédulas únicas desde alias/list para autocompletar el login del simulador. */
export async function listLoginDocuments(signal?: AbortSignal): Promise<string[]> {
  const documents = new Set<string>();
  let page = 1;
  let totalPages = 1;

  do {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(LOGIN_DOCUMENTS_PAGE_LIMIT),
    });

    const response = await fetch(`${appConfig.apiBaseUrl}/alias/list?${params.toString()}`, {
      signal,
    });

    if (!response.ok) {
      break;
    }

    const data = (await response.json()) as PaginatedAliasResponse;
    for (const item of data.data) {
      const documentType = item.document_type?.trim() ?? '';
      const documentNumber = item.document_number?.trim() ?? '';
      if (!documentType || !documentNumber) {
        continue;
      }
      documents.add(formatDocumentInput(documentType, documentNumber));
    }

    totalPages = Math.max(1, data.pagination?.total_pages ?? page);
    page += 1;
  } while (page <= totalPages);

  return Array.from(documents).sort((a, b) => a.localeCompare(b));
}

export async function resolveByDocument(
  documentType: string,
  documentNumber: string,
  signal?: AbortSignal,
): Promise<ResolveByDocumentResult> {
  const params = new URLSearchParams({
    document_type: documentType,
    document_number: documentNumber,
  });

  const response = await fetch(`${appConfig.apiBaseUrl}/alias/resolve?${params.toString()}`, {
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

export async function deleteAliasByValue(
  aliasValue: string,
  signal?: AbortSignal,
): Promise<boolean> {
  const response = await fetch(`${appConfig.apiBaseUrl}/alias/${encodeURIComponent(aliasValue)}`, {
    method: 'DELETE',
    signal,
  });

  return response.ok;
}

export async function updateAliasLinkedAccount(
  aliasValue: string,
  accountId: string,
  signal?: AbortSignal,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const response = await fetch(`${appConfig.apiBaseUrl}/alias/${encodeURIComponent(aliasValue)}/account`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account_id: accountId }),
    signal,
  });

  if (response.ok) {
    return { ok: true };
  }

  return {
    ok: false,
    message: await readApiError(response, 'No se pudo actualizar la cuenta vinculada'),
  };
}

export async function createAliasForCustomer(
  customerId: string,
  aliasValue: string,
  accountId: string,
  signal?: AbortSignal,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const response = await fetch(`${appConfig.apiBaseUrl}/alias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_id: customerId,
      alias_value: aliasValue,
      account_id: accountId,
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

export async function postRegisterUser(
  payload: unknown,
  signal?: AbortSignal,
  errorFallback = 'Error al registrar el titular',
): Promise<{ ok: true } | { ok: false; message: string }> {
  const response = await fetch(`${appConfig.apiBaseUrl}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (response.ok) {
    return { ok: true };
  }

  return {
    ok: false,
    message: await readApiError(response, errorFallback),
  };
}

export type AddAccountPayload = {
  document_number: string;
  email: string;
  alias_value: string;
  bank_id: string;
  account_number: string;
  account_type: string;
};

export async function addAccountForCustomer(
  payload: AddAccountPayload,
  signal?: AbortSignal,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const response = await fetch(`${appConfig.apiBaseUrl}/accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (response.ok) {
    return { ok: true };
  }

  return {
    ok: false,
    message: await readApiError(response, 'No se pudo crear la cuenta del banco configurado'),
  };
}
