import { generateBankAccountNumber } from '../../../../domain/simulation/accountNumber';
import { getPrimaryAccount } from '../../../../domain/simulation/aliasFlow';
import type { SimulationSession } from '../../../../domain/simulation/auth.types';
import { appConfig } from '../../app.config';

export function buildRegistrationPayload(
  documentType: string,
  documentNumber: string,
  firstName: string,
  lastName: string,
  accountNumber: string,
  aliasValue: string,
) {
  const normalizedType = documentType.toUpperCase();
  const docKey = `${normalizedType.toLowerCase()}${documentNumber}`;

  return {
    document_type: normalizedType,
    document_number: documentNumber,
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    email: `${docKey}@simf.local`,
    phone: `SIMF${normalizedType}${documentNumber}`,
    alias_value: aliasValue,
    accounts: [
      {
        bank_id: appConfig.simulation.bankCode,
        account_number: accountNumber,
        account_type: appConfig.simulation.accountType,
      },
    ],
  };
}

export function buildRegistrationPayloadFromSession(
  session: SimulationSession,
  aliasValue: string,
) {
  const primaryAccount = getPrimaryAccount(session) ?? session.accounts[0];
  const accountNumber =
    primaryAccount?.account_number ??
    generateBankAccountNumber(
      appConfig.simulation.bankCode,
      appConfig.simulation.accountSuffixLength,
    );

  return buildRegistrationPayload(
    session.mappedDocument.documentType,
    session.mappedDocument.documentNumber,
    session.customer.first_name,
    session.customer.last_name,
    accountNumber,
    aliasValue,
  );
}
