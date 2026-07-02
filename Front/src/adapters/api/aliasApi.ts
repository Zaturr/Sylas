import type { AliasService, CreateFullUserService } from '../../application/aliasService';
import type { PaginatedAliasResponse } from '../../domain/alias';
import { appConfig } from './app.config';

async function readApiError(response: Response, fallback: string): Promise<string> {
  const data = await response.json().catch(() => null);
  if (data && typeof data.error === 'string') {
    return data.error;
  }
  return fallback;
}

function buildCustomerContactFromAlias(
  documentType: string,
  documentNumber: string,
  aliasValue: string,
) {
  const normalizedType = documentType.trim().toUpperCase();
  const normalizedAlias = aliasValue.trim().toLowerCase();
  const normalizedDocument = documentNumber.trim();

  return {
    email: `${normalizedAlias}@bdca.local`,
    phone: `BDCA${normalizedType}${normalizedDocument}`,
  };
}

export const aliasAdapter: AliasService = {
  getAliasDetailsPaginated: async (
    page: number,
    limit: number,
    search = '',
    signal?: AbortSignal,
  ): Promise<PaginatedAliasResponse> => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    const trimmedSearch = search.trim();
    if (trimmedSearch) {
      params.set('search', trimmedSearch);
    }

    const response = await fetch(`${appConfig.apiBaseUrl}/alias/list?${params.toString()}`, {
      signal,
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Error al obtener el detalle de los alias'));
    }

    return response.json();
  },

  resolveByDocument: async (
    documentType: string,
    documentNumber: string,
    signal?: AbortSignal,
  ) => {
    const params = new URLSearchParams({
      document_type: documentType,
      document_number: documentNumber,
    });
    const response = await fetch(`${appConfig.apiBaseUrl}/alias/resolve?${params.toString()}`, {
      signal,
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Titular no encontrado'));
    }

    return response.json();
  },

  resolveByAliasValue: async (aliasValue, signal) => {
    const trimmedAlias = aliasValue.trim();
    const params = new URLSearchParams({
      page: '1',
      limit: '50',
      search: trimmedAlias,
    });

    const response = await fetch(`${appConfig.apiBaseUrl}/alias/list?${params.toString()}`, {
      signal,
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Error al buscar el alias'));
    }

    const data = (await response.json()) as PaginatedAliasResponse;
    const match = data.data.find(
      (item) => item.alias.toLowerCase() === trimmedAlias.toLowerCase(),
    );

    if (!match) {
      throw new Error('Alias no encontrado en el sistema');
    }

    return {
      alias: match.alias,
      alias_status: match.alias_status,
      customer: {
        id: match.customer_id,
        document_type: match.document_type,
        document_number: match.document_number,
        first_name: match.first_name,
        last_name: match.last_name,
        email: match.email,
        phone: match.phone,
        created_at: '',
      },
      accounts: match.accounts.map((account, index) => ({
        id: String(index),
        bank_id: account.bank,
        customer_id: match.customer_id,
        account_number: account.account_number,
        account_type: 'CTA. Corriente',
        status: account.status,
        created_at: '',
      })),
    };
  },

  createFullUser: async (data: CreateFullUserService): Promise<void> => {
    const contact = buildCustomerContactFromAlias(
      data.customer.document_type,
      data.customer.document_number,
      data.alias.alias_value,
    );

    const payload = {
      document_type: data.customer.document_type,
      document_number: data.customer.document_number.trim(),
      first_name: data.customer.first_name.trim(),
      last_name: data.customer.last_name.trim(),
      email: contact.email,
      phone: contact.phone,
      alias_value: data.alias.alias_value.trim(),
      accounts: [],
    };

    const response = await fetch(`${appConfig.apiBaseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Error al crear el usuario'));
    }
  },

  deleteAliasByCustomerId: async (customerId: string): Promise<void> => {
    const response = await fetch(
      `${appConfig.apiBaseUrl}/users/${encodeURIComponent(customerId)}`,
      { method: 'DELETE' },
    );

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Error al eliminar el registro'));
    }
  },

  deleteAliasByValue: async (aliasValue: string): Promise<void> => {
    const response = await fetch(
      `${appConfig.apiBaseUrl}/alias/${encodeURIComponent(aliasValue)}`,
      { method: 'DELETE' },
    );

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Error al eliminar el alias'));
    }
  },

  deleteAllAliases: async (): Promise<number> => {
    const response = await fetch(`${appConfig.apiBaseUrl}/alias/all?confirm=true`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Error al eliminar todos los registros'));
    }

    const data = await response.json();
    return typeof data.deleted_count === 'number' ? data.deleted_count : 0;
  },
};
