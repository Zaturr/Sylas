export type TestScenarioAccountStatus = 'ACTV' | 'INAC';

export type TestScenarioAccountConfig = {
  bank_id: string;
  status: TestScenarioAccountStatus;
  type?: 'corriente' | 'ahorro' | 'dolares';
};

export type TestScenarioAliasConfig = {
  alias_value: string;
  alias_status?: 'ENABLED' | 'BLKD';
  account_index: number;
};

export type TestScenarioConfig = {
  id: string;
  label: string;
  document_type?: 'V' | 'J' | 'G' | 'C';
  document_number: string;
  alias_value?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  second_last_name: string;
  alias_status?: 'ENABLED' | 'BLKD';
  aliases?: TestScenarioAliasConfig[];
  /** Índice de la cuenta vinculada al alias (0 = corriente). Solo naturales. */
  linked_account_index?: number;
  accounts: TestScenarioAccountConfig[];
};

import { getApiBaseUrl, getSimulationConfig } from '../../configService';

type LegalEntityAccountCounts = {
  ctsCorrientes: number;
  ctsAhorro: number;
  ctsDivisa: number;
};

function getLegalEntityCounts(): LegalEntityAccountCounts {
  const configured = getSimulationConfig().legalEntityAccounts;
  return {
    ctsCorrientes: configured?.ctsCorrientes ?? 5,
    ctsAhorro: configured?.ctsAhorro ?? 2,
    ctsDivisa: configured?.ctsDivisa ?? 1,
  };
}

function totalLegalEntityAccounts(): number {
  const counts = getLegalEntityCounts();
  return counts.ctsCorrientes + counts.ctsAhorro + counts.ctsDivisa;
}

function eligibleLegalEntityAliasAccounts(): number {
  const counts = getLegalEntityCounts();
  return counts.ctsCorrientes + counts.ctsAhorro;
}

function repeatStatus(status: TestScenarioAccountStatus, length = totalLegalEntityAccounts()): TestScenarioAccountStatus[] {
  return Array.from({ length }, () => status);
}

function buildJuridicalAccounts(
  userBankId: string,
  statuses: TestScenarioAccountStatus[],
): TestScenarioAccountConfig[] {
  const counts = getLegalEntityCounts();
  const types: Array<'corriente' | 'ahorro' | 'dolares'> = [
    ...Array.from({ length: counts.ctsCorrientes }, () => 'corriente' as const),
    ...Array.from({ length: counts.ctsAhorro }, () => 'ahorro' as const),
    ...Array.from({ length: counts.ctsDivisa }, () => 'dolares' as const),
  ];

  return types.map((type, index) => ({
    bank_id: userBankId,
    status: statuses[index] ?? 'ACTV',
    type,
  }));
}

function buildAliasEntries(
  prefix: string,
  accountIndexes: number[],
  aliasStatus?: 'ENABLED' | 'BLKD',
): TestScenarioAliasConfig[] {
  return accountIndexes.map((accountIndex, index) => ({
    alias_value: `${prefix}.${index + 1}`,
    account_index: accountIndex,
    ...(aliasStatus ? { alias_status: aliasStatus } : {}),
  }));
}

function buildSingleAlias(
  aliasValue: string,
  accountIndex: number,
  aliasStatus?: 'ENABLED' | 'BLKD',
): TestScenarioAliasConfig[] {
  return [
    {
      alias_value: aliasValue,
      account_index: accountIndex,
      ...(aliasStatus ? { alias_status: aliasStatus } : {}),
    },
  ];
}

function buildNaturalSoloBankAccounts(
  userBankId: string,
  corrienteStatus: TestScenarioAccountStatus,
  ahorroStatus: TestScenarioAccountStatus = corrienteStatus,
  dolaresStatus: TestScenarioAccountStatus = 'ACTV',
): TestScenarioAccountConfig[] {
  return [
    { bank_id: userBankId, status: corrienteStatus, type: 'corriente' },
    { bank_id: userBankId, status: ahorroStatus, type: 'ahorro' },
    { bank_id: userBankId, status: dolaresStatus, type: 'dolares' },
  ];
}

function buildNaturalMultiBankAccounts(
  userBankId: string,
  userStatuses: {
    corriente: TestScenarioAccountStatus;
    ahorro?: TestScenarioAccountStatus;
    dolares?: TestScenarioAccountStatus;
  },
  external: Array<{ bank_id: string; status: TestScenarioAccountStatus }>,
): TestScenarioAccountConfig[] {
  return [
    ...buildNaturalSoloBankAccounts(
      userBankId,
      userStatuses.corriente,
      userStatuses.ahorro ?? userStatuses.corriente,
      userStatuses.dolares ?? 'ACTV',
    ),
    ...external.map((entry) => ({
      bank_id: entry.bank_id,
      status: entry.status,
      type: 'corriente' as const,
    })),
  ];
}

function buildLegalEntityTestScenarios(userBankId: string): TestScenarioConfig[] {
  const eligibleCount = eligibleLegalEntityAliasAccounts();
  const allEligibleIndexes = Array.from({ length: eligibleCount }, (_, index) => index);

  return [
    {
      id: 'J-BLKD-SINGLE-01',
      label: 'Jurídico BLKD - un alias',
      document_type: 'J',
      document_number: '30000001',
      first_name: 'Inversiones Sigma',
      last_name: 'CA',
      second_last_name: '',
      accounts: buildJuridicalAccounts(userBankId, repeatStatus('INAC')),
      aliases: buildSingleAlias('j.blkd.solo', 0, 'BLKD'),
    },
    {
      id: 'J-BLKD-MULTI-01',
      label: 'Jurídico BLKD - varios alias',
      document_type: 'J',
      document_number: '30000002',
      first_name: 'Comercializadora Delta',
      last_name: 'CA',
      second_last_name: '',
      accounts: buildJuridicalAccounts(userBankId, repeatStatus('INAC')),
      aliases: buildAliasEntries('j.blkd', [0, 1, 2], 'BLKD'),
    },
    {
      id: 'J-INAC-SINGLE-01',
      label: 'Jurídico INAC - un alias',
      document_type: 'J',
      document_number: '30000003',
      first_name: 'Servicios Orion',
      last_name: 'CA',
      second_last_name: '',
      accounts: buildJuridicalAccounts(userBankId, repeatStatus('INAC')),
      aliases: buildSingleAlias('j.inac.solo', 0),
    },
    {
      id: 'J-INAC-ALL-01',
      label: 'Jurídico INAC - todos los alias',
      document_type: 'J',
      document_number: '30000004',
      first_name: 'Grupo Andina',
      last_name: 'CA',
      second_last_name: '',
      accounts: buildJuridicalAccounts(userBankId, repeatStatus('INAC')),
      aliases: buildAliasEntries('j.inac', allEligibleIndexes),
    },
    {
      id: 'J-INAC-VAR-01',
      label: 'Jurídico INAC - alias mixtos',
      document_type: 'J',
      document_number: '30000005',
      first_name: 'TechNova Solutions',
      last_name: 'CA',
      second_last_name: '',
      accounts: buildJuridicalAccounts(userBankId, ['INAC', 'INAC', 'ACTV', 'ACTV', 'ACTV', 'ACTV', 'ACTV', 'ACTV']),
      aliases: buildAliasEntries('j.inac.var', [0, 1, 2, 3]),
    },
    {
      id: 'J-INAC-ALL-BUT-ONE-01',
      label: 'Jurídico INAC - todos menos uno ACTV',
      document_type: 'J',
      document_number: '30000006',
      first_name: 'Agroindustrial Vega',
      last_name: 'CA',
      second_last_name: '',
      accounts: buildJuridicalAccounts(userBankId, ['ACTV', 'INAC', 'INAC', 'INAC', 'INAC', 'INAC', 'INAC', 'INAC']),
      aliases: buildAliasEntries('j.inac.one', allEligibleIndexes),
    },
    {
      id: 'J-ACTV-SINGLE-01',
      label: 'Jurídico ACTV - un alias',
      document_type: 'J',
      document_number: '30000007',
      first_name: 'Constructora Atlas',
      last_name: 'CA',
      second_last_name: '',
      accounts: buildJuridicalAccounts(userBankId, repeatStatus('ACTV')),
      aliases: buildSingleAlias('j.actv.solo', 0),
    },
    {
      id: 'J-ACTV-ALL-01',
      label: 'Jurídico ACTV - todos los alias',
      document_type: 'J',
      document_number: '30000008',
      first_name: 'Logistica Integral',
      last_name: 'CA',
      second_last_name: '',
      accounts: buildJuridicalAccounts(userBankId, repeatStatus('ACTV')),
      aliases: buildAliasEntries('j.actv', allEligibleIndexes),
    },
    {
      id: 'J-ACTV-VAR-01',
      label: 'Jurídico ACTV - alias mixtos',
      document_type: 'J',
      document_number: '30000009',
      first_name: 'Distribuidora Horizonte',
      last_name: 'CA',
      second_last_name: '',
      accounts: buildJuridicalAccounts(userBankId, ['ACTV', 'INAC', 'ACTV', 'INAC', 'ACTV', 'ACTV', 'ACTV', 'ACTV']),
      aliases: buildAliasEntries('j.actv.var', [0, 1, 2, 3]),
    },
    {
      id: 'J-ACTV-ALL-BUT-ISSUER-01',
      label: 'Jurídico ACTV - todos menos la cuenta emisora',
      document_type: 'J',
      document_number: '30000010',
      first_name: 'Manufactura Prime',
      last_name: 'CA',
      second_last_name: '',
      accounts: buildJuridicalAccounts(userBankId, ['INAC', 'ACTV', 'ACTV', 'ACTV', 'ACTV', 'ACTV', 'ACTV', 'ACTV']),
      aliases: buildAliasEntries('j.actv.emis', allEligibleIndexes),
    },
  ];
}

const ALL_BANKS = {
  banesco: '0134',
  mercantil: '0105',
  provincial: '0108',
  bancamiga: '0172',
  cien: '0156',
} as const;

function otherBankCodes(userBankId: string): string[] {
  return Object.values(ALL_BANKS).filter((code) => code !== userBankId);
}

function buildTestScenarios(userBankId: string): TestScenarioConfig[] {
  const [o1, o2, o3] = otherBankCodes(userBankId);

  return [
    // --- 10 UNRG: sin alias registrado ---
    // 5 solo banco del usuario
    {
      id: 'UNRG-SOLO-01',
      label: 'UNRG - solo banco del usuario',
      document_number: '10000001',
      first_name: 'Carlos',
      last_name: 'Mendoza',
      second_last_name: 'Perez',
      accounts: buildNaturalSoloBankAccounts(userBankId, 'ACTV'),
    },
    {
      id: 'UNRG-SOLO-02',
      label: 'UNRG - solo banco del usuario',
      document_number: '10000002',
      first_name: 'Laura',
      last_name: 'Fernandez',
      second_last_name: 'Gomez',
      accounts: buildNaturalSoloBankAccounts(userBankId, 'ACTV'),
    },
    {
      id: 'UNRG-SOLO-03',
      label: 'UNRG - solo banco del usuario',
      document_number: '10000003',
      first_name: 'Miguel',
      last_name: 'Torres',
      second_last_name: 'Ruiz',
      accounts: buildNaturalSoloBankAccounts(userBankId, 'ACTV'),
    },
    {
      id: 'UNRG-SOLO-04',
      label: 'UNRG - solo banco del usuario',
      document_number: '10000004',
      first_name: 'Andrea',
      last_name: 'Ruiz',
      second_last_name: 'Silva',
      accounts: buildNaturalSoloBankAccounts(userBankId, 'ACTV'),
    },
    {
      id: 'UNRG-SOLO-05',
      label: 'UNRG - solo banco del usuario',
      document_number: '10000005',
      first_name: 'Roberto',
      last_name: 'Silva',
      second_last_name: 'Mendoza',
      accounts: buildNaturalSoloBankAccounts(userBankId, 'ACTV'),
    },
    // 5 con multiples bancos
    {
      id: 'UNRG-MULTI-01',
      label: 'UNRG - multiples bancos',
      document_number: '10000006',
      first_name: 'Patricia',
      last_name: 'Gomez',
      second_last_name: 'Torres',
      accounts: buildNaturalMultiBankAccounts(
        userBankId,
        { corriente: 'ACTV' },
        [
          { bank_id: o1, status: 'ACTV' },
          { bank_id: o2, status: 'ACTV' },
        ],
      ),
    },
    {
      id: 'UNRG-MULTI-02',
      label: 'UNRG - multiples bancos',
      document_number: '10000007',
      first_name: 'Diego',
      last_name: 'Herrera',
      second_last_name: 'Fernandez',
      accounts: buildNaturalMultiBankAccounts(
        userBankId,
        { corriente: 'ACTV' },
        [
          { bank_id: o1, status: 'ACTV' },
          { bank_id: o3, status: 'ACTV' },
        ],
      ),
    },
    {
      id: 'UNRG-MULTI-03',
      label: 'UNRG - multiples bancos',
      document_number: '10000008',
      first_name: 'Carmen',
      last_name: 'Vega',
      second_last_name: 'Silva',
      accounts: buildNaturalMultiBankAccounts(
        userBankId,
        { corriente: 'ACTV' },
        [
          { bank_id: o2, status: 'ACTV' },
          { bank_id: o3, status: 'ACTV' },
        ],
      ),
    },
    {
      id: 'UNRG-MULTI-04',
      label: 'UNRG - multiples bancos',
      document_number: '10000009',
      first_name: 'Fernando',
      last_name: 'Castro',
      second_last_name: 'Mendoza',
      accounts: buildNaturalMultiBankAccounts(
        userBankId,
        { corriente: 'ACTV' },
        [
          { bank_id: o1, status: 'ACTV' },
          { bank_id: o2, status: 'ACTV' },
          { bank_id: o3, status: 'ACTV' },
        ],
      ),
    },
    {
      id: 'UNRG-MULTI-05',
      label: 'UNRG - multiples bancos',
      document_number: '10000010',
      first_name: 'Isabel',
      last_name: 'Morales',
      second_last_name: 'Ruiz',
      accounts: buildNaturalMultiBankAccounts(
        userBankId,
        { corriente: 'ACTV' },
        [
          { bank_id: o1, status: 'ACTV' },
          { bank_id: o3, status: 'ACTV' },
        ],
      ),
    },

    // --- 10 casos variados de status (con alias descriptivo, 1 alias por titular) ---
    {
      id: 'BLKD-SINGLE-01',
      label: 'BLKD de un solo banco',
      document_number: '20000001',
      alias_value: 'blkd.solo',
      linked_account_index: 0,
      first_name: 'Sofia',
      last_name: 'Ramirez',
      second_last_name: 'Gomez',
      alias_status: 'BLKD',
      accounts: buildNaturalSoloBankAccounts(userBankId, 'INAC'),
    },
    {
      id: 'BLKD-MULTI-01',
      label: 'BLKD de varios bancos',
      document_number: '20000002',
      alias_value: 'blkd.multi',
      linked_account_index: 0,
      first_name: 'Ricardo',
      last_name: 'Pena',
      second_last_name: 'Torres',
      alias_status: 'BLKD',
      accounts: buildNaturalMultiBankAccounts(
        userBankId,
        { corriente: 'INAC', ahorro: 'INAC', dolares: 'INAC' },
        [
          { bank_id: o1, status: 'INAC' },
          { bank_id: o2, status: 'INAC' },
          { bank_id: o3, status: 'INAC' },
        ],
      ),
    },
    {
      id: 'INAC-SINGLE-01',
      label: 'INAC de un solo banco',
      document_number: '20000003',
      alias_value: 'inac.solo',
      linked_account_index: 0,
      first_name: 'Elena',
      last_name: 'Vargas',
      second_last_name: 'Silva',
      accounts: buildNaturalSoloBankAccounts(userBankId, 'INAC'),
    },
    {
      id: 'INAC-ALL-01',
      label: 'INAC de todas las cuentas',
      document_number: '20000004',
      alias_value: 'inac.todas',
      linked_account_index: 0,
      first_name: 'Pablo',
      last_name: 'Navarro',
      second_last_name: 'Mendoza',
      accounts: buildNaturalMultiBankAccounts(
        userBankId,
        { corriente: 'INAC', ahorro: 'INAC', dolares: 'INAC' },
        [
          { bank_id: o1, status: 'INAC' },
          { bank_id: o2, status: 'INAC' },
          { bank_id: o3, status: 'INAC' },
        ],
      ),
    },
    {
      id: 'INAC-VAR-01',
      label: 'INAC de varias cuentas menos la del banco del usuario',
      document_number: '20000005',
      alias_value: 'inac.varias',
      linked_account_index: 0,
      first_name: 'Valentina',
      last_name: 'Cordero',
      second_last_name: 'Ruiz',
      accounts: buildNaturalMultiBankAccounts(
        userBankId,
        { corriente: 'ACTV', ahorro: 'ACTV', dolares: 'ACTV' },
        [
          { bank_id: o1, status: 'INAC' },
          { bank_id: o2, status: 'INAC' },
          { bank_id: o3, status: 'ACTV' },
        ],
      ),
    },
    {
      id: 'INAC-ALL-BUT-USER-01',
      label: 'INAC de todas las cuentas menos la del banco del usuario',
      document_number: '20000006',
      alias_value: 'inac.nouser',
      linked_account_index: 0,
      first_name: 'Andres',
      last_name: 'Molina',
      second_last_name: 'Gomez',
      accounts: buildNaturalMultiBankAccounts(
        userBankId,
        { corriente: 'ACTV', ahorro: 'ACTV', dolares: 'ACTV' },
        [
          { bank_id: o1, status: 'INAC' },
          { bank_id: o2, status: 'INAC' },
          { bank_id: o3, status: 'INAC' },
        ],
      ),
    },
    {
      id: 'ACTV-SINGLE-01',
      label: 'ACTV de un solo banco',
      document_number: '20000007',
      alias_value: 'actv.solo',
      linked_account_index: 0,
      first_name: 'Gabriela',
      last_name: 'Pinto',
      second_last_name: 'Torres',
      accounts: buildNaturalSoloBankAccounts(userBankId, 'ACTV'),
    },
    {
      id: 'ACTV-ALL-01',
      label: 'ACTV de todas las cuentas',
      document_number: '20000008',
      alias_value: 'actv.todas',
      linked_account_index: 0,
      first_name: 'Hugo',
      last_name: 'Delgado',
      second_last_name: 'Silva',
      accounts: buildNaturalMultiBankAccounts(
        userBankId,
        { corriente: 'ACTV', ahorro: 'ACTV', dolares: 'ACTV' },
        [
          { bank_id: o1, status: 'ACTV' },
          { bank_id: o2, status: 'ACTV' },
          { bank_id: o3, status: 'ACTV' },
        ],
      ),
    },
    {
      id: 'ACTV-VAR-01',
      label: 'ACTV de varias cuentas menos la del banco del usuario',
      document_number: '20000009',
      alias_value: 'actv.varias',
      linked_account_index: 0,
      first_name: 'Natalia',
      last_name: 'Ortega',
      second_last_name: 'Mendoza',
      accounts: buildNaturalMultiBankAccounts(
        userBankId,
        { corriente: 'INAC', ahorro: 'INAC', dolares: 'INAC' },
        [
          { bank_id: o1, status: 'ACTV' },
          { bank_id: o2, status: 'ACTV' },
          { bank_id: o3, status: 'INAC' },
        ],
      ),
    },
    {
      id: 'ACTV-ALL-BUT-ISSUER-01',
      label: 'ACTV de todas las cuentas menos la cuenta emisora',
      document_number: '20000010',
      alias_value: 'actv.nemis',
      linked_account_index: 0,
      first_name: 'Oscar',
      last_name: 'Fuentes',
      second_last_name: 'Ruiz',
      accounts: buildNaturalMultiBankAccounts(
        userBankId,
        { corriente: 'INAC', ahorro: 'INAC', dolares: 'INAC' },
        [
          { bank_id: o1, status: 'ACTV' },
          { bank_id: o2, status: 'ACTV' },
          { bank_id: o3, status: 'ACTV' },
        ],
      ),
    },

    ...buildLegalEntityTestScenarios(userBankId),
  ];
}

export const appConfig = {
  get apiBaseUrl() {
    return getApiBaseUrl();
  },

  get simulation() {
    return getSimulationConfig();
  },

  get testScenarios() {
    return buildTestScenarios(getSimulationConfig().bankCode);
  },
};
