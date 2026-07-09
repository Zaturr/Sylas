export type SwaggerMessageField = {
  name: string;
  description: string;
};

/** 3.3.1 — Alias Identity Inquiry Response (GET). */
export const ALIS_ID_INQ_RES_RESPONSE_FIELDS: SwaggerMessageField[] = [
  {
    name: 'AlisIdInqRes',
    description: 'Nodo raíz para la respuesta a una consulta de descubrimiento por ID.',
  },
  {
    name: 'GrpHdr.MsgId',
    description:
      'Referencia punto a punto del mensaje. Alfanumérico, 28 caracteres: Emisor (4) + Centro de procesamiento (2) + Fecha YYYYMMDDhhmmss (14) + Secuencial (8).',
  },
  {
    name: 'GrpHdr.CreDtTm',
    description: 'Fecha y hora en la cual el mensaje fue creado. Formato ISO: YYYY-MM-DDThh:mm:ss.',
  },
  {
    name: 'InqRpt',
    description:
      'Cuerpo del mensaje en consultas. Agrupa el resultado general, los datos del cliente y la lista de alias.',
  },
  {
    name: 'InqRpt.Result',
    description:
      'Resultado transaccional de la petición. Valores permitidos: ACCP (Aceptada) o RJCT (Rechazada). 4 caracteres.',
  },
  {
    name: 'InqRpt.Rsn',
    description:
      'Motivo específico de la falla cuando Result es RJCT. Valores: ACRD, RR10, RR04, AG08, AC06, AG03, BE23, AG01. Con BE23 la IBP debe interpretar que el ID no tiene alias y habilitar el registro en front-end.',
  },
  {
    name: 'InqRpt.Pty',
    description:
      'Información jurídica del titular (persona o empresa) asociado a la operación.',
  },
  {
    name: 'InqRpt.Pty.Nm',
    description: 'Nombre del titular en mayúsculas. Alfanumérico, 1 a 140 caracteres.',
  },
  {
    name: 'InqRpt.Pty.Id',
    description:
      'Documento de identidad legal según esquema: SCID (V/E + número), SRIF (J/G/C/R + 9 dígitos) o SPAS (P + número). Sin espacios ni caracteres especiales.',
  },
  {
    name: 'InqRpt.Pty.SchmeNm',
    description: 'Esquema de identificación: SCID (cédula), SRIF (RIF) o SPAS (pasaporte). 4 caracteres.',
  },
  {
    name: 'InqRpt.AliasList',
    description: 'Arreglo de alias del cliente.',
  },
  {
    name: 'InqRpt.AliasList[].Alias',
    description:
      'Identificador enmascarado del cliente. Minúsculas, sin acentos, 6 a 15 caracteres. Punto (.) permitido, no al inicio/fin ni doble (..). En inexistencia total retorna RJCT con Rsn BE23.',
  },
  {
    name: 'InqRpt.AliasList[].AgtList',
    description:
      'Arreglo de bancos del alias. Normalmente retorna un solo ítem asociado al banco que consulta.',
  },
  {
    name: 'InqRpt.AliasList[].AgtList[].Agt',
    description:
      'Código de institución bancaria participante en la CCE. Alfanumérico, 4 caracteres.',
  },
  {
    name: 'InqRpt.AliasList[].AgtList[].Sts',
    description:
      'Estado lógico del vínculo alias-banco: ACTV (activa), INAC (inactiva), PNDL (pending deletion), BLKD (bloqueado), UNRG (no registrado).',
  },
];

/** 3.3.2 — Identity Modification Advice, registro (POST). */
export const ID_MOD_ADVC_CREATE_REQUEST_FIELDS: SwaggerMessageField[] = [
  {
    name: 'IdModAdvc',
    description:
      'Nodo raíz para la petición de registro, vinculación o actualización de un identificador.',
  },
  {
    name: 'GrpHdr.MsgId',
    description:
      'Referencia punto a punto del mensaje. Alfanumérico, 28 caracteres: Emisor (4) + Centro (2) + Fecha YYYYMMDDhhmmss (14) + Secuencial (8).',
  },
  {
    name: 'GrpHdr.CreDtTm',
    description: 'Fecha y hora de creación del mensaje. Formato ISO: YYYY-MM-DDThh:mm:ss.',
  },
  {
    name: 'Mod',
    description: 'Bloque de carga útil principal con los datos a insertar o mutar en la BDCA.',
  },
  {
    name: 'Mod.Agt',
    description:
      'Código de institución bancaria participante en la CCE. Alfanumérico, 4 caracteres.',
  },
  {
    name: 'Mod.EndToEndId',
    description:
      'Identificación única de la transacción asignada por la IBP iniciadora. Alfanumérico, 26 caracteres: Canal-PSP-IBP (4) + Fecha YYYYMMDDhhmmss (14) + Referencia interna (8).',
  },
  {
    name: 'Mod.Alias',
    description:
      'Identificador enmascarado del cliente. Minúsculas, sin acentos, 6 a 15 caracteres. Punto (.) permitido, no al inicio/fin ni doble (..).',
  },
  {
    name: 'Mod.Pty',
    description: 'Información jurídica del titular asociado al registro.',
  },
  {
    name: 'Mod.Pty.Nm',
    description: 'Nombre completo del titular en mayúsculas. Alfanumérico, 1 a 140 caracteres.',
  },
  {
    name: 'Mod.Pty.Id',
    description:
      'Documento de identidad legal según esquema SCID, SRIF o SPAS. Sin espacios ni caracteres especiales.',
  },
  {
    name: 'Mod.Pty.SchmeNm',
    description: 'Esquema de identificación: SCID (cédula), SRIF (RIF) o SPAS (pasaporte).',
  },
];

/** 3.3.2 — Identity Modification Advice, actualización/bloqueo (PUT). */
export const ID_MOD_ADVC_MUTATION_REQUEST_FIELDS: SwaggerMessageField[] = [
  {
    name: 'IdModAdvc',
    description:
      'Nodo raíz para la petición de actualización o baja global de un identificador.',
  },
  {
    name: 'GrpHdr.MsgId',
    description:
      'Referencia punto a punto del mensaje. Alfanumérico, 28 caracteres: Emisor (4) + Centro (2) + Fecha YYYYMMDDhhmmss (14) + Secuencial (8).',
  },
  {
    name: 'GrpHdr.CreDtTm',
    description: 'Fecha y hora de creación del mensaje. Formato ISO: YYYY-MM-DDThh:mm:ss.',
  },
  {
    name: 'Mod',
    description: 'Bloque de carga útil principal con los datos a mutar en la BDCA.',
  },
  {
    name: 'Mod.Agt',
    description:
      'Código de institución bancaria participante en la CCE. Debe coincidir con el Agt del path. 4 caracteres.',
  },
  {
    name: 'Mod.EndToEndId',
    description:
      'Identificación única de la transacción. Alfanumérico, 26 caracteres: Canal-PSP-IBP (4) + Fecha YYYYMMDDhhmmss (14) + Referencia interna (8).',
  },
  {
    name: 'Mod.Alias',
    description:
      'Identificador enmascarado a actualizar. Debe coincidir con el Alias del path. Minúsculas, 6 a 15 caracteres.',
  },
  {
    name: 'Mod.Sts',
    description:
      'Estado objetivo del vínculo alias-banco: ACTV, INAC, PNDL, BLKD o UNRG. En baja global se envía BLKD.',
  },
];

/** 3.3.3 — Identity Verification Report (POST/PUT response). */
export const ID_VRFCTN_RPT_RESPONSE_FIELDS: SwaggerMessageField[] = [
  {
    name: 'IdVrfctnRpt',
    description: 'Nodo raíz para la respuesta a una petición de modificación o registro.',
  },
  {
    name: 'GrpHdr.MsgId',
    description:
      'Referencia punto a punto del mensaje de respuesta. Alfanumérico, 28 caracteres: Emisor (4) + Centro (2) + Fecha YYYYMMDDhhmmss (14) + Secuencial (8).',
  },
  {
    name: 'GrpHdr.CreDtTm',
    description: 'Fecha y hora en la cual el mensaje de respuesta fue creado. Formato: YYYY-MM-DDThh:mm:ss.',
  },
  {
    name: 'OrgnlAssgnmt',
    description:
      'Bloque de vinculación transaccional. Referencia exacta a la petición original que generó esta respuesta.',
  },
  {
    name: 'OrgnlAssgnmt.OrgnlMsgId',
    description:
      'MsgId de la petición original. Permite relacionar la respuesta con la solicitud en la capa de servicios. 28 caracteres.',
  },
  {
    name: 'OrgnlAssgnmt.OrgnlCreDtTm',
    description: 'Fecha y hora de creación del mensaje original. Formato: YYYY-MM-DDThh:mm:ss.',
  },
  {
    name: 'Rpt',
    description:
      'Bloque de confirmación o rechazo. Contiene el EndToEndId original y el resultado transaccional.',
  },
  {
    name: 'Rpt.OrgnlEndToEndId',
    description:
      'EndToEndId enviado en la petición, devuelto para conciliación. Alfanumérico, 26 caracteres: Canal-PSP-IBP (4) + Fecha (14) + Referencia (8).',
  },
  {
    name: 'Rpt.Result',
    description:
      'Resultado de la petición original: ACCP (Aceptada) o RJCT (Rechazada). 4 caracteres.',
  },
  {
    name: 'Rpt.Rsn',
    description:
      'Motivo de falla cuando Result es RJCT. Valores: ACRD, RR10, RR04, AG08, AC06, AG03, BE23, AG01. Opcional en aceptaciones.',
  },
  {
    name: 'Mod',
    description:
      'Opcional en rechazos. Refleja los datos procesados en la BDCA cuando la operación es aceptada.',
  },
  {
    name: 'Mod.Alias',
    description:
      'Alias procesado. Minúsculas, sin acentos. Punto (.) permitido, no al inicio/fin ni doble (..).',
  },
  {
    name: 'Mod.Agt',
    description: 'Código de institución bancaria participante en la CCE. 4 caracteres.',
  },
  {
    name: 'Mod.Sts',
    description:
      'Estado del vínculo alias-banco: ACTV, INAC, PNDL, BLKD o UNRG.',
  },
  {
    name: 'Mod.Pty',
    description: 'Información jurídica del titular. Presente en respuestas de registro exitoso.',
  },
  {
    name: 'Mod.Pty.Nm',
    description:
      'Nombre del titular en mayúsculas (1-140 caracteres). En anti-phishing puede enmascararse en front-end; SRIF se muestra completo.',
  },
  {
    name: 'Mod.Pty.Id',
    description:
      'Documento de identidad según SCID, SRIF o SPAS. En anti-phishing la cédula puede enmascararse (ej. V*****697); SRIF se muestra completo.',
  },
  {
    name: 'Mod.Pty.SchmeNm',
    description: 'Esquema de identificación: SCID, SRIF o SPAS.',
  },
  
];
