import { formatEth, truncateMiddle } from '@/lib/format';
import type {
  ValidatorLoadState,
  ValidatorRow,
  ValidatorTotals,
} from '@/types';

interface ValidatorTableProps {
  rows: ValidatorRow[];
  totals: ValidatorTotals;
  onSelectRow: (row: ValidatorRow) => void;
  loading?: boolean;
  loadStates?: Record<number, ValidatorLoadState>;
}

const HEADERS = [
  'Index',
  'Withdrawals address',
  'Type',
  'Status',
  'Current balance',
  'Effective balance',
  'Validator rewards',
  'Outflows',
] as const;

function formatType(type?: ValidatorRow['protocolTag']) {
  if (!type) return 'Unknown';
  if (type === 'native') return 'Native';
  if (type === 'rocketpool') return 'Rocket Pool';
  if (type === 'lido') return 'Lido';
  return 'Unknown';
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {HEADERS.map((header) => (
        <td key={header} className="border-b border-zinc-900 px-3 py-2">
          <div className="h-4 w-20 rounded bg-zinc-800" />
        </td>
      ))}
    </tr>
  );
}

function StatusIndicator({ state }: { state?: ValidatorLoadState }) {
  if (!state || state.status === 'loaded') return null;
  if (state.status === 'loading')
    return <span className="ml-1 text-xs text-zinc-500">⏳</span>;
  if (state.status === 'error')
    return (
      <span className="ml-1 text-xs text-red-400" title={state.error}>
        ❌
      </span>
    );
  return null;
}

export function ValidatorTable({
  rows,
  totals,
  onSelectRow,
  loading = false,
  loadStates = {},
}: ValidatorTableProps) {
  return (
    <div className="overflow-auto rounded-lg border border-zinc-800">
      <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
        <thead className="bg-zinc-900 text-zinc-300">
          <tr>
            {HEADERS.map((header) => (
              <th
                key={header}
                className="border-b border-zinc-800 px-3 py-2 font-medium"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && rows.length === 0
            ? Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders never reorder
                <SkeletonRow key={i} />
              ))
            : rows.map((row) => (
                <tr
                  key={row.index}
                  className="cursor-pointer even:bg-zinc-950/60 hover:bg-zinc-800/50"
                  onClick={() => onSelectRow(row)}
                >
                  <td className="border-b border-zinc-900 px-3 py-2 text-amber-300">
                    {row.index}
                    <StatusIndicator state={loadStates[row.index]} />
                  </td>
                  <td className="border-b border-zinc-900 px-3 py-2">
                    {truncateMiddle(row.withdrawalAddress, 8)}
                  </td>
                  <td className="border-b border-zinc-900 px-3 py-2">
                    {formatType(row.protocolTag)}
                  </td>
                  <td className="border-b border-zinc-900 px-3 py-2">
                    {row.status ?? '—'}
                  </td>
                  <td className="border-b border-zinc-900 px-3 py-2">
                    {formatEth(row.currentBalanceEth)}
                  </td>
                  <td className="border-b border-zinc-900 px-3 py-2">
                    {formatEth(row.effectiveBalanceEth)}
                  </td>
                  <td className="border-b border-zinc-900 px-3 py-2 text-amber-400">
                    {formatEth(row.rewardsEarnedEth)}
                  </td>
                  <td className="border-b border-zinc-900 px-3 py-2">
                    {formatEth(row.outflowsEth)}
                  </td>
                </tr>
              ))}
        </tbody>
        {rows.length > 0 ? (
          <tfoot className="bg-zinc-900/70">
            <tr className="font-semibold text-zinc-100">
              <td className="px-3 py-2">
                TOTAL ({totals.count})
                {loading ? (
                  <span className="ml-2 text-xs font-normal text-zinc-500">
                    loading more…
                  </span>
                ) : null}
              </td>
              <td className="px-3 py-2">—</td>
              <td className="px-3 py-2">—</td>
              <td className="px-3 py-2">—</td>
              <td className="px-3 py-2">
                {formatEth(totals.currentBalanceEth)}
              </td>
              <td className="px-3 py-2">
                {formatEth(totals.effectiveBalanceEth)}
              </td>
              <td className="px-3 py-2 text-amber-400">
                {formatEth(totals.rewardsEarnedEth)}
              </td>
              <td className="px-3 py-2">{formatEth(totals.outflowsEth)}</td>
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
