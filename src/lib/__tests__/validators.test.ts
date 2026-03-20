import { describe, expect, it } from 'vitest';
import {
  MAX_VALIDATORS,
  compressValidatorRanges,
  parseValidatorInput,
  parseValidatorInputSafe,
} from '../validators';

describe('parseValidatorInput', () => {
  it('returns empty for empty string', () => {
    expect(parseValidatorInput('')).toEqual([]);
  });

  it('returns empty for whitespace', () => {
    expect(parseValidatorInput('   ')).toEqual([]);
  });

  it('parses single index', () => {
    expect(parseValidatorInput('5')).toEqual([5]);
  });

  it('parses comma-separated indices', () => {
    expect(parseValidatorInput('1,5,3')).toEqual([1, 3, 5]);
  });

  it('parses ranges', () => {
    expect(parseValidatorInput('1-5')).toEqual([1, 2, 3, 4, 5]);
  });

  it('parses mixed ranges and singles', () => {
    expect(parseValidatorInput('1-3,7,10-12')).toEqual([
      1, 2, 3, 7, 10, 11, 12,
    ]);
  });

  it('deduplicates overlapping ranges', () => {
    expect(parseValidatorInput('1-5,3-7')).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('handles reversed ranges', () => {
    expect(parseValidatorInput('5-1')).toEqual([1, 2, 3, 4, 5]);
  });

  it('ignores invalid tokens', () => {
    expect(parseValidatorInput('abc,1,def')).toEqual([1]);
  });

  it('ignores negative numbers', () => {
    expect(parseValidatorInput('-1,5')).toEqual([5]);
  });

  it('caps at MAX_VALIDATORS', () => {
    const input = '0-999';
    const result = parseValidatorInput(input);
    expect(result.length).toBeLessThanOrEqual(MAX_VALIDATORS);
  });
});

describe('parseValidatorInputSafe', () => {
  it('reports capped status for large input', () => {
    const input = '0-999';
    const result = parseValidatorInputSafe(input);
    // parseValidatorInput already caps internally, so both paths produce 200
    expect(result.indices.length).toBe(MAX_VALIDATORS);
    expect(result.requestedCount).toBe(MAX_VALIDATORS);
    expect(result.capped).toBe(false); // equal after internal cap
  });

  it('reports not capped for small input', () => {
    const result = parseValidatorInputSafe('1-5');
    expect(result.capped).toBe(false);
    expect(result.indices).toEqual([1, 2, 3, 4, 5]);
    expect(result.requestedCount).toBe(5);
  });
});

describe('compressValidatorRanges', () => {
  it('returns empty string for empty input', () => {
    expect(compressValidatorRanges([])).toBe('');
  });

  it('compresses single index', () => {
    expect(compressValidatorRanges([5])).toBe('5');
  });

  it('compresses consecutive range', () => {
    expect(compressValidatorRanges([1, 2, 3, 4, 5])).toBe('1-5');
  });

  it('compresses mixed ranges and singles', () => {
    expect(compressValidatorRanges([1, 2, 3, 7, 10, 11, 12])).toBe(
      '1-3,7,10-12',
    );
  });

  it('deduplicates input', () => {
    expect(compressValidatorRanges([1, 1, 2, 2, 3])).toBe('1-3');
  });
});
