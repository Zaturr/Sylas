export function mapDocumentTypeToSimfScheme(documentType: string): string | null {
  switch (documentType.trim().toUpperCase()) {
    case 'V':
    case 'E':
      return 'SCID';
    case 'J':
    case 'G':
      return 'SRIF';
    case 'P':
      return 'SPAS';
    default:
      return null;
  }
}

export function buildSimfDocumentId(documentType: string, documentNumber: string): string {
  return `${documentType.trim().toUpperCase()}${documentNumber.trim()}`;
}
