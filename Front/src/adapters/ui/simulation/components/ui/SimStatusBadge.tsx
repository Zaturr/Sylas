import type { SimfAliasStatus } from '../../../../../domain/simulation/aliasStatus';
import { SIMF_ALIAS_STATUS } from '../../../../../domain/simulation/aliasStatus';

type SimStatusBadgeProps = {
  status: SimfAliasStatus | null;
  className?: string;
};

const badgeClass: Record<SimfAliasStatus, string> = {
  [SIMF_ALIAS_STATUS.ACTIVE]: 'sim-status-badge--actv',
  [SIMF_ALIAS_STATUS.INACTIVE]: 'sim-status-badge--inac',
  [SIMF_ALIAS_STATUS.PENDING]: 'sim-status-badge--pndl',
  [SIMF_ALIAS_STATUS.UNREGISTERED]: 'sim-status-badge--unrg',
  [SIMF_ALIAS_STATUS.BLOCKED]: 'sim-status-badge--blkd',
};

export function SimStatusBadge({ status, className = '' }: SimStatusBadgeProps) {
  if (!status) {
    return null;
  }

  return (
    <span className={`sim-status-badge ${badgeClass[status]} ${className}`.trim()}>
      {status}
    </span>
  );
}
