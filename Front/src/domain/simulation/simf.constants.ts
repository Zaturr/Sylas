export const SIMF_REASON_NOT_FOUND = 'BE23';

export const isSimfNotFoundReason = (reason: string): boolean =>
  reason.toUpperCase() === SIMF_REASON_NOT_FOUND;
