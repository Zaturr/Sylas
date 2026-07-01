export type ParsedDocument = {
  documentType: string;
  documentNumber: string;
};

export function parseDocumentInput(value: string): ParsedDocument | null {
  const match = value.trim().match(/^([VEJPG])-?(\d+)$/i);
  if (!match) {
    return null;
  }

  return {
    documentType: match[1].toUpperCase(),
    documentNumber: match[2],
  };
}

export function formatDocumentInput(documentType: string, documentNumber: string): string {
  return `${documentType.toUpperCase()}${documentNumber}`;
}
