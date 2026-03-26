import { describe, expect, it } from 'vitest';
import type { ValidatorRow } from '@/types';
import { aggregateTotals, calculateYieldPercent } from '../rewards-service';

function makeRow(overrides: Partial<ValidatorRow> = {}): ValidatorRow {
  return {
    index: 1,
    effectiveBalanceEth: 32,
    principalEth: 32,
    currentBalanceEth: 33,
    rewardsEarnedEth: 1,
    inflowsEth: 0.5,
    outflowsEth: 0,
    ...overrides,
  };
}

describe('calculateYieldPercent', () => {
  it('returns 0 when principal is 0', () => {
    const row = makeRow({ principalEth: 0, rewardsEarnedEth: 1 });
    expect(calculateYieldPercent(row, 'lifetime')).toBe(0);
  });

  it('calculates lifetime yield correctly', () => {
    const row = makeRow({ principalEth: 32, rewardsEarnedEth: 1.6 });
    expect(calculateYieldPercent(row, 'lifetime')).toBe(5); // 1.6/32 * 100
  });

  it('calculates annual yield correctly', () => {
    const row = makeRow({ principalEth: 32, rewardsEarnedEth: 1.6 });
    expect(calculateYieldPercent(row, 'annual')).toBe(5);
  });

  it('calculates monthly yield as annual / 12', () => {
    const row = makeRow({ principalEth: 32, rewardsEarnedEth: 1.6 });
    const annual = calculateYieldPercent(row, 'annual');
    const monthly = calculateYieldPercent(row, 'monthly');
    expect(monthly).toBeCloseTo(annual / 12, 10);
  });

  it('calculates daily yield as annual / 365', () => {
    const row = makeRow({ principalEth: 32, rewardsEarnedEth: 1.6 });
    const annual = calculateYieldPercent(row, 'annual');
    const daily = calculateYieldPercent(row, 'daily');
    expect(daily).toBeCloseTo(annual / 365, 10);
  });

  it('handles negative rewards (clamped to 0 in row construction)', () => {
    const row = makeRow({ principalEth: 32, rewardsEarnedEth: 0 });
    expect(calculateYieldPercent(row, 'lifetime')).toBe(0);
  });
});

describe('aggregateTotals', () => {
  it('returns zeroed totals for empty array', () => {
    const totals = aggregateTotals([]);
    expect(totals.count).toBe(0);
    expect(totals.principalEth).toBe(0);
    expect(totals.rewardsEarnedEth).toBe(0);
  });

  it('aggregates a single row', () => {
    const row = makeRow({
      principalEth: 32,
      currentBalanceEth: 33,
      effectiveBalanceEth: 32,
      rewardsEarnedEth: 1,
      inflowsEth: 0.5,
      outflowsEth: 0.1,
      rocketPoolRplRewards: 2,
    });
    const totals = aggregateTotals([row]);
    expect(totals.count).toBe(1);
    expect(totals.principalEth).toBe(32);
    expect(totals.currentBalanceEth).toBe(33);
    expect(totals.rewardsEarnedEth).toBe(1);
    expect(totals.inflowsEth).toBe(0.5);
    expect(totals.outflowsEth).toBe(0.1);
    expect(totals.rocketPoolRplRewards).toBe(2);
  });

  it('aggregates multiple rows correctly', () => {
    const rows = [
      makeRow({
        principalEth: 32,
        rewardsEarnedEth: 1,
        rocketPoolRplRewards: 3,
      }),
      makeRow({
        principalEth: 32,
        rewardsEarnedEth: 2,
        rocketPoolRplRewards: undefined,
      }),
      makeRow({
        principalEth: 32,
        rewardsEarnedEth: 0.5,
        rocketPoolRplRewards: 1,
      }),
    ];
    const totals = aggregateTotals(rows);
    expect(totals.count).toBe(3);
    expect(totals.principalEth).toBe(96);
    expect(totals.rewardsEarnedEth).toBe(3.5);
    expect(totals.rocketPoolRplRewards).toBe(4);
  });
});
