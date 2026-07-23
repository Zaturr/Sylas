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
  /**
   * URL pública del simulador (ej. http://192.168.120.103:8080).
   * Opcional: si no se define, el navegador usa el mismo host con el que abrió la UI.
   */
  PUBLIC_BASE_URL?: string;
  /** Base de la API REST. Puede ser relativa (/api/v1) o absoluta. */
  VITE_API_BASE_URL?: string;
  SIMULATION?: SimulationConfig;
}

let runtimeConfig: AppConfig | null = null;

export const loadConfig = async (): Promise<void> => {
  try {
    const response = await fetch(`/config.json?t=${new Date().getTime()}`);
    if (response.ok) {
      runtimeConfig = await response.json();
      console.log('Configuración de entorno cargada correctamente:', runtimeConfig);
    } else {
      console.warn('No se encontró config.json, usando variables de entorno o defaults.');
    }
  } catch (error) {
    console.warn('Error cargando config.json, usando variables de entorno o defaults.', error);
  }
};

function isLocalHost(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  return normalized === 'localhost' || normalized === '127.0.0.1' || normalized === '::1';
}

/** Origen HTTP del simulador (protocolo + host + puerto). */
export const getPublicOrigin = (): string => {
  const publicBase = runtimeConfig?.PUBLIC_BASE_URL?.trim();
  if (publicBase) {
    try {
      return new URL(publicBase).origin;
    } catch {
      console.warn('PUBLIC_BASE_URL inválida:', publicBase);
    }
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  const configured =
    runtimeConfig?.VITE_API_BASE_URL ?? import.meta.env.VITE_API_BASE_URL;
  if (configured && !configured.startsWith('/')) {
    try {
      return new URL(configured).origin;
    } catch {
      // continúa con fallback
    }
  }

  return 'http://localhost:8080';
};

export const getApiBaseUrl = (): string => {
  const configured =
    runtimeConfig?.VITE_API_BASE_URL ??
    import.meta.env.VITE_API_BASE_URL ??
    '/api/v1';

  if (configured.startsWith('/')) {
    return `${getPublicOrigin()}${configured}`;
  }

  try {
    const url = new URL(configured);
    if (typeof window !== 'undefined' && isLocalHost(url.hostname)) {
      return `${getPublicOrigin()}${url.pathname}`;
    }
    return configured;
  } catch {
    return `${getPublicOrigin()}/api/v1`;
  }
};

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
