export interface SimulationConfig {
  bankCode: string;
  bankName: string;
  processingCenter: string;
  channelPspIbp: string;
  accountSuffixLength: number;
  accountType: string;
  maxAccountGenerationAttempts: number;
  legalEntityAccounts?: {
    ctsCorrientes: number;
    ctsAhorro: number;
    ctsDivisa: number;
  };
}

export interface AppConfig {
  /** Puerto del backend. Lo usa Go al arrancar; el front no lo lee para escuchar. */
  PORT?: string;
  /** URL base del API admin (servicio 3). Ej. valor en config.json, no hardcodeado en código. */
  VITE_API_BASE_URL?: string;
  /** URL base del puente SIMF (servicio 2). Ej. valor en config.json, no hardcodeado en código. */
  VITE_SIMF_BASE_URL?: string;
  SIMULATION?: SimulationConfig;
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

let runtimeConfig: AppConfig | null = null;
let configLoaded = false;

type RequiredConfigKey = 'VITE_API_BASE_URL' | 'VITE_SIMF_BASE_URL';

const REQUIRED_URL_KEYS: readonly RequiredConfigKey[] = [
  'VITE_API_BASE_URL',
  'VITE_SIMF_BASE_URL',
] as const;

const CONFIG_LABELS: Record<RequiredConfigKey, string> = {
  VITE_API_BASE_URL: 'URL del API admin (core Sylas)',
  VITE_SIMF_BASE_URL: 'URL del puente SIMF (SIMF-Alias)',
};

function readConfigValue(key: RequiredConfigKey): string | undefined {
  const fromFile = runtimeConfig?.[key];
  if (typeof fromFile === 'string' && fromFile.trim() !== '') {
    return fromFile.trim();
  }

  const fromEnv = import.meta.env[key];
  if (typeof fromEnv === 'string' && fromEnv.trim() !== '') {
    return fromEnv.trim();
  }

  return undefined;
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function requireConfigUrl(key: RequiredConfigKey): string {
  const value = readConfigValue(key);
  if (!value) {
    throw new ConfigError(
      `Falta "${key}" (${CONFIG_LABELS[key]}). ` +
        'Defínela en config.json con host y puerto completos.',
    );
  }
  return normalizeBaseUrl(value);
}

function validateRequiredUrls(): void {
  for (const key of REQUIRED_URL_KEYS) {
    requireConfigUrl(key);
  }
}

export const isConfigLoaded = (): boolean => configLoaded;

export const loadConfig = async (): Promise<void> => {
  try {
    const response = await fetch(`/config.json?t=${new Date().getTime()}`);
    if (response.ok) {
      runtimeConfig = (await response.json()) as AppConfig;
      console.log('Configuración de entorno cargada correctamente:', runtimeConfig);
    } else {
      console.warn(
        `No se encontró config.json (HTTP ${response.status}). ` +
          'Se intentará usar variables VITE_* del entorno de build.',
      );
    }
  } catch (error) {
    console.warn('Error cargando config.json. Se intentará usar variables VITE_* del entorno.', error);
  }

  validateRequiredUrls();
  configLoaded = true;
};

export const getApiBaseUrl = (): string => requireConfigUrl('VITE_API_BASE_URL');

export const getSimfBaseUrl = (): string => requireConfigUrl('VITE_SIMF_BASE_URL');

export const getSimulationConfig = (): SimulationConfig => {
  const defaultSimulationConfig: SimulationConfig = {
    bankCode: '0172',
    bankName: 'Bancamiga',
    processingCenter: '01',
    channelPspIbp: '0172',
    accountSuffixLength: 16,
    accountType: 'Cta. Corriente',
    maxAccountGenerationAttempts: 3,
  };

  return runtimeConfig?.SIMULATION ?? defaultSimulationConfig;
};
