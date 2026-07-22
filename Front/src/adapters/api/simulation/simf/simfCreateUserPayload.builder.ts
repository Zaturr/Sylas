import type { SimulationSession } from '../../../../domain/simulation/auth.types';
import { buildSimfTransactionIds } from '../../../../domain/validations/formatos';
import { appConfig } from '../../app.config';
import {
  buildSimfDocumentId,
  mapDocumentTypeToSimfScheme,
} from './simfDocumentScheme.mapper';

export function buildSimfCreateUserPayload(
  session: SimulationSession,
  aliasValue: string,
  bankCode: string,
) {
  const { msgId, endToEndId, creDtTm } = buildSimfTransactionIds({
    emisor: bankCode,
    processingCenter: appConfig.simulation.processingCenter,
    channelPspIbp: appConfig.simulation.channelPspIbp,
  });
  const documentType = session.mappedDocument.documentType;
  const documentNumber = session.mappedDocument.documentNumber;
  const schemeName = mapDocumentTypeToSimfScheme(documentType);
  const titularName = `${session.customer.first_name} ${session.customer.middle_name || ''} ${session.customer.last_name} ${session.customer.second_last_name}`
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

  return {
    payload: {
      IdModAdvc: {
        GrpHdr: {
          MsgId: msgId,
          CreDtTm: creDtTm,
        },
        Mod: {
          Agt: bankCode,
          EndToEndId: endToEndId,
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
