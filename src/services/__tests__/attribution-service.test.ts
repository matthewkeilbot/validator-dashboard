import { describe, expect, it } from 'vitest';
import { withdrawalCredentialsToAddress } from '../attribution-service';

describe('withdrawalCredentialsToAddress', () => {
  it('returns undefined for undefined input', () => {
    expect(withdrawalCredentialsToAddress(undefined)).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(withdrawalCredentialsToAddress('')).toBeUndefined();
  });

  it('returns undefined for BLS credentials (0x00 prefix)', () => {
    const bls =
      '0x00000000000000000000000000000000000000000000000000000000deadbeef';
    expect(withdrawalCredentialsToAddress(bls)).toBeUndefined();
  });

  it('extracts address from 0x01 credentials', () => {
    // 0x01 + 11 bytes padding + 20 byte address
    const addr = '0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1';
    const credentials =
      '0x010000000000000000000000889edc2edab5f40e902b864ad4d7ade8e412f9b1';
    const result = withdrawalCredentialsToAddress(credentials);
    expect(result?.toLowerCase()).toBe(addr.toLowerCase());
  });

  it('returns undefined for credentials shorter than 42 chars', () => {
    expect(withdrawalCredentialsToAddress('0x01')).toBeUndefined();
  });

  it('returns undefined for non-0x prefix', () => {
    expect(
      withdrawalCredentialsToAddress(
        '01000000000000000000000000889edc2edab5f40e902b864ad4d7ade8e412f9b1',
      ),
    ).toBeUndefined();
  });
});
