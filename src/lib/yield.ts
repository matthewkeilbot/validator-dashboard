import type { ValidatorRow, ValidatorTotals, YieldMode } from '@/types';

export function calculateYieldPercent(
  row: ValidatorRow,
  mode: YieldMode,
): number {
  if (row.principalEth <= 0) return 0;

  if (mode === 'lifetime') {
    return (row.rewardsEarnedEth / row.principalEth) * 100;
  }

  const annualized = (row.rewardsEarnedEth / row.principalEth) * 100;
  if (mode === 'annual') return annualized;
  if (mode === 'monthly') return annualized / 12;
  return annualized / 365;
}

export function aggregateTotals(rows: ValidatorRow[]): ValidatorTotals {
  return rows.reduce<ValidatorTotals>(
    (acc, row) => {
      acc.count += 1;
      acc.principalEth += row.principalEth;
      acc.currentBalanceEth += row.currentBalanceEth;
      acc.effectiveBalanceEth += row.effectiveBalanceEth;
      acc.rewardsEarnedEth += row.rewardsEarnedEth;
      acc.inflowsEth += row.inflowsEth;
      acc.outflowsEth += row.outflowsEth;
      acc.rocketPoolRplRewards += row.rocketPoolRplRewards ?? 0;
      return acc;
    },
    {
      count: 0,
      principalEth: 0,
      effectiveBalanceEth: 0,
      currentBalanceEth: 0,
      rewardsEarnedEth: 0,
      inflowsEth: 0,
      outflowsEth: 0,
      rocketPoolRplRewards: 0,
    },
  );
}
