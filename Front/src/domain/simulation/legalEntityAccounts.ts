import { generateBankAccountNumber } from './accountNumber';
import { appConfig } from '../../adapters/api/app.config';

export type LegalEntityAccountCounts = {
  ctsCorrientes: number;
  ctsAhorro: number;
  ctsDivisa: number;
};

export type GeneratedRegistrationAccount = {
  bank_id: string;
  account_number: string;
  account_type: 'corriente' | 'ahorro' | 'dolares';
};

export function isLegalEntityDocumentType(documentType: string): boolean {
  const normalized = documentType.trim().toUpperCase();
  return normalized === 'J' || normalized === 'G' || normalized === 'C';
}

export function getLegalEntityAccountCounts(): LegalEntityAccountCounts {
  const configured = appConfig.simulation.legalEntityAccounts;
  return {
    ctsCorrientes: configured?.ctsCorrientes ?? 1,
    ctsAhorro: configured?.ctsAhorro ?? 1,
    ctsDivisa: configured?.ctsDivisa ?? 1,
  };
}

export function buildLegalEntityRegistrationAccounts(
  bankCode: string,
  accountSuffixLength: number,
  counts: LegalEntityAccountCounts = getLegalEntityAccountCounts(),
): GeneratedRegistrationAccount[] {
  const accounts: GeneratedRegistrationAccount[] = [];

  for (let index = 0; index < counts.ctsCorrientes; index += 1) {
    accounts.push({
      bank_id: bankCode,
      account_number: generateBankAccountNumber(bankCode, accountSuffixLength),
      account_type: 'corriente',
    });
  }

  for (let index = 0; index < counts.ctsAhorro; index += 1) {
    accounts.push({
      bank_id: bankCode,
      account_number: generateBankAccountNumber(bankCode, accountSuffixLength),
      account_type: 'ahorro',
    });
  }

  for (let index = 0; index < counts.ctsDivisa; index += 1) {
    accounts.push({
      bank_id: bankCode,
      account_number: generateBankAccountNumber(bankCode, accountSuffixLength),
      account_type: 'dolares',
    });
  }

  return accounts;
}

export function buildRegistrationAccountsForDocument(
  documentType: string,
  primaryAccountNumber: string,
): GeneratedRegistrationAccount[] {
  const { bankCode, accountSuffixLength } = appConfig.simulation;

  if (isLegalEntityDocumentType(documentType)) {
    return buildLegalEntityRegistrationAccounts(bankCode, accountSuffixLength);
  }

  return [
    {
      bank_id: bankCode,
      account_number: primaryAccountNumber,
      account_type: 'corriente',
    },
    {
      bank_id: bankCode,
      account_number: generateBankAccountNumber(bankCode, accountSuffixLength),
      account_type: 'ahorro',
    },
    {
      bank_id: bankCode,
      account_number: generateBankAccountNumber(bankCode, accountSuffixLength),
      account_type: 'dolares',
    },
  ];
}
