/** Fecha fija para ejemplos de documentación (estructura SIMF válida). */
export const DOC_CRE_DT_TM = '2026-07-07T11:30:00';

/**
 * Usuario de ejemplo unificado en Swagger (POST / GET / PUT).
 * SCID exige prefijo V/E → Pty.Id = V10000001 (cédula 10000001).
 * Agt (código de banco) = 0001 → MsgId empieza con 0001.
 */
export const DOC_ALIAS = 'nuevo.alias';
export const DOC_AGENT = '0001' as const;
export const DOC_DOCUMENT_ID = 'V10000001';
export const DOC_DOCUMENT_NUMBER = '10000001';
export const DOC_TITULAR_NAME = 'CARLOS MENDOZA';
export const DOC_SCHEME = 'SCID';

/** MsgId (28): Emisor(4) + Centro(2) + YYYYMMDDhhmmss(14) + Secuencial(8). */
export const DOC_MSG_ID_0001 = '00010120260707113000000001';
export const DOC_MSG_ID_0172 = '01720120260707113000000002';

/** EndToEndId (26): Canal-PSP-IBP(4) + YYYYMMDDhhmmss(14) + Referencia(8). */
export const DOC_END_TO_END_0001 = '000120260707113000000001';
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
      '28 caracteres alfanuméricos [A-Za-z0-9]. Estructura: Emisor(4) + Centro de procesamiento(2) + Fecha YYYYMMDDhhmmss(14) + Secuencial(8). Los primeros 4 dígitos deben coincidir con el código de banco (Agt).',
    example: DOC_MSG_ID_0001,
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
    example: DOC_END_TO_END_0001,
  },
] as const;

export function docTransaction(agentCode: '0001' | '0172' = DOC_AGENT): SimfDocTransaction {
  if (agentCode === '0172') {
    return {
      msgId: DOC_MSG_ID_0172,
      endToEndId: DOC_END_TO_END_0172,
      creDtTm: DOC_CRE_DT_TM,
      responseMsgId: '01720120260707113000000099',
    };
  }

  return {
    msgId: DOC_MSG_ID_0001,
    endToEndId: DOC_END_TO_END_0001,
    creDtTm: DOC_CRE_DT_TM,
    responseMsgId: '00010120260707113000000099',
  };
}

export function buildDocTitular() {
  return {
    Nm: DOC_TITULAR_NAME,
    Id: DOC_DOCUMENT_ID,
    SchmeNm: DOC_SCHEME,
  };
}

export function buildInquiryAcceptExample(agentCode: string = DOC_AGENT) {
  const tx = docTransaction(agentCode === '0172' ? '0172' : '0001');

  return {
    AlisIdInqRes: {
      GrpHdr: {
        MsgId: tx.responseMsgId,
        CreDtTm: DOC_CRE_DT_TM,
      },
      InqRpt: {
        Result: 'ACCP',
        Rsn: '',
        Pty: buildDocTitular(),
        AliasList: [{ Alias: DOC_ALIAS, AgtList: [{ Agt: agentCode, Sts: 'ACTV' }] }],
      },
    },
  };
}

export function buildInquiryRejectExample(reason: string, agentCode: string = DOC_AGENT) {
  const tx = docTransaction(agentCode === '0172' ? '0172' : '0001');

  return {
    AlisIdInqRes: {
      GrpHdr: {
        MsgId: tx.responseMsgId,
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
  const tx = docTransaction(DOC_AGENT);

  return {
    IdModAdvc: {
      GrpHdr: {
        MsgId: tx.msgId,
        CreDtTm: tx.creDtTm,
      },
      Mod: {
        Agt: DOC_AGENT,
        EndToEndId: tx.endToEndId,
        Alias: DOC_ALIAS,
        Pty: buildDocTitular(),
      },
    },
  };
}

export function buildIdModAdvcUpdateExample() {
  const tx = docTransaction(DOC_AGENT);

  return {
    IdModAdvc: {
      GrpHdr: {
        MsgId: tx.msgId,
        CreDtTm: tx.creDtTm,
      },
      Mod: {
        EndToEndId: tx.endToEndId,
        Alias: DOC_ALIAS,
        Agt: DOC_AGENT,
        Sts: 'INAC',
      },
    },
  };
}

export function buildIdModAdvcBlockExample() {
  const tx = docTransaction(DOC_AGENT);

  return {
    IdModAdvc: {
      GrpHdr: {
        MsgId: tx.msgId,
        CreDtTm: tx.creDtTm,
      },
      Mod: {
        EndToEndId: tx.endToEndId,
        Alias: DOC_ALIAS,
        Agt: DOC_AGENT,
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
