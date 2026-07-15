export const RULES_SECTION_TITLE = 'Reglas de negocio';

/** Regla individual, ej: R.N.A.1 */
export type BusinessRuleItem = {
  id: string;
  code: string;
  title: string;
  description: string;
  bullets?: string[];
};

/** Grupo de reglas, ej: "Reglas de MiAlias" */
export type BusinessRuleGroup = {
  id: string;
  title: string;
  intro?: string;
  rules: BusinessRuleItem[];
};

/**
 * Catálogo de reglas de negocio.
 * Para agregar o editar reglas, modifica solo este arreglo.
 */
export const BUSINESS_RULE_GROUPS: BusinessRuleGroup[] = [
  {
    id: 'alias',
    title: 'Reglas de MiAlias',
    intro: 'Validaciones aplicadas al ciclo de vida del MiAlias en BDCA MiAlias.',
    rules: [
      {
        id: 'r-n-a-1',
        code: 'R.N-A.1:',
        title: '**Longitud**',
        description:
          'El MiAlias debe tener una longitud mínima de 6 caracteres y máxima de 15 caracteres.',
        bullets: [
          '**Ejemplo válido:**  "maria.perez" (6 caracteres)',
          '**Ejemplo inválido:** "maria" (5 caracteres)',
        ],
      },
      {
        id: 'r-n-a-2',
        code: 'R.N.A.2',
        title: '**Formato**',
        description:
          'El MiAlias es alfanumérico. Se permite únicamente el carácter especial punto (.).',
        bullets: [
          '**Ejemplo válido:** "maria.perez" (10 caracteres y un caracter especial ".")',
          '**Ejemplo inválido:** "maria_perez" (10 caracteres y un caracter especial incorrecto "_")',
        ],
      },
      {
        id: 'r-n-a-3',
        code: 'R.N.A.3',
        title: '**Sintaxis del Punto**',
        description:
          'El punto (.) es el único carácter especial permitido. Su uso está sujeto a las siguientes restricciones:',
        bullets:[
            '**Exclusividad:** se prohíbe el uso de espacios, acentos, la letra “ñ” o cualquier otro símbolo adicional.',
            '**Posición:** el punto no puede ubicarse al inicio ni al final del MiAlias.',
            '**Secuencia:** se prohíbe la repetición inmediata de puntos (..) en cualquier parte de la cadena.',
            '**Validación:** implementación obligatoria en la interfaz gráfica (front-end) de la IBP mediante expresiones regulares antes de cualquier procesamiento.',
        ]
      },
      {
        id: 'r-n-a-4',
        code: 'R.N.A.4',
        title: '**Normalización y Sensibilidad**',
        description:
          'El sistema opera bajo un esquema de insensibilidad a mayúsculas (case-insensitive). Para asegurar la integridad operativa, se establecen las siguientes directrices:',
        bullets: [
          '**Normalización Obligatoria:** la IBP debe convertir el MiAlias estrictamente a minúsculas en su interfaz (front-end) antes de ser enviado para su registro o validación.',
          '**Estándar de Almacenamiento:** todas las operaciones en la BDCA se realizarán exclusivamente en minúsculas para evitar duplicidades o incongruencias en las resoluciones.',
          '**Ejemplo:** el sistema tratará "Usuario.2026", "USUARIO.2026" y "usuario.2026" como el identificador único "usuario.2026".'
        ],
      },
      {
        id: 'r-n-a-5',
        code: 'R.N.A.5',
        title: '**Eliminación y Periodo de Cuarentena**',
        description:
          'Un MiAlias puede ser eliminado del sistema a solicitud del usuario. A diferencia de un borrado permanente, el proceso seguirá los lineamientos de control soberano del BCV:',
        bullets: [
          '**Estado de Cuarentena:** todo MiAlias eliminado entrará automáticamente en un periodo de cuarentena de 90 días. Durante este lapso, el identificador permanecerá inactivo y no podrá ser registrado por el mismo ni por otro usuario.',
          '**Disponibilidad Post-Cuarentena:** una vez finalizada la cuarentena, el BCV, a través de la BDCA, revisará periódicamente el inventario de MiAlias inactivos para decidir su liberación y puesta a disposición para nuevos registros.',
        ],
      },
      {
        id: 'r-n-a-6',
        code: 'R.N.A.6',
        title: '**Límite y Gestión de Estados**',
        description:
          'La arquitectura inicial del sistema se basa en un control estricto de identidad y asociación:',
        bullets: [
          '**Límite de MiAlias:** se establece un límite máximo de un (1) MiAlias activo por cada Documento de Identificación (CI/RIF) en la BDCA.',
          '**nactivación por IBP (Baja Local):** el usuario tiene la potestad de inactivar su MiAlias de una IBP específica sin necesidad de eliminarlo globalmente del sistema. Esta acción dejará la ruta de resolución hacia esa IBP como "Inactiva", permitiendo que el MiAlias permanezca reservado para el usuario, pero sin una cuenta receptora operativa en dicha entidad.',
        ],
      }

    ],
  },





  {
    id: 'rule_regist',
    title: 'Reglas de Registro y Propiedad',
    intro: 'Formatos y validaciones de campos en mensajes de registro y propiedad.',
    rules: [
      {
        id: 'r-n-r-1',
        code: 'R.N.R.1',
        title: 'Propiedad',
        description:
          'Un MiAlias pertenece a un Documento de Identificación (CI o RIF) en el ecosistema.',
        bullets: ['**Ejemplo:** "maria.perez" pertenece a la CI "V-123456789"'],
      },
      {
        id: 'r-n-r-2',
        code: 'R.N.R.2',
        title: 'Reserva Global',
        description:
          'Debe tener 26 caracteres alfanuméricos [A-Za-z0-9]. Estructura: Canal-PSP-IBP(4) + Fecha YYYYMMDDhhmmss(14) + Referencia(8).',
        bullets: ['**Ejemplo válido:** 017220260707113000000001'],
      },
      {
        id: 'r-n-r-3',
        code: 'R.N.R.3',
        title: 'Flexibilidad de Cuenta',
        description:
          'BCV no valida la cuenta asociada como un dato inmutable. La reserva es a nivel de documento, permitiendo que el usuario cambie su cuenta receptora sin afectar la vigencia de su MiAlias.',
        bullets: ['**Ejemplo:** "maria.perez" puede cambiar su cuenta receptora de "00011234567890123456" a "0001987654321098765" sin perder su MiAlias vigente.'],
      },
      {
        id: 'r-n-r-4',
        code: 'R.N.R.4',
        title: 'Multi-banco: ',
        description:
          'El mismo Documento de Identificación (dueño del MiAlias) puede asociar su MiAlias ("MiAlias.a") a una cuenta en la IBP 1, a una cuenta en la IBP 2, etc.',
        bullets: ['**Ejemplo:** "maria.perez" puede asociarse a la cuenta "00011234567890123456" en la IBP 1 y a la cuenta "0102987654321098765" en la IBP 2.'],
      },
      {
        id: 'r-n-r-5',
        code: 'R.N.R.5',
        title: 'Unicidad por IBP',
        description:
          'El Documento de Identificación no puede registrar el mismo MiAlias en dos cuentas diferentes dentro de la misma IBP. El MiAlias debe ser único por cuenta dentro de la institución.',
        bullets: ['**Ejemplo:** "maria.perez" no puede asociarse a la cuenta "00011234567890123456" y a la cuenta "0001987654321098765" en la misma IBP.'],
      },
      {
        id: 'r-n-r-6',
        code: 'R.N.R.6',
        title: 'Límite por Identidad, Multi-MiAlias y Unicidad de Cuenta',
        description:
          'Se establece el principio de asignación de identificadores en el ecosistema dependiendo de la naturaleza jurídica del titular y las capacidades del Core de la IBP:',
        bullets: [
          '**Personas Naturales:** Límite estricto de un (1) MiAlias activo asociado a su Documento de Identidad (CI) en la BDCA.',
          '**Personas Jurídicas (Multi-MiAlias):** Las entidades jurídicas (RIF) tienen la capacidad de registrar múltiples MiAlias simultáneamente bajo el mismo documento de identidad (ej. para identificar distintas sucursales, cajas o canales de cobro). El límite máximo de identificadores permitidos para este segmento será determinado y configurado dinámicamente por el Banco Central de Venezuela (BCV).',
          '**Unicidad Estricta de Cuenta (Relación 1:1):** Es responsabilidad obligatoria de la IBP garantizar que cada MiAlias registrado o vinculado en su institución se asigne a una cuenta bancaria única e independiente. Queda expresamente prohibido que múltiples MiAlias, aun perteneciendo al mismo Documento de Identidad Jurídica, resuelvan hacia una única y misma cuenta receptora dentro de la institución.',
          '**Modelo de Resolución Global:** Cada MiAlias registrado (sea de persona natural o jurídica) mantiene su capacidad multibanca, pudiendo resolver hacia distintas IBP de forma simultánea según las cuentas vinculadas.'
        ],
      },
      {
        id: 'r-n-r-7',
        code: 'R.N.R.7',
        title: 'Expiración por Inactividad Transaccional',
        description:
          'Para garantizar la eficiencia en el uso del inventario de nombres de la BDCA, se aplica la siguiente política:',
        bullets: [
            '**Criterio de Desuso:** el MiAlias único que no registre actividad transaccional (emisión o recepción de fondos) por un periodo continuo de 24 meses será desactivado automáticamente.',
            '**Proceso de Liberación:** una vez confirmada la inactividad, el identificador entrará en el periodo de cuarentena de 90 días antes de quedar disponible para ser evaluado, por las autoridades, si podrá ser habilitado para su uso por un nuevo usuario en el futuro.'
        ],
      },
    ],
  },
  {
    id: 'rule_transaction',
    title: 'Reglas Transaccionales',
    intro: 'Validaciones al vincular o registrar cuentas.',
    rules: [
      {
        id: 'r-n-t-1',
        code: 'R.N.T.1',
        title: 'Procedimiento Estándar de Validación',
        description:
          'Se establece como la práctica operativa estándar que la IBP Ordenante realice una consulta previa a la BDCA antes de la formalización de cualquier instrucción de pago.',
        bullets: [
            '**Protocolo de Seguridad:** este paso técnico permite verificar la vigencia del MiAlias y obtener los datos de identidad necesarios (nombre y documento enmascarado) para el control anti-phishing antes del movimiento de fondos.',
            '**Mitigación de Errores:** la ejecución de esta validación es fundamental para alcanzar el objetivo de reducir los errores de captura de datos bancarios, asegurando que la instrucción de pago cuente con la confirmación visual del emisor.'
        ]
      },
      {
        id: 'r-n-t-2',
        code: 'R.N.T.2',
        title: 'Resolución del Destino',
        description:
          'La IBP Destino es la autoridad responsable de procesar la resolución final para el movimiento de los fondos.',
        bullets: [
            '**Identificación Interna:** al recibir la instrucción mediante el SIMF/BCV, la institución receptora debe identificar en sus sistemas internos la cuenta y el documento de identidad vinculados al MiAlias especificado en la trama y responder con el resultado que corresponda.',
            '**Liquidación:** la resolución interna debe ser eficiente para permitir el procesamiento inmediato de la operación y la aplicación del movimiento financiero en la cuenta correspondiente del cliente receptor.'
        ],
      },
      {
        id: 'r-n-t-3',
        code: 'R.N.T.3',
        title: 'Privacidad y No Divulgación',
        description:
          'Por razones de seguridad y resguardo del secreto bancario, la consulta a la BDCA no revelará la existencia de otras instituciones financieras o cuentas vinculadas al mismo titular.',
        bullets: [
            '**Restricción de Respuesta:** la respuesta de la BDCA se limitará exclusivamente a confirmar los datos de identidad asociados al MiAlias específico consultado, protegiendo la integridad del mapa financiero del ciudadano y evitando la divulgación de información sensible a terceros.'
        ],
      }
    ],
  },
];
