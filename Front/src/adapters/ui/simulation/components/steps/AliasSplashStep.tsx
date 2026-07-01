import '../simulationSteps.css';

type AliasSplashStepProps = {
  onContinue: () => void;
};

export function AliasSplashStep({ onContinue }: AliasSplashStepProps) {
  return (
    <div className="sim-flow sim-flow--splash">
      <div className="sim-splash">
        <div className="sim-splash__icon" aria-hidden="true">
          @
        </div>
        <h2 className="sim-splash__title">Alias</h2>
        <p className="sim-splash__text">
          Administra tu alias de pagos, vincula cuentas y modifica el estado de
          afiliación con el banco.
        </p>
      </div>

      <div className="sim-flow__actions">
        <button
          type="button"
          className="sim-mobile-btn sim-mobile-btn--primary"
          onClick={onContinue}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
