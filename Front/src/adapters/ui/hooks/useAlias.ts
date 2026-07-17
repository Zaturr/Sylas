import { useState, useEffect, useCallback, useRef } from 'react';
import { type AliasDetail, type PaginationMeta } from '../../../domain/alias';
import { parseDocumentInput } from '../../../domain/validations';
import { type ResolveAliasService } from '../../../application/aliasService';
import { useAliasService } from '../providers/AppServicesProvider';

const DEFAULT_LIMIT = 20;

export type AliasSchemeFilter = '' | 'SCID' | 'SRIF' | 'SPAS';

function mapResolveToAliasDetail(resolved: ResolveAliasService): AliasDetail {
  return {
    customer_id: resolved.customer.id,
    document_type: resolved.customer.document_type,
    document_number: resolved.customer.document_number,
    first_name: resolved.customer.first_name,
    middle_name: resolved.customer.middle_name || '',
    last_name: resolved.customer.last_name,
    second_last_name: resolved.customer.second_last_name,
    alias: resolved.alias,
    alias_status: resolved.alias_status ?? 'UNRG',
    email: resolved.customer.email,
    phone: resolved.customer.phone,
    accounts: resolved.accounts.map((account) => ({
      bank: account.bank_id,
      account_number: account.account_number,
      status: account.status,
    })),
  };
}

export const useAlias = () => {
  const aliasService = useAliasService();
  const [aliases, setAliases] = useState<AliasDetail[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: DEFAULT_LIMIT,
    total_records: 0,
    total_pages: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [schemeFilter, setSchemeFilterState] = useState<AliasSchemeFilter>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const fetchGenerationRef = useRef(0);

  const fetchAliases = useCallback(async (
    page: number,
    limit: number,
    search: string,
    scheme: AliasSchemeFilter,
    generation: number,
  ) => {
    try {
      setLoading(true);
      setError(null);
      const term = search.trim();

      const document = parseDocumentInput(term);
      if (document) {
        try {
          const resolved = await aliasService.resolveByDocument(
            document.documentType,
            document.documentNumber,
          );
          if (generation !== fetchGenerationRef.current) {
            return;
          }
          setAliases([mapResolveToAliasDetail(resolved)]);
          setPagination({
            page: 1,
            limit,
            total_records: 1,
            total_pages: 1,
          });
          return;
        } catch {
          if (generation !== fetchGenerationRef.current) {
            return;
          }
        }
      }

      const result = await aliasService.getAliasDetailsPaginated(page, limit, term, scheme);

      if (generation !== fetchGenerationRef.current) {
        return;
      }

      setAliases(result.data);
      setPagination(result.pagination);
    } catch (err) {
      if (generation !== fetchGenerationRef.current) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      if (generation === fetchGenerationRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const generation = ++fetchGenerationRef.current;
    fetchAliases(pagination.page, pagination.limit, searchTerm, schemeFilter, generation);
  }, [fetchAliases, pagination.page, pagination.limit, searchTerm, schemeFilter]);

  const goToPage = (page: number) => {
    if (loading || deletingAll || deletingCustomerId) {
      return;
    }
    if (page < 1 || (pagination.total_pages > 0 && page > pagination.total_pages)) {
      return;
    }
    if (page === pagination.page) {
      return;
    }
    setPagination((prev) => ({ ...prev, page }));
  };

  const nextPage = () => goToPage(pagination.page + 1);
  const prevPage = () => goToPage(pagination.page - 1);

  const setLimit = (limit: number) => {
    if (loading || deletingAll || deletingCustomerId) {
      return;
    }
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  };

  const setSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const setSchemeFilter = useCallback((value: AliasSchemeFilter) => {
    setSchemeFilterState(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const refetch = () => {
    const generation = ++fetchGenerationRef.current;
    fetchAliases(pagination.page, pagination.limit, searchTerm, schemeFilter, generation);
  };

  const removeAlias = async (customerId: string, aliasValue: string) => {
    const confirmed = window.confirm(
      `¿Eliminar el MiAlias "${aliasValue}" y todos sus datos relacionados?`,
    );
    if (!confirmed) {
      return;
    }

    try {
      setDeletingCustomerId(customerId);
      setError(null);
      await aliasService.deleteAliasByCustomerId(customerId);

      if (aliases.length === 1 && pagination.page > 1) {
        setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
        return;
      }

      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el registro');
    } finally {
      setDeletingCustomerId(null);
    }
  };

  const removeAllAliases = async () => {
    const firstConfirm = window.confirm(
      '¿Eliminar TODOS los MiAlias, clientes y cuentas? Esta acción no se puede deshacer.',
    );
    if (!firstConfirm) {
      return;
    }

    const secondConfirm = window.confirm(
      'Confirma de nuevo: se borrarán todos los registros de la base de datos.',
    );
    if (!secondConfirm) {
      return;
    }

    try {
      setDeletingAll(true);
      setError(null);
      await aliasService.deleteAllAliases();
      setSearchTerm('');
      setSchemeFilterState('');
      setPagination((prev) => ({ ...prev, page: 1 }));
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar todos los registros');
    } finally {
      setDeletingAll(false);
    }
  };

  return {
    aliases,
    pagination,
    searchTerm,
    schemeFilter,
    loading,
    error,
    deletingCustomerId,
    deletingAll,
    refetch,
    goToPage,
    nextPage,
    prevPage,
    setLimit,
    setSearch,
    setSchemeFilter,
    removeAlias,
    removeAllAliases,
  };
};
