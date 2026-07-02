import { useState } from 'react';
import {
  formatDocumentInput,
  getAccountLastDigits,
  getHomeAliasBadge,
  getPrimaryAccount,
  type SimulationSession,
} from '../../../../../domain/simulation';
import '../simulationSteps.css';
import './HomeTabView.css';

type HomeTabViewProps = {
  session: SimulationSession;
  onStartPayment: () => void;
  onManageAlias: () => void;
  onLogout: () => void;
};

const badgeClassByVariant = {
  success: 'sim-home-hero__notice--success',
  warning: 'sim-home-hero__notice--warning',
  danger: 'sim-home-hero__notice--danger',
  info: '',
} as const;

type HomeMenuItem = {
  id: string;
  label: string;
  icon: string;
  enabled: boolean;
  highlighted?: boolean;
  onClick?: () => void;
};

export function HomeTabView({
  session,
  onStartPayment,
  onManageAlias,
  onLogout,
}: HomeTabViewProps) {
  const [balanceVisible, setBalanceVisible] = useState(true);

  const primaryAccount = getPrimaryAccount(session);
  const accountHint = primaryAccount
    ? `Cuenta ${primaryAccount.bank_id} ·••• ${getAccountLastDigits(primaryAccount.account_number)}`
    : 'Sin cuenta bancaria activa';

  const firstName = session.customer.first_name.trim() || 'Usuario';
  const avatarInitial = firstName.charAt(0).toUpperCase();

  const documentLabel = formatDocumentInput(
    session.mappedDocument.documentType,
    session.mappedDocument.documentNumber,
  );

  const aliasBadge = getHomeAliasBadge(session);
  const aliasPending = !session.hasConfiguredAlias;

  const menuItems: HomeMenuItem[] = [
    { id: 'info', label: 'Información', icon: 'ℹ', enabled: false },
    { id: 'payment', label: 'Pago Móvil', icon: '📱', enabled: true, onClick: onStartPayment },
    { id: 'services', label: 'Servicios', icon: '🛠', enabled: false },
    { id: 'topup', label: 'Recargas', icon: '↻', enabled: false },
    { id: 'transfer', label: 'Transferir', icon: '⇄', enabled: false },
    {
      id: 'alias',
      label: 'Alias',
      icon: '👤',
      enabled: true,
      highlighted: aliasPending,
      onClick: onManageAlias,
    },
    { id: 'web', label: 'Web', icon: '🌐', enabled: false },
  ];

  return (
    <div className="sim-home">
      <section className="sim-home-hero" aria-label="Bienvenida">
        <div className="sim-home-hero__profile">
          <div className="sim-home-hero__avatar" aria-hidden="true">
            {avatarInitial}
          </div>
          <div className="sim-home-hero__identity">
            <p className="sim-home-hero__greeting">Hola, {firstName}</p>
            <p className="sim-home-hero__document">{documentLabel}</p>
          </div>
        </div>

        {aliasBadge && (
          <p
            className={`sim-home-hero__notice ${badgeClassByVariant[aliasBadge.variant]}`}
          >
            {aliasBadge.text}
          </p>
        )}
      </section>

      <section className="sim-home-balance" aria-label="Balance disponible">
        <div className="sim-home-balance__content">
          <p className="sim-home-balance__label">Balance</p>
          <div className="sim-home-balance__amount-row">
            <p className="sim-home-balance__amount">
              {balanceVisible ? 'Bs 12.450,00' : '••••••••'}
            </p>
            <button
              type="button"
              className="sim-home-balance__toggle"
              aria-label={balanceVisible ? 'Ocultar saldo' : 'Mostrar saldo'}
              aria-pressed={balanceVisible}
              onClick={() => setBalanceVisible((visible) => !visible)}
            >
              {balanceVisible ? '👁' : '👁‍🗨'}
            </button>
          </div>
          <p className="sim-home-balance__hint">{accountHint}</p>
        </div>
        <button
          type="button"
          className="sim-home-balance__nav"
          aria-label="Ver detalle de cuenta"
        >
          ›
        </button>
      </section>

      <section className="sim-home-grid" aria-label="Accesos rápidos">
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sim-home-tile${
              item.highlighted ? ' sim-home-tile--highlight' : ''
            }`}
            disabled={!item.enabled}
            onClick={item.onClick}
          >
            <span className="sim-home-tile__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="sim-home-tile__label">{item.label}</span>
          </button>
        ))}
      </section>

      <div className="sim-home-footer">
        <button type="button" className="sim-home-logout" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
