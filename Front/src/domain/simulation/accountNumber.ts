function randomNumericSuffix(length: number): string {
  let suffix = '';
  for (let index = 0; index < length; index += 1) {
    suffix += Math.floor(Math.random() * 10).toString();
  }
  return suffix;
}

export function generateBankAccountNumber(bankCode: string, suffixLength: number): string {
  return `${bankCode}${randomNumericSuffix(suffixLength)}`;
}

export function getAccountLastDigits(accountNumber: string, digits = 4): string {
  const trimmed = accountNumber.trim();
  if (trimmed.length <= digits) {
    return trimmed;
  }
  return trimmed.slice(-digits);
}
