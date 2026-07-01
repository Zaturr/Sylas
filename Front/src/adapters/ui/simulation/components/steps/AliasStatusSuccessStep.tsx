import type { SimfAliasStatus } from '../../../../../domain/simulation/aliasStatus';
import { SimStatusBadge } from '../ui/SimStatusBadge';
import '../simulationSteps.css';

type AliasStatusSuccessStepProps = {
  aliasValue: string;
  status: SimfAliasStatus | null;
  onFinish: () => void;
};

export function AliasStatusSuccessStep({
  aliasValue,
  status,
  onFinish,
}: AliasStatusSuccessStepProps) {
  const isBlocked = status === 'BLKD';

  return (
    <div className="sim-flow">
      <div className="sim-flow sim-flow--centered sim-flow--compact">
        <div className="sim-result-icon sim-result-icon--success" aria-hidden="true">
          ✓
        </div>
        <h2 className="sim-flow__title">¡Operación exitosa!</h2>
        <p className="sim-flow__subtitle">
          {isBlocked ? (
            <>
              El alias <strong>{aliasValue}</strong> fue bloqueado y quedó en estado BLKD.
            </>
          ) : (
            <>
              El estado del alias <strong>{aliasValue}</strong> fue actualizado.
            </>
          )}
        </p>
        <SimStatusBadge status={status} />
      </div>

      <button type="button" className="sim-mobile-btn sim-mobile-btn--primary" onClick={onFinish}>
        Finalizar
      </button>
    </div>
  );
}
