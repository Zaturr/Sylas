import {
  buildAccountAliasMatrix,
  countLegalEntityAliasProgress,
  formatRegistrationAccountType,
  hasAvailableAccountsForNewAlias,
} from '../../../../../domain/simulation/legalEntityAliasMatrix';
import type { AliasResolveEntry, SimulationSession } from '../../../../../domain/simulation/auth.types';
import { getAccountDisplayLabel } from '../../../../../domain/simulation/aliasFlow';
import { buildAliasCheckFromAliasEntry } from '../../../../../adapters/api/simulation/alias/aliasCheck.mapper';
import { SimStatusBadge } from '../ui/SimStatusBadge';
import '../simulationSteps.css';

type LegalEntityAccountsAliasesStepProps = {
  session: SimulationSession;
  isSubmitting: boolean;
  onAddAlias: () => void;
  onManageAlias: (entry: AliasResolveEntry) => void;
};

export function LegalEntityAccountsAliasesStep({
  session,
  isSubmitting,
  onAddAlias,
  onManageAlias,
}: LegalEntityAccountsAliasesStepProps) {
  const rows = buildAccountAliasMatrix(session);
  const progress = countLegalEntityAliasProgress(session);
  const canAddAlias = hasAvailableAccountsForNewAlias(session);

  return (
    <div className="sim-flow">
      <div className="sim-card">
        <p className="sim-card__title">Cuentas y MiAlias</p>
        <p className="sim-card__subtitle">
          Titular jurídico · {progress.configured}/{progress.eligible} cuentas con MiAlias
        </p>
        <p className="sim-field__hint">
          Cada cuenta elegible puede tener un MiAlias. Las cuentas en divisa no admiten MiAlias.
        </p>
      </div>

      {canAddAlias && (
        <div className="sim-flow__actions">
          <button
            type="button"
            className="sim-mobile-btn sim-mobile-btn--primary"
            disabled={isSubmitting}
            onClick={onAddAlias}
          >
            Agregar MiAlias nuevo
          </button>
        </div>
      )}

      <div className="sim-account-list" aria-label="Cuentas y MiAlias registrados">
        {rows.map(({ account, aliasEntry }) => {
          const isDollar = account.account_type?.toLowerCase() === 'dolares';

          return (
            <div key={account.id} className="sim-card" style={{ marginBottom: 10 }}>
              <div className="sim-card__row">
                <span>Cuenta</span>
                <strong>{getAccountDisplayLabel(account)}</strong>
              </div>
              <div className="sim-card__row">
                <span>Tipo</span>
                <strong>{formatRegistrationAccountType(account.account_type)}</strong>
              </div>
              <div className="sim-card__row">
                <span>MiAlias</span>
                {aliasEntry ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <strong>{aliasEntry.alias_value}</strong>
                    <SimStatusBadge
                      status={buildAliasCheckFromAliasEntry(aliasEntry, session.accounts).agentStatus}
                    />

                  </span>
                ) : (
                  <strong>{isDollar ? 'No aplica' : 'Sin MiAlias'}</strong>
                )}
              </div>

              {aliasEntry && (
                <p className="sim-field__hint" style={{ marginTop: 8 }}>
                  Esta cuenta ya está asociada al MiAlias {aliasEntry.alias_value}.
                </p>
              )}

              {aliasEntry && (
                <div className="sim-flow__actions" style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="sim-mobile-btn sim-mobile-btn--ghost"
                    disabled={isSubmitting}
                    onClick={() => onManageAlias(aliasEntry)}
                  >
                    Gestionar MiAlias
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
