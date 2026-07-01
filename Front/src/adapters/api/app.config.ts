export const appConfig = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',

  simulation: {
    bankCode: '0172',
    accountSuffixLength: 16,
    accountType: 'Cta. Corriente',
    maxAccountGenerationAttempts: 8,
  },
} as const;
