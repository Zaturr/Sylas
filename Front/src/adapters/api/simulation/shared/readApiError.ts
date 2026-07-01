export async function readApiError(response: Response, fallback: string): Promise<string> {
  const data = await response.json().catch(() => null);
  if (data && typeof data.error === 'string') {
    return data.error;
  }
  return fallback;
}
