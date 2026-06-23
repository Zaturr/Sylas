import '../simulationSteps.css';

type EnterAliasStepProps = {
  aliasValue: string;
  amount: string;
  errorMessage: string;
  isSubmitting: boolean;
  onAliasChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export function EnterAliasStep({
  aliasValue,
  amount,
  errorMessage,
  isSubmitting,
  onAliasChange,
  onAmountChange,
  onSubmit,
  onCancel,
}: EnterAliasStepProps) {
  return (
    <div className="sim-flow">
      <div className="sim-flow__intro">
        <h2 className="sim-flow__title">Nuevo pago</h2>
        <p className="sim-flow__subtitle">
          Ingresa un alias registrado en el sistema y el monto a enviar.
        </p>
      </div>

      <div className="sim-form">
        <label className="sim-field">
          <span>Alias destino</span>
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            disabled={isSubmitting}
            placeholder="ej. juan.perez123 o juanperez123"
            value={aliasValue}
            onChange={(event) => onAliasChange(event.target.value)}
          />
        </label>

        <label className="sim-field">
          <span>Monto (Bs.)</span>
          <input
            type="text"
            inputMode="decimal"
            disabled={isSubmitting}
            placeholder="0,00"
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
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
          {isSubmitting ? 'Validando alias...' : 'Continuar'}
        </button>
        <button
          type="button"
          className="sim-mobile-btn sim-mobile-btn--ghost"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
