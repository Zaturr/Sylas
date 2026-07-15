import { useState, useEffect } from 'react';
import { appConfig } from '../../../../../adapters/api/app.config';
import { RecipientSummaryCard } from '../RecipientSummaryCard';
import { formatPaymentAmount, type PaymentRecipient, type PaymentSimulationStep } from '../../../../../domain/simulation';
import '../simulationSteps.css';

type EnterAliasStepProps = {
  aliasValue: string;
  destinationBankCode: string;
  amount: string;
  errorMessage: string;
  isSubmitting: boolean;
  onAliasChange: (value: string) => void;
  onDestinationBankChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  step: PaymentSimulationStep;
  recipient: PaymentRecipient | null;
  onConfirmPayment: () => void;
  onCancelConfirmation: () => void;
};

export function EnterAliasStep({
  aliasValue,
  destinationBankCode,
  amount,
  errorMessage,
  isSubmitting,
  onAliasChange,
  onDestinationBankChange,
  onAmountChange,
  onSubmit,
  onCancel,
  step,
  recipient,
  onConfirmPayment,
  onCancelConfirmation,
}: EnterAliasStepProps) {
  const [banks, setBanks] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    async function loadBanks() {
      try {
        const response = await fetch(`${appConfig.apiBaseUrl}/banks`);
        if (response.ok) {
          const data = await response.json();
          setBanks(data);
        }
      } catch (error) {
        console.error('Error loading banks:', error);
      }
    }
    loadBanks();
  }, []);

  return (
    <div className="sim-flow">
      <div className="sim-flow__intro">
        <h2 className="sim-flow__title">Nuevo pago</h2>
        <p className="sim-flow__subtitle">
          Ingresa un MiAlias registrado en el sistema y el monto a enviar.
        </p>
        <p className="sim-flow__notice">
          Si el MiAlias destino está bloqueado (BLKD), no se puede realizar el pago.
        </p>
      </div>

      <div className="sim-form">
        <label className="sim-field">
          <span>Banco destino</span>
          <select
            className="sim-field__select"
            disabled={isSubmitting}
            value={destinationBankCode}
            onChange={(event) => onDestinationBankChange(event.target.value)}
          >
            <option value="">Seleccione un banco</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.id} - {bank.name}
              </option>
            ))}
          </select>
        </label>

        <label className="sim-field">
          <span>MiAlias destino</span>
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
          {isSubmitting ? 'Validando MiAlias...' : 'Continuar'}
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

      {step === 'confirm' && recipient && (
        <div className="sim-modal">
          <div className="sim-modal__backdrop" onClick={onCancelConfirmation} />
          <div className="sim-modal__panel">
            <h3 className="sim-modal__title">Confirmar pago</h3>
            <p className="sim-modal__message">¿Desea confirmar la operación?</p>
            
            <RecipientSummaryCard recipient={recipient} title="" />
            
            <div className="sim-summary-card" style={{ marginTop: '12px', marginBottom: '16px' }}>
              <div className="sim-summary-card__row sim-summary-card__row--highlight">
                <span>Monto a pagar</span>
                <strong>Bs. {formatPaymentAmount(amount)}</strong>
              </div>
            </div>

            <div className="sim-modal__actions">
              <button type="button" className="sim-mobile-btn sim-mobile-btn--primary" onClick={onConfirmPayment}>
                Sí, pagar
              </button>
              <button type="button" className="sim-mobile-btn sim-mobile-btn--ghost" onClick={onCancelConfirmation}>
                No, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
