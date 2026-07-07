import type { ReactNode } from 'react';

/** Convierte **texto** en <strong>texto</strong> dentro de strings del catálogo. */
export function formatRuleText(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
