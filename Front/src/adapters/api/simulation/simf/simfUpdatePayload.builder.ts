import type { UserModifiableAliasStatus } from '../../../../domain/simulation/aliasStatus';

export function buildSimfUpdatePayload(
  aliasValue: string,
  bankCode: string,
  status: UserModifiableAliasStatus,
) {
  const timestamp = Date.now();
  const creDtTm = new Date().toISOString().slice(0, 19);

  return {
    IdModAdvc: {
      GrpHdr: {
        MsgID: `sim-${timestamp}`,
        CreDtTm: creDtTm,
      },
      Mod: {
        EndToEndId: `sim-e2e-${timestamp}`,
        Alias: aliasValue,
        Agt: bankCode,
        Sts: status,
      },
    },
  };
}
