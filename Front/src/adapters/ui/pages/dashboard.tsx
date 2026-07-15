import { useState, useEffect, useRef } from 'react';
import type { AliasDetail } from '../../../domain/alias';
import { getAliasStatusLabel, isAliasGloballyBlocked, SIMF_ALIAS_STATUS } from '../../../domain/simulation/aliasStatus';
import { useAlias } from '../hooks/useAlias';
import { AppShell } from '../components/AppShell';
import type { AppPage } from '../navigation';
import './dashboard.css';

type DashboardProps = {
  onNavigate: (page: AppPage) => void;
};

function isAliasBlockedRow(alias: AliasDetail): boolean {
  return isAliasGloballyBlocked(alias.alias_status);
}

function isAliasUnregisteredRow(alias: AliasDetail): boolean {
  const status = alias.alias_status?.trim().toUpperCase();
  return status === SIMF_ALIAS_STATUS.UNREGISTERED || !alias.alias?.trim();
}

function normalizeAccountStatus(status: string): 'actv' | 'inac' | null {
  const normalized = status.trim().toUpperCase();
  if (normalized === 'ACTIVE' || normalized === SIMF_ALIAS_STATUS.ACTIVE) {
    return 'actv';
  }
  if (normalized === 'INACTIVE' || normalized === SIMF_ALIAS_STATUS.INACTIVE) {
    return 'inac';
  }
  return null;
}

function getAccountStatusLabel(status: string): string {
  const kind = normalizeAccountStatus(status);
  if (kind === 'actv') {
    return getAliasStatusLabel(SIMF_ALIAS_STATUS.ACTIVE);
  }
  if (kind === 'inac') {
    return getAliasStatusLabel(SIMF_ALIAS_STATUS.INACTIVE);
  }
  return status.trim() || '—';
}

function renderAliasStatusCell(alias: AliasDetail) {
  if (isAliasBlockedRow(alias)) {
    return (
      <span className="dashboard-alias-status dashboard-alias-status--blkd">
        {getAliasStatusLabel(SIMF_ALIAS_STATUS.BLOCKED)}
      </span>
    );
  }

  if (isAliasUnregisteredRow(alias)) {
    return (
      <span className="dashboard-alias-status dashboard-alias-status--unrg">
        {getAliasStatusLabel(SIMF_ALIAS_STATUS.UNREGISTERED)}
      </span>
    );
  }

  if (alias.accounts.length === 0) {
    return '—';
  }

  // Agrupamos las cuentas por banco para mostrar solo 1 estado por banco
  const uniqueBanks = Array.from(new Set(alias.accounts.map(acc => acc.bank)));

  return uniqueBanks.map((bank, index) => {
    // Usar la cuenta vinculada al alias; si no hay bandera, tomar la primera del banco
    let account = alias.accounts.find((acc) => acc.bank === bank && acc.is_linked);
    if (!account) {
      account = alias.accounts.find((acc) => acc.bank === bank)!;
    }

    const kind = normalizeAccountStatus(account.status);
    const label = getAccountStatusLabel(account.status);
    const badgeClass =
      kind === 'actv'
        ? 'dashboard-alias-status--actv'
        : kind === 'inac'
          ? 'dashboard-alias-status--inac'
          : null;

    return (
      <span key={`${account.bank}-${index}`}>
        {index > 0 ? ', ' : null}
        {badgeClass ? (
          <span className={`dashboard-alias-status ${badgeClass}`}>{label}</span>
        ) : (
          label
        )}
      </span>
    );
  });
}

function renderDetailedTooltip(alias: AliasDetail) {
  if (isAliasBlockedRow(alias)) {
    return (
      <div className="dashboard-tooltip-content">
        <strong className="tooltip-title blkd">Bloqueado (BLKD)</strong>
        <p>El alias se encuentra bloqueado a nivel global. Por motivos de seguridad o a solicitud del cliente, está inhabilitado para recibir pagos en cualquier institución.</p>
      </div>
    );
  }

  if (isAliasUnregisteredRow(alias)) {
    return (
      <div className="dashboard-tooltip-content">
        <strong className="tooltip-title unrg">No Registrado (UNRG)</strong>
        <p>No tiene registrado el alias.</p>
      </div>
    );
  }

  if (alias.accounts.length === 0) {
    return (
      <div className="dashboard-tooltip-content">
        <strong className="tooltip-title">Sin Cuentas</strong>
        <p>El usuario no tiene cuentas bancarias asociadas a este alias en el sistema.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-tooltip-content">
      <strong className="tooltip-title">Estado por Institución:</strong>
      <ul className="tooltip-bank-list">
        {Array.from(new Set(alias.accounts.map((acc) => acc.bank))).map((bank) => {
          const acc =
            alias.accounts.find((item) => item.bank === bank && item.is_linked) ??
            alias.accounts.find((item) => item.bank === bank);
          if (!acc) {
            return null;
          }

          const kind = normalizeAccountStatus(acc.status);
          return (
            <li key={bank}>
              <span className="bank-code">Banco {acc.bank}:</span>
              {kind === 'actv' ? (
                <span className="status-text actv">Activo (ACTV) - Alias activo.</span>
              ) : kind === 'inac' ? (
                <span className="status-text inac">Inactivo (INAC) - Alias inactivo.</span>
              ) : (
                <span className="status-text">Estado desconocido ({acc.status}).</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

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
                  <th className="col-banco">Código banco</th>
                  <th className="col-status-alias">Status alias</th>
                  <th className="col-acciones">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {aliases.map((alias, index) => {
                  const itemNumber =
                    (pagination.page - 1) * pagination.limit + index + 1;
                  const isDeletingRow = deletingCustomerId === alias.customer_id;

                  return (
                    <tr key={alias.customer_id}>
                      <td className="col-num">{itemNumber}</td>
                      <td className="col-nombre">{alias.first_name}</td>
                      <td className="col-apellido">{alias.last_name}</td>
                      <td className="col-documento">
                        {alias.document_type}-{alias.document_number}
                      </td>
                      <td className="col-alias text-blue">{alias.alias?.trim() || '—'}</td>
                      <td className="col-banco">
                        {Array.from(new Set(alias.accounts.map((account) => account.bank))).join(', ') || '—'}
                      </td>
                      <td className="col-status-alias">
                        {renderAliasStatusCell(alias)}
                      </td>
                      <td className="col-acciones">
                        <div className="dashboard-actions-group">
                          <div className="dashboard-status-wrapper">
                            <div className="dashboard-status-info">!</div>
                            <div className="dashboard-status-tooltip">
                              {renderDetailedTooltip(alias)}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="delete-row-btn icon-btn"
                            disabled={isBusy}
                            aria-label={`Eliminar alias ${alias.alias}`}
                            onClick={() => removeAlias(alias.customer_id, alias.alias)}
                            title="Eliminar alias"
                          >
                            {isDeletingRow ? (
                              <span className="spinner-icon">↻</span>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              </svg>
                            )}
                          </button>
                        </div>
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
