import type { PaymentRecipient } from '../../../../domain/simulation';
import {
  formatRecipientDocument,
  getRecipientInitials,
} from '../../../../domain/simulation';
import './simulationSteps.css';

type RecipientSummaryCardProps = {
  recipient: PaymentRecipient;
  title?: string;
};

export function RecipientSummaryCard({
  recipient,
  title = 'Destinatario del pago',
}: RecipientSummaryCardProps) {
  return (
    <div className="sim-recipient-card">
      <p className="sim-recipient-card__title">{title}</p>

      <div className="sim-recipient-card__avatar" aria-hidden="true">
        {getRecipientInitials(recipient)}
      </div>

      <p className="sim-recipient-card__alias">{recipient.alias}</p>

      <div className="sim-recipient-card__details">
        <div className="sim-recipient-card__row">
          <span>Nombre</span>
          <strong>{recipient.firstName}</strong>
        </div>
        <div className="sim-recipient-card__row">
          <span>Apellido</span>
          <strong>{recipient.lastName}</strong>
        </div>
        <div className="sim-recipient-card__row">
          <span>Cédula</span>
          <strong>{formatRecipientDocument(recipient)}</strong>
        </div>
      </div>
    </div>
  );
}
