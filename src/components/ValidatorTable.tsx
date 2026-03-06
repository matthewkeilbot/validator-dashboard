import {
  formatEth,
  formatPercent,
  formatRpl,
  truncateMiddle,
} from '@/lib/format';
import { calculateYieldPercent } from '@/lib/yield';
import type { ValidatorRow, ValidatorTotals, YieldMode } from '@/types';

interface ValidatorTableProps {
  rows: ValidatorRow[];
  totals: ValidatorTotals;
  yieldMode: YieldMode;
}

export function ValidatorTable({
  rows,
  totals,
  yieldMode,
}: ValidatorTableProps) {
  return (
    <div className="overflow-auto rounded-lg border border-zinc-800">
      <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
        <thead className="bg-zinc-900 text-zinc-300">
          <tr>
            {[
              'Index',
              'Pubkey',
              'Withdrawal',
              'Status',
              'Effective',
              'Current',
              'Rewards',
              'Inflows',
              'Outflows',
              `Yield (${yieldMode})`,
              'Rocket Pool RPL',
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
            <tr key={row.index} className="even:bg-zinc-950/60">
              <td className="border-b border-zinc-900 px-3 py-2">
                {row.index}
              </td>
              <td className="border-b border-zinc-900 px-3 py-2">
                {truncateMiddle(row.pubkey, 10)}
              </td>
              <td className="border-b border-zinc-900 px-3 py-2">
                {truncateMiddle(row.withdrawalAddress, 8)}
              </td>
              <td className="border-b border-zinc-900 px-3 py-2">
                {row.status ?? '—'}
              </td>
              <td className="border-b border-zinc-900 px-3 py-2">
                {formatEth(row.effectiveBalanceEth)}
              </td>
              <td className="border-b border-zinc-900 px-3 py-2">
                {formatEth(row.currentBalanceEth)}
              </td>
              <td className="border-b border-zinc-900 px-3 py-2 text-amber-400">
                {formatEth(row.rewardsEarnedEth)}
              </td>
              <td className="border-b border-zinc-900 px-3 py-2">
                {formatEth(row.inflowsEth)}
              </td>
              <td className="border-b border-zinc-900 px-3 py-2">
                {formatEth(row.outflowsEth)}
              </td>
              <td className="border-b border-zinc-900 px-3 py-2">
                {formatPercent(calculateYieldPercent(row, yieldMode))}
              </td>
              <td className="border-b border-zinc-900 px-3 py-2">
                {formatRpl(row.rocketPoolRplRewards)}
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
            <td className="px-3 py-2">{formatEth(totals.principalEth)}</td>
            <td className="px-3 py-2">{formatEth(totals.currentBalanceEth)}</td>
            <td className="px-3 py-2 text-amber-400">
              {formatEth(totals.rewardsEarnedEth)}
            </td>
            <td className="px-3 py-2">{formatEth(totals.inflowsEth)}</td>
            <td className="px-3 py-2">{formatEth(totals.outflowsEth)}</td>
            <td className="px-3 py-2">
              {formatPercent(
                (totals.rewardsEarnedEth / Math.max(totals.principalEth, 1)) *
                  100,
              )}
            </td>
            <td className="px-3 py-2">
              {formatRpl(totals.rocketPoolRplRewards)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
