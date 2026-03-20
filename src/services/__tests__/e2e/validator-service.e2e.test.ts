import { describe, expect, it } from 'vitest';
import { fetchValidatorData } from '../../validator-service';

const CL_RPC = 'https://ethereum-beacon-api.publicnode.com';

describe('validator-service e2e', () => {
  it('fetches genesis validator (index 0) from mainnet', async () => {
    const data = await fetchValidatorData(CL_RPC, 0);
    expect(data.index).toBe(0);
    expect(data.pubkey).toBeDefined();
    expect(data.pubkey!.startsWith('0x')).toBe(true);
    expect(data.status).toBeDefined();
    expect(data.effectiveBalance).toBeDefined();
    expect(data.balance).toBeDefined();
    // Genesis validator effective balance should be 32 ETH (32000000000 gwei)
    expect(Number(data.effectiveBalance)).toBeGreaterThanOrEqual(32000000000);
  });

  it('fetches a well-known active validator (index 1)', async () => {
    const data = await fetchValidatorData(CL_RPC, 1);
    expect(data.index).toBe(1);
    expect(data.status).toMatch(/active|exited|withdrawal/);
    expect(data.withdrawalCredentials).toBeDefined();
  });

  it('fails gracefully for a non-existent validator', async () => {
    // Validator index way beyond current count
    await expect(
      fetchValidatorData(CL_RPC, 99999999),
    ).rejects.toThrow();
  });
});
