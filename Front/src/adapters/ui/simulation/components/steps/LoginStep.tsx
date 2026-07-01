import '../simulationSteps.css';

type LoginStepProps = {
  documentInput: string;
  errorMessage: string;
  isSubmitting: boolean;
  canCreateAccount: boolean;
  onDocumentChange: (value: string) => void;
  onSubmit: () => void;
  onCreateAccount: () => void;
};

export function LoginStep({
  documentInput,
  errorMessage,
  isSubmitting,
  canCreateAccount,
  onDocumentChange,
  onSubmit,
  onCreateAccount,
}: LoginStepProps) {
  return (
    <div className="sim-flow">
      <div className="sim-flow__intro">
        <h2 className="sim-flow__title">Iniciar sesión</h2>
        <p className="sim-flow__subtitle">
          Ingresa tu cédula para acceder a la banca simulada.
        </p>
      </div>

      <div className="sim-form">
        <label className="sim-field">
          <span>Cédula</span>
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            disabled={isSubmitting}
            placeholder="ej. V12345678"
            value={documentInput}
            onChange={(event) => onDocumentChange(event.target.value)}
          />
        </label>
      </div>

      {errorMessage && <p className="sim-flow__error">{errorMessage}</p>}

      <div className="sim-flow__actions">
        <button
          type="button"
          className="sim-mobile-btn sim-mobile-btn--primary"
          disabled={isSubmitting}
          onClick={onSubmit}
        >
          {isSubmitting ? 'Validando...' : 'Ingresar'}
        </button>

        {canCreateAccount && (
          <button
            type="button"
            className="sim-mobile-btn sim-mobile-btn--ghost"
            disabled={isSubmitting}
            onClick={onCreateAccount}
          >
            Crear cuenta
          </button>
        )}
      </div>
    </div>
  );
}
