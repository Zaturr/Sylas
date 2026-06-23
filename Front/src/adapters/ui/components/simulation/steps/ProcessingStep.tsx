import type { PaymentRecipient } from '../../../../../domain/simulation';
import { RecipientSummaryCard } from '../RecipientSummaryCard';
import '../simulationSteps.css';

type ProcessingStepProps = {
  recipient: PaymentRecipient;
};

export function ProcessingStep({ recipient }: ProcessingStepProps) {
  return (
    <div className="sim-flow">
      <div className="sim-flow sim-flow--centered sim-flow--compact">
        <div className="sim-spinner" aria-hidden="true" />
        <h2 className="sim-flow__title">Procesando pago</h2>
        <p className="sim-flow__subtitle">Estamos enviando tu pago...</p>
      </div>

      <RecipientSummaryCard recipient={recipient} title="Pago enviado a" />
    </div>
  );
}
