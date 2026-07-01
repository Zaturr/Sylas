export const SIMF_ALIAS_STATUS = {
  ACTIVE: 'ACTV',
  INACTIVE: 'INAC',
  PENDING: 'PNDL',
  UNREGISTERED: 'UNRG',
  BLOCKED: 'BLKD',
} as const;

export type SimfAliasStatus =
  (typeof SIMF_ALIAS_STATUS)[keyof typeof SIMF_ALIAS_STATUS];

export type UserModifiableAliasStatus =
  | typeof SIMF_ALIAS_STATUS.ACTIVE
  | typeof SIMF_ALIAS_STATUS.INACTIVE;

export const USER_MODIFIABLE_ALIAS_STATUSES: UserModifiableAliasStatus[] = [
  SIMF_ALIAS_STATUS.ACTIVE,
  SIMF_ALIAS_STATUS.INACTIVE,
];

export const READONLY_ALIAS_STATUSES: SimfAliasStatus[] = [
  SIMF_ALIAS_STATUS.PENDING,
  SIMF_ALIAS_STATUS.UNREGISTERED,
  SIMF_ALIAS_STATUS.BLOCKED,
];

export const ALL_ALIAS_STATUS_OPTIONS: SimfAliasStatus[] = [
  SIMF_ALIAS_STATUS.ACTIVE,
  SIMF_ALIAS_STATUS.INACTIVE,
  SIMF_ALIAS_STATUS.PENDING,
  SIMF_ALIAS_STATUS.UNREGISTERED,
  SIMF_ALIAS_STATUS.BLOCKED,
];

export function isAliasGloballyBlocked(status: string | undefined | null): boolean {
  const normalized = (status ?? '').trim().toUpperCase();
  return normalized === 'DISABLED' || normalized === 'BLKD' || normalized === 'BLOCKED';
}

export function coreAccountStatusToSimf(status: string | undefined | null): SimfAliasStatus {
  switch ((status ?? '').trim().toUpperCase()) {
    case 'ACTIVE':
    case SIMF_ALIAS_STATUS.ACTIVE:
      return SIMF_ALIAS_STATUS.ACTIVE;
    case 'INACTIVE':
    case SIMF_ALIAS_STATUS.INACTIVE:
      return SIMF_ALIAS_STATUS.INACTIVE;
    case 'PNDL':
    case SIMF_ALIAS_STATUS.PENDING:
      return SIMF_ALIAS_STATUS.PENDING;
    case 'BLOCKED':
    case 'BLKD':
      return SIMF_ALIAS_STATUS.BLOCKED;
    default:
      return SIMF_ALIAS_STATUS.INACTIVE;
  }
}

export function isUserModifiableAliasStatus(
  status: SimfAliasStatus | null,
): status is UserModifiableAliasStatus {
  return status === SIMF_ALIAS_STATUS.ACTIVE || status === SIMF_ALIAS_STATUS.INACTIVE;
}

export function getAliasStatusLabel(status: SimfAliasStatus): string {
  switch (status) {
    case SIMF_ALIAS_STATUS.ACTIVE:
      return 'Activo (ACTV)';
    case SIMF_ALIAS_STATUS.INACTIVE:
      return 'Inactivo (INAC)';
    case SIMF_ALIAS_STATUS.PENDING:
      return 'Pendiente de baja (PNDL)';
    case SIMF_ALIAS_STATUS.UNREGISTERED:
      return 'No registrado (UNRG)';
    case SIMF_ALIAS_STATUS.BLOCKED:
      return 'Bloqueado (BLKD)';
    default:
      return status;
  }
}

export function getUserModifiableAliasStatusLabel(
  status: UserModifiableAliasStatus,
): string {
  switch (status) {
    case SIMF_ALIAS_STATUS.ACTIVE:
      return 'Activo';
    case SIMF_ALIAS_STATUS.INACTIVE:
      return 'Inactivo';
    default:
      return status;
  }
}
