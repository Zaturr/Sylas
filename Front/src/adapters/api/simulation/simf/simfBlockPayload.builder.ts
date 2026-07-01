export function buildSimfBlockPayload(aliasValue: string, bankCode: string) {
  const timestamp = Date.now();
  const creDtTm = new Date().toISOString().slice(0, 19);

  return {
    IdModAdvc: {
      GrpHdr: {
        MsgID: `sim-blk-${timestamp}`,
        CreDtTm: creDtTm,
      },
      Mod: {
        EndToEndId: `sim-blk-e2e-${timestamp}`,
        Alias: aliasValue,
        Agt: bankCode,
        Sts: 'BLKD',
      },
    },
  };
}
