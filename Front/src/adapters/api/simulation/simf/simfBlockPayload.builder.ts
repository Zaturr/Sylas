import { buildSimfTransactionIds } from '../../../../domain/validations/formatos';
import { appConfig } from '../../app.config';

export function buildSimfBlockPayload(aliasValue: string, bankCode: string) {
  const { msgId, endToEndId, creDtTm } = buildSimfTransactionIds({
    emisor: bankCode,
    processingCenter: appConfig.simulation.processingCenter,
    channelPspIbp: appConfig.simulation.channelPspIbp,
  });

  return {
    IdModAdvc: {
      GrpHdr: {
        MsgId: msgId,
        CreDtTm: creDtTm,
      },
      Mod: {
        EndToEndId: endToEndId,
        Alias: aliasValue,
        Agt: bankCode,
        Sts: 'BLKD',
      },
    },
  };
}
