import '../simulationSteps.css';

type PaymentsTabViewProps = {
  onStartPayment: () => void;
  senderBlockMessage?: string | null;
};

export function PaymentsTabView({
  onStartPayment,
  senderBlockMessage = null,
}: PaymentsTabViewProps) {
  const isSenderBlocked = Boolean(senderBlockMessage);

  return (
    <div className="sim-view">
      <div className="sim-section">
        <h3 className="sim-section__title">Pagos</h3>
        <p className="sim-section__text">
          Envía dinero de forma rápida usando el alias del destinatario.
        </p>
      </div>

      {isSenderBlocked ? (
        <p className="sim-flow__error">{senderBlockMessage}</p>
      ) : (
        <p className="sim-flow__notice">
          Si su alias está bloqueado (BLKD), no podrá pagar. Si el alias destino está bloqueado
          (BLKD), no se puede realizar el pago.
        </p>
      )}

      <button
        type="button"
        className="sim-action-btn sim-action-btn--primary sim-action-btn--full"
        disabled={isSenderBlocked}
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
