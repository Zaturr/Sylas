import { SimStatusBadge } from '../ui/SimStatusBadge';
import { SIMF_ALIAS_STATUS } from '../../../../../domain/simulation/aliasStatus';
import '../simulationSteps.css';

type AliasCreateSuccessStepProps = {
  aliasValue: string;
  onFinish: () => void;
};

export function AliasCreateSuccessStep({ aliasValue, onFinish }: AliasCreateSuccessStepProps) {
  return (
    <div className="sim-flow">
      <div className="sim-flow sim-flow--centered sim-flow--compact">
        <div className="sim-result-icon sim-result-icon--success" aria-hidden="true">
          ✓
        </div>
        <h2 className="sim-flow__title">¡Listo!</h2>
        <p className="sim-flow__subtitle">
          Tu alias <strong>{aliasValue}</strong> fue registrado correctamente.
        </p>
        <SimStatusBadge status={SIMF_ALIAS_STATUS.ACTIVE} />
      </div>

      <button type="button" className="sim-mobile-btn sim-mobile-btn--primary" onClick={onFinish}>
        Finalizar
      </button>
    </div>
  );
}
