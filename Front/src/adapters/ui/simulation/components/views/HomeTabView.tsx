import {
  formatDocumentInput,
  getAccountLastDigits,
  getHomeAliasBadge,
  getPrimaryAccount,
  resolveSessionAliasLinkStatus,
  type SimulationSession,
} from '../../../../../domain/simulation';
import { SimStatusBadge } from '../ui/SimStatusBadge';
import '../simulationSteps.css';

type HomeTabViewProps = {
  session: SimulationSession;
  onStartPayment: () => void;
  onManageAlias: () => void;
  onLogout: () => void;
};

const badgeClassByVariant = {
  success: 'sim-session-banner__notice--success',
  warning: 'sim-session-banner__notice--warning',
  danger: 'sim-session-banner__notice--danger',
  info: '',
} as const;

export function HomeTabView({
  session,
  onStartPayment,
  onManageAlias,
  onLogout,
}: HomeTabViewProps) {
  const primaryAccount = getPrimaryAccount(session);
  const accountHint = primaryAccount
    ? `Cuenta ${primaryAccount.bank_id} ·••• ${getAccountLastDigits(primaryAccount.account_number)}`
    : 'Sin cuenta bancaria activa';

  const fullName = [session.customer.first_name, session.customer.last_name]
    .filter(Boolean)
    .join(' ');

  const documentLabel = formatDocumentInput(
    session.mappedDocument.documentType,
    session.mappedDocument.documentNumber,
  );

  const aliasBadge = getHomeAliasBadge(session);
  const linkStatus = resolveSessionAliasLinkStatus(session);

  return (
    <div className="sim-view">
      <div className="sim-card">
        <div className="sim-card__header">
          <div>
            <p className="sim-card__title">{fullName || 'Titular registrado'}</p>
            <p className="sim-card__subtitle">{documentLabel}</p>
          </div>
          {session.hasConfiguredAlias && linkStatus && (
            <SimStatusBadge status={linkStatus} />
          )}
        </div>

        {aliasBadge && (
          <p className={`sim-session-banner__notice ${badgeClassByVariant[aliasBadge.variant]}`}>
            {aliasBadge.text}
          </p>
        )}
      </div>

      <div className="sim-balance-card">
        <p className="sim-balance-card__label">Saldo disponible</p>
        <p className="sim-balance-card__amount">Bs. 12.450,00</p>
        <p className="sim-balance-card__hint">{accountHint}</p>
      </div>

      <div className="sim-quick-actions">
        <button
          type="button"
          className="sim-action-btn sim-action-btn--primary"
          onClick={onStartPayment}
        >
          <span className="sim-action-btn__icon">↗</span>
          <span>Pagar con alias</span>
        </button>
        <button type="button" className="sim-action-btn" onClick={onManageAlias}>
          <span className="sim-action-btn__icon">@</span>
          <span>Gestión de alias</span>
        </button>
      </div>

      <div className="sim-section">
        <button type="button" className="sim-mobile-btn sim-mobile-btn--ghost" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
