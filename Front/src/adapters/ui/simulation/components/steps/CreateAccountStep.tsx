import { appConfig } from '../../../../../adapters/api/app.config';
import '../simulationSteps.css';

type CreateAccountStepProps = {
  documentInput: string;
  firstNameInput: string;
  lastNameInput: string;
  errorMessage: string;
  isSubmitting: boolean;
  onDocumentChange: (value: string) => void;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export function CreateAccountStep({
  documentInput,
  firstNameInput,
  lastNameInput,
  errorMessage,
  isSubmitting,
  onDocumentChange,
  onFirstNameChange,
  onLastNameChange,
  onSubmit,
  onBack,
}: CreateAccountStepProps) {
  return (
    <div className="sim-flow">
      <div className="sim-flow__intro">
        <h2 className="sim-flow__title">Crear cuenta</h2>
        <p className="sim-flow__subtitle">
          Registra tus datos y una cuenta en el banco {appConfig.simulation.bankCode}.
          El alias se configurará en un paso posterior.
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

        <label className="sim-field">
          <span>Nombre</span>
          <input
            type="text"
            autoComplete="given-name"
            disabled={isSubmitting}
            placeholder="ej. Juan"
            value={firstNameInput}
            onChange={(event) => onFirstNameChange(event.target.value)}
          />
        </label>

        <label className="sim-field">
          <span>Apellido</span>
          <input
            type="text"
            autoComplete="family-name"
            disabled={isSubmitting}
            placeholder="ej. Pérez"
            value={lastNameInput}
            onChange={(event) => onLastNameChange(event.target.value)}
          />
        </label>
      </div>

      <div className="sim-summary-card">
        <div className="sim-summary-card__row">
          <span>Banco</span>
          <strong>{appConfig.simulation.bankCode}</strong>
        </div>
        <div className="sim-summary-card__row">
          <span>Tipo de cuenta</span>
          <strong>{appConfig.simulation.accountType}</strong>
        </div>
      </div>

      {errorMessage && <p className="sim-flow__error">{errorMessage}</p>}

      <div className="sim-flow__actions">
        <button
          type="button"
          className="sim-mobile-btn sim-mobile-btn--primary"
          disabled={isSubmitting}
          onClick={onSubmit}
        >
          {isSubmitting ? 'Creando cuenta...' : 'Confirmar creación'}
        </button>
        <button
          type="button"
          className="sim-mobile-btn sim-mobile-btn--ghost"
          disabled={isSubmitting}
          onClick={onBack}
        >
          Volver
        </button>
      </div>
    </div>
  );
}
