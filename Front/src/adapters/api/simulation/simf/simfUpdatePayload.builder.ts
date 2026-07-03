import type { UserModifiableAliasStatus } from '../../../../domain/simulation/aliasStatus';
import { buildSimfTransactionIds } from '../../../../domain/validations/formatos';
import { appConfig } from '../../app.config';

export function buildSimfUpdatePayload(
  aliasValue: string,
  bankCode: string,
  status: UserModifiableAliasStatus,
) {
  const { msgId, endToEndId, creDtTm } = buildSimfTransactionIds({
    emisor: bankCode,
    processingCenter: appConfig.simulation.processingCenter,
    channelPspIbp: appConfig.simulation.channelPspIbp,
  });

  return {
    IdModAdvc: {
      GrpHdr: {
        MsgID: msgId,
        CreDtTm: creDtTm,
      },
      Mod: {
        EndToEndId: endToEndId,
        Alias: aliasValue,
        Agt: bankCode,
        Sts: status,
      },
    },
  };
}
