import {
  SIMF_TRANSACTION_FIELD_RULES,
  buildIdModAdvcBlockExample,
  buildIdModAdvcCreateExample,
  buildIdModAdvcUpdateExample,
  buildInquiryAcceptExample,
  buildInquiryRejectExample,
  buildMutationAcceptExample,
  buildMutationRejectExample,
  docTransaction,
} from './simfExamples';

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

export type SwaggerBodyFieldRule = {
  name: string;
  description: string;
  example: string;
};

export type SwaggerEndpoint = {
  id: string;
  method: HttpMethod;
  path: string;
  title: string;
  description: string;
  pathParams?: { name: string; description: string }[];
  bodyFields?: readonly SwaggerBodyFieldRule[];
  bodyExample?: unknown;
  responses: SwaggerResponse[];
};

export const SWAGGER_SECTION_TITLE = 'Alias';

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

const createTx = docTransaction('0105');
const updateTx = docTransaction('0105');
const blockTx = docTransaction('0172');

export const SWAGGER_ENDPOINTS: SwaggerEndpoint[] = [
  {
    id: 'resolve-alias-by-agent',
    method: 'GET',
    path: '/simf/bdca/v1/identities/{SchmeNm}/{Id}/alias/{Agt}',
    title: 'Consultar alias por identidad y agente',
    description:
      'Consulta el alias vinculado a un titular filtrando por agente bancario. Los rechazos de negocio responden HTTP 200 con Result RJCT dentro del JSON (AlisIdInqRes).',
    pathParams: [
      { name: 'SchmeNm', description: 'Esquema de identificación: SCID | SRIF | SPAS' },
      { name: 'Id', description: 'Documento del titular (ej. V9168461). Validado según SchmeNm.' },
      { name: 'Agt', description: 'Código de agente bancario (4 caracteres alfanuméricos).' },
    ],
    responses: [
      simfResponse(
        'resolve-agent-accp',
        'ACCP',
        'success',
        'HTTP 200 — Result ACCP (consulta exitosa)',
        buildInquiryAcceptExample('0105'),
      ),
      simfResponse(
        'resolve-agent-rr10',
        'RR10',
        'reject',
        'HTTP 200 — Result RJCT, Rsn RR10 (parámetros inválidos)',
        buildInquiryRejectExample('RR10', '0105'),
      ),
      simfResponse(
        'resolve-agent-be23',
        'BE23',
        'reject',
        'HTTP 200 — Result RJCT, Rsn BE23 (titular o alias no encontrado)',
        buildInquiryRejectExample('BE23', '0105'),
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
      'Valida si un alias destino puede usarse para un pago hacia un agente bancario específico. Los rechazos de negocio responden HTTP 200 con Result RJCT dentro del JSON (AlisIdInqRes).',
    pathParams: [
      { name: 'Alias', description: 'Alias destino (6-15 caracteres, minúsculas, punto permitido).' },
      { name: 'Agt_Destino', description: 'Código del banco destino (4 caracteres alfanuméricos).' },
    ],
    responses: [
      simfResponse(
        'resolution-accp',
        'ACCP',
        'success',
        'HTTP 200 — Result ACCP (alias destino válido)',
        buildInquiryAcceptExample('0172'),
      ),
      simfResponse(
        'resolution-rr10',
        'RR10',
        'reject',
        'HTTP 200 — Result RJCT, Rsn RR10 (parámetros inválidos)',
        buildInquiryRejectExample('RR10', '0172'),
      ),
      simfResponse(
        'resolution-be23',
        'BE23',
        'reject',
        'HTTP 200 — Result RJCT, Rsn BE23 (alias no encontrado)',
        buildInquiryRejectExample('BE23', '0172'),
      ),
      simfResponse(
        'resolution-ac06',
        'AC06',
        'reject',
        'HTTP 200 — Result RJCT, Rsn AC06 (alias bloqueado BLKD)',
        buildInquiryRejectExample('AC06', '0172'),
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
    title: 'Registrar alias',
    description:
      'Registra un nuevo alias mediante IdModAdvc.',
    bodyFields: SIMF_TRANSACTION_FIELD_RULES,
    bodyExample: buildIdModAdvcCreateExample(),
    responses: [
      simfResponse(
        'create-accp',
        'ACCP',
        'success',
        'HTTP 200 — Result ACCP (alias registrado)',
        buildMutationAcceptExample(createTx, {
          Alias: 'nuevo.alias',
          Agt: '0105',
          Sts: 'INAC',
          Pty: { Nm: 'NOMBRE APELLIDO', Id: 'V9168461', SchmeNm: 'SCID' },
        }),
      ),
      simfResponse(
        'create-rr10',
        'RR10',
        'reject',
        'HTTP 200 — Result RJCT, Rsn RR10 (Campo con formato inválido)',
        buildMutationRejectExample(createTx, 'RR10'),
      ),
      simfResponse(
        'create-acrd',
        'ACRD',
        'reject',
        'HTTP 200 — Result RJCT, Rsn ACRD (alias ya registrado)',
        buildMutationRejectExample(createTx, 'ACRD'),
      ),
      simfResponse(
        'create-ag01',
        'AG01',
        'reject',
        'HTTP 200 — Result RJCT, Rsn AG01 (límite de alias alcanzado)',
        buildMutationRejectExample(createTx, 'AG01'),
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
    title: 'Actualizar alias',
    description:
      'Actualiza el estado del alias para un agente bancario.',
    pathParams: [
      { name: 'Alias', description: 'Debe coincidir con Mod.Alias del body.' },
      { name: 'Agt', description: 'Debe coincidir con Mod.Agt del body (4 caracteres alfanuméricos).' },
    ],
    bodyFields: SIMF_TRANSACTION_FIELD_RULES,
    bodyExample: buildIdModAdvcUpdateExample(),
    responses: [
      simfResponse(
        'update-accp',
        'ACCP',
        'success',
        'HTTP 200 — Result ACCP (alias actualizado)',
        buildMutationAcceptExample(updateTx, {
          Alias: 'alej.carm5234',
          Agt: '0105',
          Sts: 'INAC',
          Pty: { Nm: 'TITULAR EJEMPLO', Id: 'V9168461', SchmeNm: 'SCID' },
        }),
      ),
      simfResponse(
        'update-rr10',
        'RR10',
        'reject',
        'HTTP 200 — Result RJCT, Rsn RR10 (Campo con formato inválido)',
        buildMutationRejectExample(updateTx, 'RR10'),
      ),
      simfResponse(
        'update-be23',
        'BE23',
        'reject',
        'HTTP 200 — Result RJCT, Rsn BE23 (alias no encontrado)',
        buildMutationRejectExample(updateTx, 'BE23'),
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
    title: 'Bloquear alias (baja global)',
    description:
      'Registra la baja global del alias (Sts BLKD).',
    pathParams: [
      { name: 'Alias', description: 'Debe coincidir con Mod.Alias del body.' },
      { name: 'Agt', description: 'Debe coincidir con Mod.Agt del body.' },
    ],
    bodyFields: SIMF_TRANSACTION_FIELD_RULES,
    bodyExample: buildIdModAdvcBlockExample(),
    responses: [
      simfResponse(
        'block-accp',
        'ACCP',
        'success',
        'HTTP 200 — Result ACCP (alias bloqueado BLKD)',
        buildMutationAcceptExample(blockTx, {
          Alias: 'daniel',
          Agt: '0172',
          Sts: 'BLKD',
          Pty: { Nm: 'TITULAR EJEMPLO', Id: 'V12345678', SchmeNm: 'SCID' },
        }),
      ),
      simfResponse(
        'block-rr10',
        'RR10',
        'reject',
        'HTTP 200 — Result RJCT, Rsn RR10 (Campo con formato inválido)',
        buildMutationRejectExample(blockTx, 'RR10'),
      ),
      simfResponse(
        'block-be23',
        'BE23',
        'reject',
        'HTTP 200 — Result RJCT, Rsn BE23 (alias no encontrado)',
        buildMutationRejectExample(blockTx, 'BE23'),
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
