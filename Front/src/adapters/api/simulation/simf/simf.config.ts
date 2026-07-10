import { appConfig } from '../../app.config';

export function getSimfBaseUrl(): string {
  try {
    return `${new URL(appConfig.apiBaseUrl).origin}/simf/bdca/v1`;
  } catch (error) {
    return 'http://localhost:8080/simf/bdca/v1';
  }
}
