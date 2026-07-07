/** Fecha fija para ejemplos de documentación (estructura SIMF válida). */
export const DOC_CRE_DT_TM = '2026-07-07T11:30:00';

/** MsgId (28): Emisor(4) + Centro(2) + YYYYMMDDhhmmss(14) + Secuencial(8). */
export const DOC_MSG_ID_0105 = '01050120260707113000000001';
export const DOC_MSG_ID_0172 = '01720120260707113000000002';

/** EndToEndId (26): Canal-PSP-IBP(4) + YYYYMMDDhhmmss(14) + Referencia(8). */
export const DOC_END_TO_END_0105 = '017220260707113000000001';
export const DOC_END_TO_END_0172 = '017220260707113000000002';

export type SimfDocTransaction = {
  msgId: string;
  endToEndId: string;
  creDtTm: string;
  responseMsgId: string;
};

export const SIMF_TRANSACTION_FIELD_RULES = [
  {
    name: 'GrpHdr.MsgId',
    description:
      '28 caracteres alfanuméricos [A-Za-z0-9]. Estructura: Emisor(4) + Centro de procesamiento(2) + Fecha YYYYMMDDhhmmss(14) + Secuencial(8).',
    example: DOC_MSG_ID_0105,
  },
  {
    name: 'GrpHdr.CreDtTm',
    description: 'Fecha ISO 8601 validada en backend: YYYY-MM-DDThh:mm:ss.',
    example: DOC_CRE_DT_TM,
  },
  {
    name: 'Mod.EndToEndId',
    description:
      '26 caracteres alfanuméricos [A-Za-z0-9]. Estructura: Canal-PSP-IBP(4) + Fecha YYYYMMDDhhmmss(14) + Referencia(8).',
    example: DOC_END_TO_END_0105,
  },
] as const;

export function docTransaction(agentCode: '0105' | '0172'): SimfDocTransaction {
  if (agentCode === '0172') {
    return {
      msgId: DOC_MSG_ID_0172,
      endToEndId: DOC_END_TO_END_0172,
      creDtTm: DOC_CRE_DT_TM,
      responseMsgId: '01720120260707113000000099',
    };
  }

  return {
    msgId: DOC_MSG_ID_0105,
    endToEndId: DOC_END_TO_END_0105,
    creDtTm: DOC_CRE_DT_TM,
    responseMsgId: '01050120260707113000000099',
  };
}

export function buildInquiryAcceptExample(agentCode: string) {
  return {
    AlisIdInqRes: {
      GrpHdr: {
        MsgId: docTransaction(agentCode === '0172' ? '0172' : '0105').responseMsgId,
        CreDtTm: DOC_CRE_DT_TM,
      },
      InqRpt: {
        Result: 'ACCP',
        Rsn: '',
        Pty: { Nm: 'TITULAR EJEMPLO', Id: 'V9168461', SchmeNm: 'SCID' },
        AliasList: [{ Alias: 'mi.alias', AgtList: [{ Agt: agentCode, Sts: 'ACTV' }] }],
      },
    },
  };
}

export function buildInquiryRejectExample(reason: string, agentCode = '0105') {
  return {
    AlisIdInqRes: {
      GrpHdr: {
        MsgId: docTransaction(agentCode === '0172' ? '0172' : '0105').responseMsgId,
        CreDtTm: DOC_CRE_DT_TM,
      },
      InqRpt: {
        Result: 'RJCT',
        Rsn: reason,
      },
    },
  };
}

export function buildIdModAdvcCreateExample() {
  const tx = docTransaction('0105');

  return {
    IdModAdvc: {
      GrpHdr: {
        MsgId: tx.msgId,
        CreDtTm: tx.creDtTm,
      },
      Mod: {
        Agt: '0105',
        EndToEndId: tx.endToEndId,
        Alias: 'nuevo.alias',
        Pty: {
          Nm: 'NOMBRE APELLIDO',
          Id: 'V9168461',
          SchmeNm: 'SCID',
        },
      },
    },
  };
}

export function buildIdModAdvcUpdateExample() {
  const tx = docTransaction('0105');

  return {
    IdModAdvc: {
      GrpHdr: {
        MsgId: tx.msgId,
        CreDtTm: tx.creDtTm,
      },
      Mod: {
        EndToEndId: tx.endToEndId,
        Alias: 'alej.carm5234',
        Agt: '0105',
        Sts: 'INAC',
      },
    },
  };
}

export function buildIdModAdvcBlockExample() {
  const tx = docTransaction('0172');

  return {
    IdModAdvc: {
      GrpHdr: {
        MsgId: tx.msgId,
        CreDtTm: tx.creDtTm,
      },
      Mod: {
        EndToEndId: tx.endToEndId,
        Alias: 'daniel',
        Agt: '0172',
        Sts: 'BLKD',
      },
    },
  };
}

export function buildMutationAcceptExample(
  tx: SimfDocTransaction,
  mod?: Record<string, unknown>,
) {
  return {
    IdVrfctnRpt: {
      GrpHdr: {
        MsgId: tx.responseMsgId,
        CreDtTm: DOC_CRE_DT_TM,
      },
      OrgnlAssgnmt: {
        OrgnlMsgId: tx.msgId,
        OrgnlCreDtTm: tx.creDtTm,
      },
      Rpt: {
        OrgnlEndToEndId: tx.endToEndId,
        Result: 'ACCP',
        Rsn: '',
      },
      ...(mod ? { Mod: mod } : {}),
    },
  };
}

export function buildMutationRejectExample(tx: SimfDocTransaction, reason: string) {
  return {
    IdVrfctnRpt: {
      GrpHdr: {
        MsgId: tx.responseMsgId,
        CreDtTm: DOC_CRE_DT_TM,
      },
      OrgnlAssgnmt: {
        OrgnlMsgId: tx.msgId,
        OrgnlCreDtTm: tx.creDtTm,
      },
      Rpt: {
        OrgnlEndToEndId: tx.endToEndId,
        Result: 'RJCT',
        Rsn: reason,
      },
    },
  };
}
