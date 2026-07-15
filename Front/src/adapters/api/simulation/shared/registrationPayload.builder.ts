import { generateBankAccountNumber } from '../../../../domain/simulation/accountNumber';
import { getPrimaryAccount } from '../../../../domain/simulation/aliasFlow';
import { buildRegistrationAccountsForDocument } from '../../../../domain/simulation/legalEntityAccounts';
import type { SimulationSession } from '../../../../domain/simulation/auth.types';
import { buildGmailFromCustomer, buildVenezuelanPhoneFromDocument } from '../../../../domain/validations';
import { appConfig } from '../../app.config';

export function buildRegistrationPayload(
  documentType: string,
  documentNumber: string,
  firstName: string,
  middleName: string,
  lastName: string,
  secondLastName: string,
  accountNumber: string,
  aliasValue?: string,
) {
  const normalizedType = documentType.toUpperCase();

  const payload: Record<string, unknown> = {
    document_type: normalizedType,
    document_number: documentNumber,
    first_name: firstName.trim(),
    middle_name: middleName.trim(),
    last_name: lastName.trim(),
    second_last_name: secondLastName.trim(),
    email: buildGmailFromCustomer(firstName, middleName, lastName, secondLastName, documentNumber),
    phone: buildVenezuelanPhoneFromDocument(documentNumber),
    accounts: buildRegistrationAccountsForDocument(normalizedType, accountNumber),
  };

  const trimmedAlias = aliasValue?.trim();
  if (trimmedAlias) {
    payload.alias_value = trimmedAlias;
  }

  return payload;
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
    session.customer.middle_name || '',
    session.customer.last_name,
    session.customer.second_last_name,
    accountNumber,
    aliasValue,
  );
}
