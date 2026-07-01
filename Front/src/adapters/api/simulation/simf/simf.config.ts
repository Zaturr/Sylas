import { appConfig } from '../../app.config';

export const SIMF_BASE_URL = `${new URL(appConfig.apiBaseUrl).origin}/simf/bdca/v1`;
