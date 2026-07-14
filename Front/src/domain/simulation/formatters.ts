import type { PaymentRecipient } from './types';

export function formatRecipientDocument(recipient: PaymentRecipient): string {
  const docNum = recipient.documentNumber;
  if (docNum.length <= 5) {
    return `${recipient.documentType}-${docNum}`;
  }
  const first = docNum.charAt(0);
  const lastFour = docNum.slice(-4);
  const asterisks = '*'.repeat(docNum.length - 5);
  return `${recipient.documentType}-${first}${asterisks}${lastFour}`;
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
