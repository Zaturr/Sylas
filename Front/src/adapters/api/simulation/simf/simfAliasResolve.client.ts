import type { SimfTraceSessionKey } from '../../../../domain/peticiones';
import type { SimfHttpClient } from '../../peticiones/simfHttpClient';
import { getSimfBaseUrl } from './simf.config';
import {
  buildSimfDocumentId,
  mapDocumentTypeToSimfScheme,
} from './simfDocumentScheme.mapper';

export function createResolveAliasViaSimf(simfHttpClient: SimfHttpClient) {
  return async function resolveAliasViaSimf(
    documentType: string,
    documentNumber: string,
    bankCode: string,
    sessionKey: SimfTraceSessionKey,
    signal?: AbortSignal,
  ): Promise<{ ok: boolean; data: unknown }> {
    const scheme = mapDocumentTypeToSimfScheme(documentType);
    if (!scheme) {
      return { ok: false, data: null };
    }

    const documentId = buildSimfDocumentId(documentType, documentNumber);
    const url = `${getSimfBaseUrl()}/identities/${scheme}/${encodeURIComponent(documentId)}/alias/${bankCode}`;

    const result = await simfHttpClient({
      method: 'GET',
      url,
      sessionKey,
      signal,
      recordTrace: true,
    });

    return {
      ok: result.ok,
      data: result.data,
    };
  };
}
