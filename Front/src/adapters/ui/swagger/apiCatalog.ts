import {
  DOC_AGENT,
  DOC_ALIAS,
  DOC_DOCUMENT_ID,
  buildDocTitular,
  buildIdModAdvcBlockExample,
  buildIdModAdvcCreateExample,
  buildIdModAdvcUpdateExample,
  buildInquiryAcceptExample,
  buildInquiryRejectExample,
  buildMutationAcceptExample,
  buildMutationRejectExample,
  docTransaction,
} from './simfExamples';
import {
  ALIS_ID_INQ_RES_RESPONSE_FIELDS,
  ID_MOD_ADVC_CREATE_REQUEST_FIELDS,
  ID_MOD_ADVC_MUTATION_REQUEST_FIELDS,
  ID_VRFCTN_RPT_RESPONSE_FIELDS,
  type SwaggerMessageField,
} from './simfMessageSchemas';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type SwaggerResponseVariant = 'success' | 'reject' | 'server-error';

export type SwaggerResponse = {
  id: string;
  status: number;
  tabLabel: string;
  variant: SwaggerResponseVariant;
  label: string;
  contentType: string;
  example: unknown;
};

export type SwaggerEndpoint = {
  id: string;
  method: HttpMethod;
  path: string;
  title: string;
  description: string;
  pathParams?: { name: string; description: string }[];
  requestFields?: readonly SwaggerMessageField[];
  responseFields?: readonly SwaggerMessageField[];
  responseSchemaTitle?: string;
  requestSchemaTitle?: string;
  bodyExample?: unknown;
  responses: SwaggerResponse[];
};

export const SWAGGER_SECTION_TITLE = 'MiAlias';

const SIMF_REASON_DOCS = {
  ACRD: {
    name: 'ALIAS_ALREADY_REGISTERED',
    summary:
      'Colisión: el MiAlias solicitado ya fue tomado por otro cliente en la BDCA. El sistema retorna ACTV indicando que el recurso está vivo y pertenece a alguien más.',
  },
  RR10: {
    name: 'ALIAS_SYNTAX_INVALID',
    summary:
      'Falla de formato: el string enviado contiene caracteres no permitidos (mayúsculas, acentos, dobles puntos o espacios).',
  },
  RR04: {
    name: 'ALIAS_RESERVED_WORD',
    summary:
      'Filtro ético: el string consultado o enviado choca con el Blacklist Central (palabras ofensivas o nombres institucionales restringidos).',
  },
  AG01: {
    name: 'ALIAS_LIMIT_EXCEEDED',
    summary:
      'Tope de inventario: el documento de identidad ya alcanzó el máximo de identificadores permitidos por el ente regulador.',
  },
  AC06: {
    name: 'ALIAS_PERMANENTLY_BLOCKED',
    summary:
      'Bloqueo definitivo: se intentó registrar o usar un identificador que previamente fue eliminado del ecosistema (BLKD).',
  },
  AG08: {
    name: 'UNAUTHORIZED_IBP_ACTION',
    summary:
      'Violación de jurisdicción: la IBP intentó emitir un UPDATE sobre una resolución o un MiAlias no vinculado a su código de institución (Agt).',
  },
  BE23: {
    name: 'ALIAS_NOT_FOUND',
    summary:
      'Inexistencia: el MiAlias digitado no existe en la BDCA o el string es incorrecto.',
  },
} as const;

type SimfReasonCode = keyof typeof SIMF_REASON_DOCS;

function rejectReasonLabel(code: SimfReasonCode): string {
  const reason = SIMF_REASON_DOCS[code];
  return `HTTP 200 — Result RJCT, Rsn ${code} (${reason.name}) — ${reason.summary}`;
}

function simfResponse(
  id: string,
  tabLabel: string,
  variant: SwaggerResponseVariant,
  label: string,
  example: unknown,
  status = 200,
): SwaggerResponse {
  return {
    id,
    status,
    tabLabel,
    variant,
    label,
    contentType: 'application/json',
    example,
  };
}

const createTx = docTransaction(DOC_AGENT);
const updateTx = docTransaction(DOC_AGENT);
const blockTx = docTransaction(DOC_AGENT);

export const SWAGGER_ENDPOINTS: SwaggerEndpoint[] = [
  {
    id: 'resolve-alias-by-agent',
    method: 'GET',
    path: '/simf/bdca/v1/identities/{SchmeNm}/{Id}/alias/{Agt}',
    title: 'Consultar MiAlias por identidad y agente',
    description:
      'Consulta el MiAlias vinculado a un titular filtrando por agente bancario. Los rechazos de negocio responden HTTP 200 con Result RJCT dentro del JSON (AlisIdInqRes).',
    pathParams: [
      { name: 'SchmeNm', description: 'Esquema de identificación: SCID | SRIF | SPAS' },
      {
        name: 'Id',
        description: `Documento del titular (ej. ${DOC_DOCUMENT_ID} para cédula 10000001). Validado según SchmeNm.`,
      },
      { name: 'Agt', description: `Código de agente bancario (ej. ${DOC_AGENT}, 4 caracteres alfanuméricos).` },
    ],
    responseFields: ALIS_ID_INQ_RES_RESPONSE_FIELDS,
    responseSchemaTitle: 'AlisIdInqRes',
    responses: [
      simfResponse(
        'resolve-agent-accp',
        'ACCP',
        'success',
        'HTTP 200 — Result ACCP (consulta exitosa)',
        buildInquiryAcceptExample(DOC_AGENT),
      ),
      simfResponse(
        'resolve-agent-rr10',
        'RR10',
        'reject',
        rejectReasonLabel('RR10'),
        buildInquiryRejectExample('RR10', DOC_AGENT),
      ),
      simfResponse(
        'resolve-agent-be23',
        'BE23',
        'reject',
        rejectReasonLabel('BE23'),
        buildInquiryRejectExample('BE23', DOC_AGENT),
      ),
      simfResponse(
        'resolve-agent-500',
        '500',
        'server-error',
        'HTTP 500 — error interno del servidor',
        { error: 'error interno del servidor' },
        500,
      ),
    ],
  },
  {
    id: 'alias-resolution',
    method: 'GET',
    path: '/simf/bdca/v1/aliases/{Alias}/resolutions/{Agt_Destino}',
    title: 'Resolución anti-phishing',
    description:
      'Valida si un MiAlias destino puede usarse para un pago hacia un agente bancario específico. Los rechazos de negocio responden HTTP 200 con Result RJCT dentro del JSON (AlisIdInqRes).',
    pathParams: [
      {
        name: 'Alias',
        description: `MiAlias destino (ej. ${DOC_ALIAS}). 6-15 caracteres, minúsculas, punto permitido.`,
      },
      {
        name: 'Agt_Destino',
        description: `Código del banco destino (ej. ${DOC_AGENT}, 4 caracteres alfanuméricos).`,
      },
    ],
    responseFields: ALIS_ID_INQ_RES_RESPONSE_FIELDS,
    responseSchemaTitle: 'AlisIdInqRes',
    responses: [
      simfResponse(
        'resolution-accp',
        'ACCP',
        'success',
        'HTTP 200 — Result ACCP (MiAlias destino válido)',
        buildInquiryAcceptExample(DOC_AGENT),
      ),
      simfResponse(
        'resolution-rr10',
        'RR10',
        'reject',
        rejectReasonLabel('RR10'),
        buildInquiryRejectExample('RR10', DOC_AGENT),
      ),
      simfResponse(
        'resolution-rr04',
        'RR04',
        'reject',
        rejectReasonLabel('RR04'),
        buildInquiryRejectExample('RR04', DOC_AGENT),
      ),
      simfResponse(
        'resolution-be23',
        'BE23',
        'reject',
        rejectReasonLabel('BE23'),
        buildInquiryRejectExample('BE23', DOC_AGENT),
      ),
      simfResponse(
        'resolution-ac06',
        'AC06',
        'reject',
        rejectReasonLabel('AC06'),
        buildInquiryRejectExample('AC06', DOC_AGENT),
      ),
      simfResponse(
        'resolution-500',
        '500',
        'server-error',
        'HTTP 500 — error interno del servidor',
        { error: 'error interno del servidor' },
        500,
      ),
    ],
  },
  {
    id: 'create-alias',
    method: 'POST',
    path: '/simf/bdca/v1/aliases',
    title: 'Registrar MiAlias',
    description:
      'Registra un nuevo MiAlias mediante IdModAdvc.',
    requestFields: ID_MOD_ADVC_CREATE_REQUEST_FIELDS,
    requestSchemaTitle: 'IdModAdvc',
    responseFields: ID_VRFCTN_RPT_RESPONSE_FIELDS,
    responseSchemaTitle: 'IdVrfctnRpt',
    bodyExample: buildIdModAdvcCreateExample(),
    responses: [
      simfResponse(
        'create-accp',
        'ACCP',
        'success',
        'HTTP 200 — Result ACCP (MiAlias registrado)',
        buildMutationAcceptExample(createTx, {
          Alias: DOC_ALIAS,
          Agt: DOC_AGENT,
          Sts: 'ACTV',
          Pty: buildDocTitular(),
        }),
      ),
      simfResponse(
        'create-rr10',
        'RR10',
        'reject',
        rejectReasonLabel('RR10'),
        buildMutationRejectExample(createTx, 'RR10'),
      ),
      simfResponse(
        'create-rr04',
        'RR04',
        'reject',
        rejectReasonLabel('RR04'),
        buildMutationRejectExample(createTx, 'RR04'),
      ),
      simfResponse(
        'create-acrd',
        'ACRD',
        'reject',
        rejectReasonLabel('ACRD'),
        buildMutationRejectExample(createTx, 'ACRD'),
      ),
      simfResponse(
        'create-ag01',
        'AG01',
        'reject',
        rejectReasonLabel('AG01'),
        buildMutationRejectExample(createTx, 'AG01'),
      ),
      simfResponse(
        'create-ac06',
        'AC06',
        'reject',
        rejectReasonLabel('AC06'),
        buildMutationRejectExample(createTx, 'AC06'),
      ),
      simfResponse(
        'create-ag08',
        'AG08',
        'reject',
        rejectReasonLabel('AG08'),
        buildMutationRejectExample(createTx, 'AG08'),
      ),
      simfResponse(
        'create-500',
        '500',
        'server-error',
        'HTTP 500 — error interno del servidor',
        { error: 'error interno del servidor' },
        500,
      ),
    ],
  },
  {
    id: 'update-alias',
    method: 'PUT',
    path: '/simf/bdca/v1/aliases/update/{Alias}/{Agt}',
    title: 'Actualizar MiAlias',
    description:
      'Actualiza el estado del MiAlias para un agente bancario.',
    pathParams: [
      {
        name: 'Alias',
        description: `Debe coincidir con Mod.Alias del body (ej. ${DOC_ALIAS}).`,
      },
      {
        name: 'Agt',
        description: `Debe coincidir con Mod.Agt del body (ej. ${DOC_AGENT}, 4 caracteres alfanuméricos).`,
      },
    ],
    requestFields: ID_MOD_ADVC_MUTATION_REQUEST_FIELDS,
    requestSchemaTitle: 'IdModAdvc',
    responseFields: ID_VRFCTN_RPT_RESPONSE_FIELDS,
    responseSchemaTitle: 'IdVrfctnRpt',
    bodyExample: buildIdModAdvcUpdateExample(),
    responses: [
      simfResponse(
        'update-accp',
        'ACCP',
        'success',
        'HTTP 200 — Result ACCP (MiAlias actualizado)',
        buildMutationAcceptExample(updateTx, {
          Alias: DOC_ALIAS,
          Agt: DOC_AGENT,
          Sts: 'INAC',
          Pty: buildDocTitular(),
        }),
      ),
      simfResponse(
        'update-rr10',
        'RR10',
        'reject',
        rejectReasonLabel('RR10'),
        buildMutationRejectExample(updateTx, 'RR10'),
      ),
      simfResponse(
        'update-be23',
        'BE23',
        'reject',
        rejectReasonLabel('BE23'),
        buildMutationRejectExample(updateTx, 'BE23'),
      ),
      simfResponse(
        'update-ac06',
        'AC06',
        'reject',
        rejectReasonLabel('AC06'),
        buildMutationRejectExample(updateTx, 'AC06'),
      ),
      simfResponse(
        'update-ag08',
        'AG08',
        'reject',
        rejectReasonLabel('AG08'),
        buildMutationRejectExample(updateTx, 'AG08'),
      ),
      simfResponse(
        'update-500',
        '500',
        'server-error',
        'HTTP 500 — error interno del servidor',
        { error: 'error interno del servidor' },
        500,
      ),
    ],
  },
  {
    id: 'block-alias',
    method: 'PUT',
    path: '/simf/bdca/v1/aliases/delete/{Alias}/{Agt}',
    title: 'Bloquear MiAlias (baja global)',
    description:
      'Registra la baja global del MiAlias (Sts BLKD).',
    pathParams: [
      {
        name: 'Alias',
        description: `Debe coincidir con Mod.Alias del body (ej. ${DOC_ALIAS}).`,
      },
      {
        name: 'Agt',
        description: `Debe coincidir con Mod.Agt del body (ej. ${DOC_AGENT}).`,
      },
    ],
    requestFields: ID_MOD_ADVC_MUTATION_REQUEST_FIELDS,
    requestSchemaTitle: 'IdModAdvc',
    responseFields: ID_VRFCTN_RPT_RESPONSE_FIELDS,
    responseSchemaTitle: 'IdVrfctnRpt',
    bodyExample: buildIdModAdvcBlockExample(),
    responses: [
      simfResponse(
        'block-accp',
        'ACCP',
        'success',
        'HTTP 200 — Result ACCP (MiAlias bloqueado BLKD)',
        buildMutationAcceptExample(blockTx, {
          Alias: DOC_ALIAS,
          Agt: DOC_AGENT,
          Sts: 'BLKD',
          Pty: buildDocTitular(),
        }),
      ),
      simfResponse(
        'block-rr10',
        'RR10',
        'reject',
        rejectReasonLabel('RR10'),
        buildMutationRejectExample(blockTx, 'RR10'),
      ),
      simfResponse(
        'block-be23',
        'BE23',
        'reject',
        rejectReasonLabel('BE23'),
        buildMutationRejectExample(blockTx, 'BE23'),
      ),
      simfResponse(
        'block-ac06',
        'AC06',
        'reject',
        rejectReasonLabel('AC06'),
        buildMutationRejectExample(blockTx, 'AC06'),
      ),
      simfResponse(
        'block-ag08',
        'AG08',
        'reject',
        rejectReasonLabel('AG08'),
        buildMutationRejectExample(blockTx, 'AG08'),
      ),
      simfResponse(
        'block-500',
        '500',
        'server-error',
        'HTTP 500 — error interno del servidor',
        { error: 'error interno del servidor' },
        500,
      ),
    ],
  },
];
