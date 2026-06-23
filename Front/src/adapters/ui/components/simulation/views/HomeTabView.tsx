import '../simulationSteps.css';

type HomeTabViewProps = {
  onStartPayment: () => void;
};

export function HomeTabView({ onStartPayment }: HomeTabViewProps) {
  return (
    <div className="sim-view">
      <div className="sim-balance-card">
        <p className="sim-balance-card__label">Saldo disponible</p>
        <p className="sim-balance-card__amount">Bs. 12.450,00</p>
        <p className="sim-balance-card__hint">Cuenta principal ·••• 4821</p>
      </div>

      <div className="sim-quick-actions">
        <button type="button" className="sim-action-btn sim-action-btn--primary" onClick={onStartPayment}>
          <span className="sim-action-btn__icon">↗</span>
          <span>Pagar con alias</span>
        </button>
        <button type="button" className="sim-action-btn" disabled>
          <span className="sim-action-btn__icon">⇄</span>
          <span>Transferir</span>
        </button>
      </div>

      <div className="sim-section">
        <h3 className="sim-section__title">Actividad reciente</h3>
        <div className="sim-activity-item">
          <span className="sim-activity-item__icon">✓</span>
          <div>
            <p className="sim-activity-item__title">Pago recibido</p>
            <p className="sim-activity-item__meta">carlos.r123 · Bs. 250,00</p>
          </div>
        </div>
      </div>
    </div>
  );
}
