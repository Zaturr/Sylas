import type { AliasService, CreateFullUserService } from '../../application/aliasService';
import type { PaginatedAliasResponse } from '../../domain/alias';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';

async function readApiError(response: Response, fallback: string): Promise<string> {
  const data = await response.json().catch(() => null);
  if (data && typeof data.error === 'string') {
    return data.error;
  }
  return fallback;
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

    const response = await fetch(`${API_BASE_URL}/alias/list?${params.toString()}`, {
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
    const response = await fetch(`${API_BASE_URL}/alias/resolve?${params.toString()}`, {
      signal,
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Titular no encontrado'));
    }

    return response.json();
  },

  createFullUser: async (data: CreateFullUserService): Promise<void> => {
    const payload = {
      document_type: data.customer.document_type,
      document_number: data.customer.document_number,
      first_name: data.customer.first_name,
      last_name: data.customer.last_name,
      email: data.customer.email,
      phone: data.customer.phone,
      alias_value: data.alias.alias_value,
      accounts: [],
    };

    const response = await fetch(`${API_BASE_URL}/users`, {
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
      `${API_BASE_URL}/users/${encodeURIComponent(customerId)}`,
      { method: 'DELETE' },
    );

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Error al eliminar el registro'));
    }
  },

  deleteAliasByValue: async (aliasValue: string): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/alias/${encodeURIComponent(aliasValue)}`,
      { method: 'DELETE' },
    );

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Error al eliminar el alias'));
    }
  },

  deleteAllAliases: async (): Promise<number> => {
    const response = await fetch(`${API_BASE_URL}/alias/all?confirm=true`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Error al eliminar todos los registros'));
    }

    const data = await response.json();
    return typeof data.deleted_count === 'number' ? data.deleted_count : 0;
  },
};
