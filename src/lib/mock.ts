import type { ValidatorRow, YieldMode } from '@/types';

function seeded(index: number, offset: number) {
  const x = Math.sin(index * 12.9898 + offset * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function rewardForMode(index: number, mode: YieldMode): number {
  const base = 0.9 + seeded(index, 1) * 0.8;
  if (mode === 'daily') return base / 365;
  if (mode === 'monthly') return base / 12;
  if (mode === 'annual') return base;
  return 0.5 + seeded(index, 2) * 4.5;
}

export function loadMockValidators(
  indices: number[],
  mode: YieldMode,
): ValidatorRow[] {
  return indices.map((index) => {
    const principalEth = 32;
    const rewardsEarnedEth = rewardForMode(index, mode);
    const currentBalanceEth = principalEth + rewardsEarnedEth;
    const inflowsEth = rewardsEarnedEth * (1.5 + seeded(index, 3));
    const outflowsEth = inflowsEth * seeded(index, 4) * 0.75;
    const rocketPoolRplRewards =
      seeded(index, 5) > 0.6 ? seeded(index, 6) * 12 : 0;

    return {
      index,
      pubkey: `0x${index.toString(16).padStart(6, '0')}aabbccddeeff00112233445566778899aabbccddeeff0011223344556677`,
      withdrawalAddress: `0x${(index * 9973).toString(16).padStart(40, '0').slice(0, 40)}`,
      status:
        seeded(index, 7) > 0.08 ? 'active_ongoing' : 'pending_initialized',
      effectiveBalanceEth: 32,
      principalEth,
      currentBalanceEth,
      rewardsEarnedEth,
      inflowsEth,
      outflowsEth,
      rocketPoolRplRewards,
      protocolTag: rocketPoolRplRewards > 0 ? 'rocketpool' : 'unknown',
      notes: 'Mock data mode enabled for UI preview.',
    };
  });
}
