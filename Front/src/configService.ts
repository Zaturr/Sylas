export interface SimulationConfig {
  bankCode: string;
  bankName: string;
  processingCenter: string;
  channelPspIbp: string;
  accountSuffixLength: number;
  accountType: string;
  maxAccountGenerationAttempts: number;
}

export interface AppConfig {
  VITE_API_BASE_URL?: string;
  SIMULATION?: SimulationConfig;
}

let runtimeConfig: AppConfig | null = null;

export const loadConfig = async (): Promise<void> => {
  try {
    // Agregamos un timestamp para evitar que el navegador guarde esto en caché
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

export const getApiBaseUrl = (): string => {
  return (
    runtimeConfig?.VITE_API_BASE_URL ??
    import.meta.env.VITE_API_BASE_URL ??
    'http://localhost:8080/api/v1'
  );
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
