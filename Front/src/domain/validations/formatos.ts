export type SimfTransactionIdConfig = {
  /** Emisor (4) — código CCE del banco/IBP. */
  emisor: string;
  /** Centro de procesamiento (2). */
  processingCenter: string;
  /** Canal-PSP-IBP (4) — código CCE del canal. */
  channelPspIbp: string;
};

export type SimfTransactionIds = {
  msgId: string;
  endToEndId: string;
  creDtTm: string;
};

let sequentialCounter = 0;

function normalizeAlphanumericCode(value: string, length: number): string {
  const trimmed = value.trim().slice(0, length);
  if (trimmed.length >= length) {
    return trimmed;
  }
  return trimmed.padStart(length, '0');
}

function nextSequential(now: Date): string {
  sequentialCounter = (sequentialCounter + 1) % 100_000_000;
  const base = now.getTime() % 100_000_000;
  return String((base + sequentialCounter) % 100_000_000).padStart(8, '0');
}

/** Fecha compacta SIMF: YYYYMMDDhhmmss (14). */
export function formatSimfCompactDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');

  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

/** CreDtTm ISO SIMF: YYYY-MM-DDThh:mm:ss */
export function buildSimfCreDtTm(date: Date = new Date()): string {
  return date.toISOString().slice(0, 19);
}

/** MsgID (28): Emisor(4) + Centro(2) + Fecha(14) + Secuencial(8). */
export function buildSimfMsgId(config: SimfTransactionIdConfig, date: Date = new Date()): string {
  const emisor = normalizeAlphanumericCode(config.emisor, 4);
  const center = normalizeAlphanumericCode(config.processingCenter, 2);

  return `${emisor}${center}${formatSimfCompactDateTime(date)}${nextSequential(date)}`;
}

/** EndToEndId (26): Canal-PSP-IBP(4) + Fecha(14) + Referencia(8). */
export function buildSimfEndToEndId(
  config: SimfTransactionIdConfig,
  date: Date = new Date(),
): string {
  const channel = normalizeAlphanumericCode(config.channelPspIbp, 4);

  return `${channel}${formatSimfCompactDateTime(date)}${nextSequential(date)}`;
}

/** Arma MsgID, EndToEndId y CreDtTm de la misma transacción. */
export function buildSimfTransactionIds(
  config: SimfTransactionIdConfig,
  date: Date = new Date(),
): SimfTransactionIds {
  const compactDateTime = formatSimfCompactDateTime(date);
  const reference = nextSequential(date);
  const emisor = normalizeAlphanumericCode(config.emisor, 4);
  const center = normalizeAlphanumericCode(config.processingCenter, 2);
  const channel = normalizeAlphanumericCode(config.channelPspIbp, 4);

  return {
    msgId: `${emisor}${center}${compactDateTime}${reference}`,
    endToEndId: `${channel}${compactDateTime}${reference}`,
    creDtTm: buildSimfCreDtTm(date),
  };
}
