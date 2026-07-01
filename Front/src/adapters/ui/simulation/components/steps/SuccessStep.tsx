import { formatPaymentAmount } from '../../../../../domain/simulation';
import type { PaymentRecipient } from '../../../../../domain/simulation';
import { RecipientSummaryCard } from '../RecipientSummaryCard';
import '../simulationSteps.css';

type SuccessStepProps = {
  amount: string;
  recipient: PaymentRecipient;
  onNewPayment: () => void;
};

export function SuccessStep({ amount, recipient, onNewPayment }: SuccessStepProps) {
  const formattedAmount = formatPaymentAmount(amount);

  return (
    <div className="sim-flow">
      <div className="sim-flow sim-flow--centered sim-flow--compact">
        <div className="sim-result-icon sim-result-icon--success" aria-hidden="true">
          ✓
        </div>
        <h2 className="sim-flow__title">¡Listo!</h2>
        <p className="sim-flow__subtitle">
          Enviaste Bs. {formattedAmount} correctamente.
        </p>
      </div>

      <RecipientSummaryCard recipient={recipient} title="Beneficiario del pago" />

      <button type="button" className="sim-mobile-btn sim-mobile-btn--primary" onClick={onNewPayment}>
        Finalizar
      </button>
    </div>
  );
}
