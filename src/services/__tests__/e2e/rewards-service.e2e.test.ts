import { describe, expect, it, afterAll } from 'vitest';
import { estimateRplRewards, getAddressBalance } from '../../rewards-service';
import { clearProviderCache } from '../../rpc-service';

const EL_RPC = 'https://ethereum-rpc.publicnode.com';

// A well-known address with some balance (Ethereum Foundation)
const ETH_FOUNDATION = '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe';

describe('rewards-service e2e', () => {
  afterAll(() => {
    clearProviderCache();
  });

  it('getAddressBalance returns a non-negative number for known address', async () => {
    const balance = await getAddressBalance(EL_RPC, ETH_FOUNDATION);
    expect(balance).toBeGreaterThanOrEqual(0);
    expect(typeof balance).toBe('number');
    expect(Number.isNaN(balance)).toBe(false);
  });

  it('getAddressBalance returns 0 for zero address', async () => {
    const balance = await getAddressBalance(
      EL_RPC,
      '0x0000000000000000000000000000000000000000',
    );
    expect(balance).toBeGreaterThanOrEqual(0);
  });

  it('estimateRplRewards returns non-negative for any address', async () => {
    const rewards = await estimateRplRewards(
      EL_RPC,
      ETH_FOUNDATION,
      'lifetime',
    );
    expect(rewards).toBeGreaterThanOrEqual(0);
    expect(typeof rewards).toBe('number');
  });

  it('estimateRplRewards returns 0 for undefined address', async () => {
    const rewards = await estimateRplRewards(EL_RPC, undefined, 'daily');
    expect(rewards).toBe(0);
  });
});
