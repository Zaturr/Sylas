import { getApiBaseUrl, getPublicOrigin } from '../../../../configService';

export function getSimfBaseUrl(): string {
  try {
    return `${new URL(getApiBaseUrl()).origin}/simf/bdca/v1`;
  } catch {
    return `${getPublicOrigin()}/simf/bdca/v1`;
  }
}
