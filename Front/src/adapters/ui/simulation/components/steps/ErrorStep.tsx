import '../simulationSteps.css';

type ErrorStepProps = {
  message: string;
  onRetry: () => void;
  onCancel: () => void;
};

export function ErrorStep({ message, onRetry, onCancel }: ErrorStepProps) {
  return (
    <div className="sim-flow sim-flow--centered">
      <div className="sim-result-icon sim-result-icon--error" aria-hidden="true">
        !
      </div>
      <h2 className="sim-flow__title">No se pudo continuar</h2>
      <p className="sim-flow__subtitle">{message}</p>

      <div className="sim-flow__actions">
        <button type="button" className="sim-mobile-btn sim-mobile-btn--primary" onClick={onRetry}>
          Reintentar
        </button>
        <button type="button" className="sim-mobile-btn sim-mobile-btn--ghost" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
