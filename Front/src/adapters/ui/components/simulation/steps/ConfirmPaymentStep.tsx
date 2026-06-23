import { formatPaymentAmount } from '../../../../../domain/simulation';
import type { PaymentRecipient } from '../../../../../domain/simulation';
import { RecipientSummaryCard } from '../RecipientSummaryCard';
import '../simulationSteps.css';

type ConfirmPaymentStepProps = {
  amount: string;
  recipient: PaymentRecipient;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmPaymentStep({
  amount,
  recipient,
  onConfirm,
  onCancel,
}: ConfirmPaymentStepProps) {
  const formattedAmount = formatPaymentAmount(amount);

  return (
    <div className="sim-flow">
      <div className="sim-flow__intro">
        <h2 className="sim-flow__title">Confirmar pago</h2>
        <p className="sim-flow__subtitle">Verifica al destinatario antes de pagar.</p>
      </div>

      <RecipientSummaryCard recipient={recipient} />

      <div className="sim-summary-card">
        <div className="sim-summary-card__row sim-summary-card__row--highlight">
          <span>Monto a pagar</span>
          <strong>Bs. {formattedAmount}</strong>
        </div>
      </div>

      <div className="sim-flow__actions">
        <button type="button" className="sim-mobile-btn sim-mobile-btn--primary" onClick={onConfirm}>
          Pagar
        </button>
        <button type="button" className="sim-mobile-btn sim-mobile-btn--ghost" onClick={onCancel}>
          Volver
        </button>
      </div>
    </div>
  );
}
