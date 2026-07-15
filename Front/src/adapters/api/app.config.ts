export type TestScenarioAccountStatus = 'ACTV' | 'INAC';

export type TestScenarioAccountConfig = {
  bank_id: string;
  status: TestScenarioAccountStatus;
  type?: 'corriente' | 'ahorro' | 'dolares';
};

export type TestScenarioConfig = {
  id: string;
  label: string;
  document_number: string;
  alias_value?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  second_last_name: string;
  alias_status?: 'ENABLED' | 'BLKD';
  accounts: TestScenarioAccountConfig[];
};

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
      accounts: [
        { bank_id: userBankId, status: 'ACTV', type: 'corriente' },
        { bank_id: userBankId, status: 'ACTV', type: 'ahorro' },
        { bank_id: userBankId, status: 'ACTV', type: 'dolares' },
      ],
    },
    {
      id: 'UNRG-SOLO-02',
      label: 'UNRG - solo banco del usuario',
      document_number: '10000002',
      first_name: 'Laura',
      last_name: 'Fernandez',
      second_last_name: 'Gomez',
      accounts: [
        { bank_id: userBankId, status: 'ACTV', type: 'corriente' },
        { bank_id: userBankId, status: 'ACTV', type: 'ahorro' },
        { bank_id: userBankId, status: 'ACTV', type: 'dolares' },
      ],
    },
    {
      id: 'UNRG-SOLO-03',
      label: 'UNRG - solo banco del usuario',
      document_number: '10000003',
      first_name: 'Miguel',
      last_name: 'Torres',
      second_last_name: 'Ruiz',
      accounts: [
        { bank_id: userBankId, status: 'ACTV', type: 'corriente' },
        { bank_id: userBankId, status: 'ACTV', type: 'ahorro' },
        { bank_id: userBankId, status: 'ACTV', type: 'dolares' },
      ],
    },
    {
      id: 'UNRG-SOLO-04',
      label: 'UNRG - solo banco del usuario',
      document_number: '10000004',
      first_name: 'Andrea',
      last_name: 'Ruiz',
      second_last_name: 'Silva',
      accounts: [
        { bank_id: userBankId, status: 'ACTV', type: 'corriente' },
        { bank_id: userBankId, status: 'ACTV', type: 'ahorro' },
        { bank_id: userBankId, status: 'ACTV', type: 'dolares' },
      ],
    },
    {
      id: 'UNRG-SOLO-05',
      label: 'UNRG - solo banco del usuario',
      document_number: '10000005',
      first_name: 'Roberto',
      last_name: 'Silva',
      second_last_name: 'Mendoza',
      accounts: [
        { bank_id: userBankId, status: 'ACTV', type: 'corriente' },
        { bank_id: userBankId, status: 'ACTV', type: 'ahorro' },
        { bank_id: userBankId, status: 'ACTV', type: 'dolares' },
      ],
    },
    // 5 con multiples bancos
    {
      id: 'UNRG-MULTI-01',
      label: 'UNRG - multiples bancos',
      document_number: '10000006',
      first_name: 'Patricia',
      last_name: 'Gomez',
      second_last_name: 'Torres',
      accounts: [
        { bank_id: userBankId, status: 'ACTV' },
        { bank_id: o1, status: 'ACTV' },
        { bank_id: o2, status: 'ACTV' },
      ],
    },
    {
      id: 'UNRG-MULTI-02',
      label: 'UNRG - multiples bancos',
      document_number: '10000007',
      first_name: 'Diego',
      last_name: 'Herrera',
      second_last_name: 'Fernandez',
      accounts: [
        { bank_id: userBankId, status: 'ACTV' },
        { bank_id: o1, status: 'ACTV' },
        { bank_id: o3, status: 'ACTV' },
      ],
    },
    {
      id: 'UNRG-MULTI-03',
      label: 'UNRG - multiples bancos',
      document_number: '10000008',
      first_name: 'Carmen',
      last_name: 'Vega',
      second_last_name: 'Silva',
      accounts: [
        { bank_id: userBankId, status: 'ACTV' },
        { bank_id: o2, status: 'ACTV' },
        { bank_id: o3, status: 'ACTV' },
      ],
    },
    {
      id: 'UNRG-MULTI-04',
      label: 'UNRG - multiples bancos',
      document_number: '10000009',
      first_name: 'Fernando',
      last_name: 'Castro',
      second_last_name: 'Mendoza',
      accounts: [
        { bank_id: userBankId, status: 'ACTV' },
        { bank_id: o1, status: 'ACTV' },
        { bank_id: o2, status: 'ACTV' },
        { bank_id: o3, status: 'ACTV' },
      ],
    },
    {
      id: 'UNRG-MULTI-05',
      label: 'UNRG - multiples bancos',
      document_number: '10000010',
      first_name: 'Isabel',
      last_name: 'Morales',
      second_last_name: 'Ruiz',
      accounts: [
        { bank_id: userBankId, status: 'ACTV' },
        { bank_id: o1, status: 'ACTV' },
        { bank_id: o3, status: 'ACTV' },
      ],
    },

    // --- 10 casos variados de status (con alias descriptivo) ---
    {
      id: 'BLKD-SINGLE-01',
      label: 'BLKD de un solo banco',
      document_number: '20000001',
      alias_value: 'blkd.solo',
      first_name: 'Sofia',
      last_name: 'Ramirez',
      second_last_name: 'Gomez',
      alias_status: 'BLKD',
      accounts: [
        { bank_id: userBankId, status: 'INAC', type: 'corriente' },
        { bank_id: userBankId, status: 'INAC', type: 'ahorro' },
        { bank_id: userBankId, status: 'INAC', type: 'dolares' },
      ],
    },
    {
      id: 'BLKD-MULTI-01',
      label: 'BLKD de varios bancos',
      document_number: '20000002',
      alias_value: 'blkd.multi',
      first_name: 'Ricardo',
      last_name: 'Pena',
      second_last_name: 'Torres',
      alias_status: 'BLKD',
      accounts: [
        { bank_id: userBankId, status: 'INAC' },
        { bank_id: o1, status: 'INAC' },
        { bank_id: o2, status: 'INAC' },
        { bank_id: o3, status: 'INAC' },
      ],
    },
    {
      id: 'INAC-SINGLE-01',
      label: 'INAC de un solo banco',
      document_number: '20000003',
      alias_value: 'inac.solo',
      first_name: 'Elena',
      last_name: 'Vargas',
      second_last_name: 'Silva',
      accounts: [
        { bank_id: userBankId, status: 'INAC', type: 'corriente' },
        { bank_id: userBankId, status: 'INAC', type: 'ahorro' },
        { bank_id: userBankId, status: 'INAC', type: 'dolares' },
      ],
    },
    {
      id: 'INAC-ALL-01',
      label: 'INAC de todas las cuentas',
      document_number: '20000004',
      alias_value: 'inac.todas',
      first_name: 'Pablo',
      last_name: 'Navarro',
      second_last_name: 'Mendoza',
      accounts: [
        { bank_id: userBankId, status: 'INAC' },
        { bank_id: o1, status: 'INAC' },
        { bank_id: o2, status: 'INAC' },
        { bank_id: o3, status: 'INAC' },
      ],
    },
    {
      id: 'INAC-VAR-01',
      label: 'INAC de varias cuentas menos la del banco del usuario',
      document_number: '20000005',
      alias_value: 'inac.varias',
      first_name: 'Valentina',
      last_name: 'Cordero',
      second_last_name: 'Ruiz',
      accounts: [
        { bank_id: userBankId, status: 'ACTV' },
        { bank_id: o1, status: 'INAC' },
        { bank_id: o2, status: 'INAC' },
        { bank_id: o3, status: 'ACTV' },
      ],
    },
    {
      id: 'INAC-ALL-BUT-USER-01',
      label: 'INAC de todas las cuentas menos la del banco del usuario',
      document_number: '20000006',
      alias_value: 'inac.nouser',
      first_name: 'Andres',
      last_name: 'Molina',
      second_last_name: 'Gomez',
      accounts: [
        { bank_id: userBankId, status: 'ACTV' },
        { bank_id: o1, status: 'INAC' },
        { bank_id: o2, status: 'INAC' },
        { bank_id: o3, status: 'INAC' },
      ],
    },
    {
      id: 'ACTV-SINGLE-01',
      label: 'ACTV de un solo banco',
      document_number: '20000007',
      alias_value: 'actv.solo',
      first_name: 'Gabriela',
      last_name: 'Pinto',
      second_last_name: 'Torres',
      accounts: [
        { bank_id: userBankId, status: 'ACTV', type: 'corriente' },
        { bank_id: userBankId, status: 'ACTV', type: 'ahorro' },
        { bank_id: userBankId, status: 'ACTV', type: 'dolares' },
      ],
    },
    {
      id: 'ACTV-ALL-01',
      label: 'ACTV de todas las cuentas',
      document_number: '20000008',
      alias_value: 'actv.todas',
      first_name: 'Hugo',
      last_name: 'Delgado',
      second_last_name: 'Silva',
      accounts: [
        { bank_id: userBankId, status: 'ACTV' },
        { bank_id: o1, status: 'ACTV' },
        { bank_id: o2, status: 'ACTV' },
        { bank_id: o3, status: 'ACTV' },
      ],
    },
    {
      id: 'ACTV-VAR-01',
      label: 'ACTV de varias cuentas menos la del banco del usuario',
      document_number: '20000009',
      alias_value: 'actv.varias',
      first_name: 'Natalia',
      last_name: 'Ortega',
      second_last_name: 'Mendoza',
      accounts: [
        { bank_id: userBankId, status: 'INAC' },
        { bank_id: o1, status: 'ACTV' },
        { bank_id: o2, status: 'ACTV' },
        { bank_id: o3, status: 'INAC' },
      ],
    },
    {
      id: 'ACTV-ALL-BUT-ISSUER-01',
      label: 'ACTV de todas las cuentas menos la cuenta emisora',
      document_number: '20000010',
      alias_value: 'actv.nemis',
      first_name: 'Oscar',
      last_name: 'Fuentes',
      second_last_name: 'Ruiz',
      accounts: [
        { bank_id: userBankId, status: 'INAC' },
        { bank_id: o1, status: 'ACTV' },
        { bank_id: o2, status: 'ACTV' },
        { bank_id: o3, status: 'ACTV' },
      ],
    },
  ];
}

import { getApiBaseUrl, getSimulationConfig } from '../../configService';

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
