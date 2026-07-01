import { ALIAS_DELETE_MIN_DAYS } from '../../../../../domain/simulation/aliasFlow';
import '../simulationSteps.css';

type AliasErrorStepProps = {
  message: string;
  onRetry: () => void;
  onFinish: () => void;
};

export function AliasErrorStep({ message, onRetry, onFinish }: AliasErrorStepProps) {
  return (
    <div className="sim-flow">
      <div className="sim-flow sim-flow--centered sim-flow--compact">
        <div className="sim-result-icon sim-result-icon--error" aria-hidden="true">
          !
        </div>
        <h2 className="sim-flow__title">Operación no permitida</h2>
        <p className="sim-flow__subtitle">{message}</p>
        <p className="sim-field__hint">
          Regla simulada: no se puede eliminar un alias creado hace menos de{' '}
          {ALIAS_DELETE_MIN_DAYS} días.
        </p>
      </div>

      <div className="sim-flow__actions">
        <button type="button" className="sim-mobile-btn sim-mobile-btn--primary" onClick={onRetry}>
          Volver a alias
        </button>
        <button type="button" className="sim-mobile-btn sim-mobile-btn--ghost" onClick={onFinish}>
          Finalizar
        </button>
      </div>
    </div>
  );
}
