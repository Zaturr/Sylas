import '../simulationSteps.css';

type PaymentsTabViewProps = {
  onStartPayment: () => void;
};

export function PaymentsTabView({ onStartPayment }: PaymentsTabViewProps) {
  return (
    <div className="sim-view">
      <div className="sim-section">
        <h3 className="sim-section__title">Pagos</h3>
        <p className="sim-section__text">
          Envía dinero de forma rápida usando el alias del destinatario.
        </p>
      </div>

      <p className="sim-flow__notice">
        Si el alias destino está bloqueado (BLKD), no se puede realizar el pago.
      </p>

      <button
        type="button"
        className="sim-action-btn sim-action-btn--primary sim-action-btn--full"
        onClick={onStartPayment}
      >
        <span className="sim-action-btn__icon">+</span>
        <span>Nuevo pago con alias</span>
      </button>

      <div className="sim-empty-state">
        <p className="sim-empty-state__title">Sin pagos pendientes</p>
        <p className="sim-empty-state__text">Tus operaciones simuladas aparecerán aquí.</p>
      </div>
    </div>
  );
}
