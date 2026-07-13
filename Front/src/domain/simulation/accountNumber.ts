function randomNumericSuffix(length: number): string {
  let suffix = '';
  for (let index = 0; index < length; index += 1) {
    suffix += Math.floor(Math.random() * 10).toString();
  }
  return suffix;
}

function getDigitValue(digits: string): number {
  const pesos = [3, 2, 7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let result = 0;

  for (let i = 0; i < digits.length; i++) {
    const numericValue = parseInt(digits[i], 10);
    const pesoActual = pesos[i % pesos.length];
    result += numericValue * pesoActual;
  }
  
  result = 11 - (result % 11);
  if (result >= 10) {
    if (result === 10) {
      return 0;
    }
    return 1;
  }
  return result;
}

export function generateBankAccountNumber(bankCode: string, suffixLength: number): string {
  // Generamos de tal forma que cumpla siempre con la validación si se espera un total de 20 dígitos.
  // bankCode: 4 dígitos
  // suffix: 16 dígitos -> office (4) + control (2) + account (10)
  if (suffixLength === 16 && bankCode.length === 4) {
    const office = randomNumericSuffix(4);
    const account = randomNumericSuffix(10);
    const firstDigit = getDigitValue(bankCode + office);
    const secondDigit = getDigitValue(office + account);
    const controlStr = `${firstDigit}${secondDigit}`;
    return `${bankCode}${office}${controlStr}${account}`;
  }

  // Fallback si no son 16 dígitos el sufijo
  return `${bankCode}${randomNumericSuffix(suffixLength)}`;
}

export function getAccountLastDigits(accountNumber: string, digits = 4): string {
  const trimmed = accountNumber.trim();
  if (trimmed.length <= digits) {
    return trimmed;
  }
  return trimmed.slice(-digits);
}
