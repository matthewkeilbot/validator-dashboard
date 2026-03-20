import { ethers } from 'ethers';
import type { ValidatorRow, ValidatorTotals, YieldMode } from '@/types';
import { getProvider } from './rpc-service';

const RPL_TOKEN_MAINNET = '0xD33526068D116cE69F19A9ee46F0bd304F21A51f';
const ERC20_TRANSFER_TOPIC = ethers.id('Transfer(address,address,uint256)');

function blockWindowForMode(mode: YieldMode): number {
  switch (mode) {
    case 'daily':
      return 7200;
    case 'monthly':
      return 216000;
    case 'annual':
    case 'lifetime':
      return 2628000;
  }
}

/**
 * Estimate RPL rewards received by an operator address within a rolling window.
 */
export async function estimateRplRewards(
  elRpc: string,
  operatorWithdrawalAddress: string | undefined,
  mode: YieldMode,
): Promise<number> {
  if (!operatorWithdrawalAddress) return 0;

  const provider = getProvider(elRpc);
  const nowBlock = await provider.getBlockNumber();
  const blockWindow = blockWindowForMode(mode);
  const fromBlock = Math.max(0, nowBlock - blockWindow);

  try {
    const inflowLogs = await provider.getLogs({
      fromBlock,
      toBlock: nowBlock,
      address: RPL_TOKEN_MAINNET,
      topics: [
        ERC20_TRANSFER_TOPIC,
        null,
        ethers.zeroPadValue(operatorWithdrawalAddress, 32),
      ],
    });

    let total = 0n;
    for (const log of inflowLogs) {
      total += BigInt(log.data);
    }

    return Number(ethers.formatUnits(total, 18));
  } catch {
    return 0;
  }
}

/**
 * Get the ETH balance of an address (used for inflow estimation).
 */
export async function getAddressBalance(
  elRpc: string,
  address: string,
): Promise<number> {
  try {
    const provider = getProvider(elRpc);
    const balance = await provider.getBalance(address);
    return Number(ethers.formatEther(balance));
  } catch {
    return 0;
  }
}

/**
 * Calculate yield percentage for a validator based on the selected mode.
 */
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

/**
 * Aggregate totals across all validator rows.
 */
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
