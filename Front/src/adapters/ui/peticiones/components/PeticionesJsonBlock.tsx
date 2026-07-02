import { useCallback, useState } from 'react';

type PeticionesJsonBlockProps = {
  label: string;
  value: unknown;
  statusLabel?: string;
  statusSuccess?: boolean;
};

function formatJson(value: unknown): string {
  if (value === null || value === undefined) {
    return 'null';
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function PeticionesJsonBlock({
  label,
  value,
  statusLabel,
  statusSuccess = true,
}: PeticionesJsonBlockProps) {
  const [copied, setCopied] = useState(false);
  const formatted = formatJson(value);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }, [formatted]);

  return (
    <div className="peticiones-json-block">
      <div className="peticiones-json-block__header">
        <span className="peticiones-json-block__label">{label}</span>
        <div className="peticiones-json-block__actions">
          {statusLabel && (
            <span
              className={`peticiones-json-block__status${
                statusSuccess
                  ? ' peticiones-json-block__status--success'
                  : ' peticiones-json-block__status--error'
              }`}
            >
              <span className="peticiones-json-block__status-dot" aria-hidden="true" />
              {statusLabel}
            </span>
          )}
          <button
            type="button"
            className="peticiones-json-block__copy"
            aria-label={`Copiar ${label}`}
            title={copied ? 'Copiado' : 'Copiar JSON'}
            onClick={handleCopy}
          >
            {copied ? '✓' : '⧉'}
          </button>
        </div>
      </div>
      <pre className="peticiones-json-block__code">
        <code>{formatted}</code>
      </pre>
    </div>
  );
}
