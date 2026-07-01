import { appConfig } from '../../app.config';
import { readApiError } from '../shared/readApiError';
import type { ResolveAliasResponse, ResolveByDocumentResult } from './alias.types';

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

export async function createAliasForCustomer(
  customerId: string,
  aliasValue: string,
  signal?: AbortSignal,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const response = await fetch(`${appConfig.apiBaseUrl}/alias`, {
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
