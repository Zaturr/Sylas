export const appConfig = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ?? 'http://192.168.120.101:8080/api/v1',

  simulation: {
    bankCode: '0172',
    bankName: 'Bancamiga',
    processingCenter: '01',
    channelPspIbp: '0172',
    accountSuffixLength: 16,
    accountType: 'Cta. Corriente',
    maxAccountGenerationAttempts: 8,
  },
} as const;
