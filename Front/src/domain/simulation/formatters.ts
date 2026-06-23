import type { PaymentRecipient } from './types';

export function formatRecipientDocument(recipient: PaymentRecipient): string {
  return `${recipient.documentType}-${recipient.documentNumber}`;
}

export function getRecipientInitials(recipient: PaymentRecipient): string {
  const firstInitial = recipient.firstName.charAt(0).toUpperCase();
  const lastInitial = recipient.lastName.charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`.trim() || '?';
}

export function formatPaymentAmount(amount: string): string {
  const numericAmount = Number(amount.replace(',', '.'));
  if (Number.isNaN(numericAmount)) {
    return amount;
  }

  return numericAmount.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
