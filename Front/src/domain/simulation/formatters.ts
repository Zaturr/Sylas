import type { PaymentRecipient } from './types';

export function formatRecipientDocument(recipient: PaymentRecipient): string {
  const docNum = recipient.documentNumber;
  if (docNum.length <= 3) {
    return `${recipient.documentType}-${docNum}`;
  }
  const lastThree = docNum.slice(-3);
  const asterisks = '*'.repeat(docNum.length - 3);
  return `${recipient.documentType}-${asterisks}${lastThree}`;
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
