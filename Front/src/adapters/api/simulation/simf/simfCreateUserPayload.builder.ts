import type { SimulationSession } from '../../../../domain/simulation/auth.types';
import {
  buildSimfDocumentId,
  mapDocumentTypeToSimfScheme,
} from './simfDocumentScheme.mapper';

export function buildSimfCreateUserPayload(
  session: SimulationSession,
  aliasValue: string,
  bankCode: string,
) {
  const timestamp = Date.now();
  const creDtTm = new Date().toISOString().slice(0, 19);
  const documentType = session.mappedDocument.documentType;
  const documentNumber = session.mappedDocument.documentNumber;
  const schemeName = mapDocumentTypeToSimfScheme(documentType);
  const titularName = `${session.customer.first_name} ${session.customer.last_name}`
    .trim()
    .toUpperCase();

  return {
    payload: {
      IdModAdvc: {
        GrpHdr: {
          MsgID: `sim-reg-${timestamp}`,
          CreDtTm: creDtTm,
        },
        Mod: {
          Agt: bankCode,
          EndToEndId: `sim-reg-e2e-${timestamp}`,
          Alias: aliasValue,
          Pty: {
            Nm: titularName,
            Id: buildSimfDocumentId(documentType, documentNumber),
            SchmeNm: schemeName,
          },
        },
      },
    },
    schemeName,
  };
}
