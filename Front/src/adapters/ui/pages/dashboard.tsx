import { useState, useEffect, useRef } from 'react';
import { useAlias } from '../hooks/useAlias';
import { AppShell } from '../components/AppShell';
import type { AppPage } from '../navigation';
import './dashboard.css';

type DashboardProps = {
  onNavigate: (page: AppPage) => void;
};

export function Dashboard({ onNavigate }: DashboardProps) {
  const [searchInput, setSearchInput] = useState('');
  const skipDebounceRef = useRef(true);

  const {
    aliases,
    pagination,
    searchTerm,
    loading,
    error,
    deletingCustomerId,
    deletingAll,
    refetch,
    nextPage,
    prevPage,
    setLimit,
    setSearch,
    removeAlias,
    removeAllAliases,
  } = useAlias();

  useEffect(() => {
    if (skipDebounceRef.current) {
      skipDebounceRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      setSearch(searchInput);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchInput, setSearch]);

  const isBusy = loading || deletingAll || Boolean(deletingCustomerId);

  if (loading && aliases.length === 0 && !searchTerm.trim()) {
    return (
      <AppShell activeItem="alias" onNavigate={onNavigate}>
        <div className="dashboard-state">Cargando alias...</div>
      </AppShell>
    );
  }

  if (error && aliases.length === 0 && !searchTerm.trim()) {
    return (
      <AppShell activeItem="alias" onNavigate={onNavigate}>
        <div className="dashboard-state">
          <p>Error: {error}</p>
          <button type="button" onClick={refetch}>
            Reintentar
          </button>
        </div>
      </AppShell>
    );
  }

  const hasRecords = pagination.total_records > 0;
  const canGoPrev = !isBusy && pagination.page > 1;
  const canGoNext =
    !isBusy &&
    pagination.total_pages > 0 &&
    pagination.page < pagination.total_pages;

  return (
    <AppShell activeItem="alias" onNavigate={onNavigate}>
      <div className="table-header">
        <h2 className="section-title">Panel de Control de Alias</h2>

        <div className="table-actions">
          <button
            type="button"
            className="danger-btn"
            disabled={isBusy || !hasRecords}
            onClick={removeAllAliases}
          >
            {deletingAll ? 'Eliminando...' : 'Eliminar todos'}
          </button>

          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar por nombre, documento o alias..."
              aria-label="Buscar alias"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <button
              type="button"
              className="search-icon"
              aria-label="Buscar"
              onClick={() => setSearch(searchInput)}
            >
              🔍
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="dashboard-state dashboard-inline-error">
          <p>Error: {error}</p>
          <button type="button" onClick={refetch}>
            Reintentar
          </button>
        </div>
      )}

      {loading && (
        <div className="dashboard-state dashboard-inline-loading">
          Cargando página {pagination.page}...
        </div>
      )}

      {!hasRecords && !loading ? (
        <div className="dashboard-empty">
          {searchTerm.trim()
            ? `No se encontraron resultados para "${searchTerm.trim()}".`
            : 'No hay alias registrados.'}
        </div>
      ) : (
        <>
          <div className={`table-wrapper${loading ? ' table-wrapper--loading' : ''}`}>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th className="col-num">#</th>
                  <th className="col-nombre">Nombre</th>
                  <th className="col-apellido">Apellido</th>
                  <th className="col-documento">Documento</th>
                  <th className="col-alias">Alias</th>
                  <th className="col-acciones">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {aliases.map((alias, index) => {
                  const itemNumber =
                    (pagination.page - 1) * pagination.limit + index + 1;
                  const isDeletingRow = deletingCustomerId === alias.customer_id;

                  return (
                    <tr key={`${alias.customer_id}-${alias.alias}`}>
                      <td className="col-num">{itemNumber}</td>
                      <td className="col-nombre">{alias.first_name}</td>
                      <td className="col-apellido">{alias.last_name}</td>
                      <td className="col-documento">
                        {alias.document_type}-{alias.document_number}
                      </td>
                      <td className="col-alias text-blue">{alias.alias}</td>
                      <td className="col-acciones">
                        <button
                          type="button"
                          className="delete-row-btn"
                          disabled={isBusy}
                          aria-label={`Eliminar alias ${alias.alias}`}
                          onClick={() => removeAlias(alias.customer_id, alias.alias)}
                        >
                          {isDeletingRow ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pagination-bar">
            <div className="pagination-info">
              Página {pagination.page} de {pagination.total_pages} ·{' '}
              {pagination.total_records.toLocaleString('es-VE')} registros
            </div>

            <div className="pagination-controls">
              <label className="pagination-limit" htmlFor="page-limit">
                Por página
              </label>
              <select
                id="page-limit"
                className="pagination-select"
                value={pagination.limit}
                disabled={isBusy}
                onChange={(event) => setLimit(Number(event.target.value))}
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>

              <button
                type="button"
                className="pagination-btn"
                onClick={prevPage}
                disabled={!canGoPrev}
              >
                Anterior
              </button>
              <button
                type="button"
                className="pagination-btn"
                onClick={nextPage}
                disabled={!canGoNext}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
