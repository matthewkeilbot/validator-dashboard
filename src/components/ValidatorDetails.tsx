import { formatEth, formatPercent, formatRpl } from '@/lib/format';
import { calculateYieldPercent } from '@/services/rewards-service';
import type { ValidatorRow, YieldMode } from '@/types';

interface ValidatorDetailsProps {
  row: ValidatorRow;
  yieldMode: YieldMode;
  onClose: () => void;
  loading?: boolean;
}

function typeLabel(type?: ValidatorRow['protocolTag']) {
  if (!type) return 'Unknown';
  if (type === 'native') return 'Native';
  if (type === 'rocketpool') return 'Rocket Pool';
  if (type === 'lido') return 'Lido';
  return 'Unknown';
}

function InfoLine({
  label,
  value,
  loading = false,
}: {
  label: string;
  value: string;
  loading?: boolean;
}) {
  return (
    <div className="grid gap-1 rounded border border-zinc-800 bg-zinc-900/50 p-3 md:grid-cols-[220px_1fr] md:items-center">
      <div className="text-xs uppercase tracking-wide text-zinc-400">
        {label}
      </div>
      {loading ? (
        <div className="h-4 w-32 animate-pulse rounded bg-zinc-800" />
      ) : (
        <div className="break-all text-sm text-zinc-100">{value || '—'}</div>
      )}
    </div>
  );
}

export function ValidatorDetails({
  row,
  yieldMode,
  onClose,
  loading = false,
}: ValidatorDetailsProps) {
  return (
    <section className="grid gap-3 rounded-lg border border-zinc-700 bg-zinc-950/60 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-amber-300">
          Validator {row.index} details
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
        >
          Close
        </button>
      </div>

      <InfoLine label="Type" value={typeLabel(row.protocolTag)} loading={loading} />
      <InfoLine label="Status" value={row.status ?? '—'} loading={loading} />
      <InfoLine label="Pubkey" value={row.pubkey ?? '—'} loading={loading} />
      <InfoLine
        label="Operator withdrawals address"
        value={row.withdrawalAddress ?? '—'}
        loading={loading}
      />
      <InfoLine
        label="Validator rewards destination"
        value={row.validatorRewardsAddress ?? row.withdrawalAddress ?? '—'}
        loading={loading}
      />
      <InfoLine
        label="Attribution proof path"
        value={row.attributionSource ?? '—'}
        loading={loading}
      />
      <InfoLine
        label="Current balance"
        value={formatEth(row.currentBalanceEth)}
        loading={loading}
      />
      <InfoLine
        label="Effective balance"
        value={formatEth(row.effectiveBalanceEth)}
        loading={loading}
      />
      <InfoLine
        label="Validator rewards"
        value={formatEth(row.rewardsEarnedEth)}
        loading={loading}
      />
      <InfoLine label="Inflows" value={formatEth(row.inflowsEth)} loading={loading} />
      <InfoLine label="Outflows" value={formatEth(row.outflowsEth)} loading={loading} />
      <InfoLine
        label={`Yield (${yieldMode})`}
        value={formatPercent(calculateYieldPercent(row, yieldMode))}
        loading={loading}
      />
      <InfoLine
        label="Rocket Pool RPL rewards"
        value={formatRpl(row.rocketPoolRplRewards)}
        loading={loading}
      />

      {row.notes ? (
        <p className="rounded border border-zinc-800 bg-zinc-900/50 p-3 text-xs text-zinc-300">
          {row.notes}
        </p>
      ) : null}
    </section>
  );
}
