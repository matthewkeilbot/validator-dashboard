import { formatEth, truncateMiddle } from '@/lib/format';
import type { ValidatorRow, ValidatorTotals } from '@/types';

interface ValidatorTableProps {
  rows: ValidatorRow[];
  totals: ValidatorTotals;
  onSelectRow: (row: ValidatorRow) => void;
}

function formatType(type?: ValidatorRow['protocolTag']) {
  if (!type) return 'Unknown';
  if (type === 'native') return 'Native';
  if (type === 'rocketpool') return 'Rocket Pool';
  if (type === 'lido') return 'Lido';
  return 'Unknown';
}

export function ValidatorTable({
  rows,
  totals,
  onSelectRow,
}: ValidatorTableProps) {
  return (
    <div className="overflow-auto rounded-lg border border-zinc-800">
      <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
        <thead className="bg-zinc-900 text-zinc-300">
          <tr>
            {[
              'Index',
              'Withdrawals address',
              'Type',
              'Status',
              'Current balance',
              'Effective balance',
              'Validator rewards',
              'Outflows',
            ].map((header) => (
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
          {rows.map((row) => (
            <tr
              key={row.index}
              className="cursor-pointer even:bg-zinc-950/60 hover:bg-zinc-800/50"
              onClick={() => onSelectRow(row)}
            >
              <td className="border-b border-zinc-900 px-3 py-2 text-amber-300">
                {row.index}
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
        <tfoot className="bg-zinc-900/70">
          <tr className="font-semibold text-zinc-100">
            <td className="px-3 py-2">TOTAL ({totals.count})</td>
            <td className="px-3 py-2">—</td>
            <td className="px-3 py-2">—</td>
            <td className="px-3 py-2">—</td>
            <td className="px-3 py-2">{formatEth(totals.currentBalanceEth)}</td>
            <td className="px-3 py-2">
              {formatEth(totals.effectiveBalanceEth)}
            </td>
            <td className="px-3 py-2 text-amber-400">
              {formatEth(totals.rewardsEarnedEth)}
            </td>
            <td className="px-3 py-2">{formatEth(totals.outflowsEth)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
