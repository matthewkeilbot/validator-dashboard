export const MAX_VALIDATORS = 200;

export interface ParseResult {
  indices: number[];
  capped: boolean;
  requestedCount: number;
}

/**
 * Parse validator input with safety cap.
 * Returns metadata about whether the input was truncated.
 */
export function parseValidatorInputSafe(input: string): ParseResult {
  const all = parseValidatorInput(input);
  return {
    indices: all.slice(0, MAX_VALIDATORS),
    capped: all.length > MAX_VALIDATORS,
    requestedCount: all.length,
  };
}

/**
 * Parse validator index input string (e.g. "1-7,12,20-22") into a sorted
 * unique array of indices. Capped at MAX_VALIDATORS to prevent browser crashes.
 */
export function parseValidatorInput(input: string): number[] {
  if (!input.trim()) return [];

  const result = new Set<number>();

  for (const token of input.split(',').map((part) => part.trim())) {
    if (!token) continue;

    if (token.includes('-')) {
      const [startRaw, endRaw] = token.split('-').map((part) => part.trim());
      const start = Number.parseInt(startRaw, 10);
      const end = Number.parseInt(endRaw, 10);

      if (
        !Number.isInteger(start) ||
        !Number.isInteger(end) ||
        start < 0 ||
        end < 0
      ) {
        continue;
      }

      const lower = Math.min(start, end);
      const upper = Math.max(start, end);
      // Safety: cap expansion to prevent massive arrays
      const cappedUpper = Math.min(upper, lower + MAX_VALIDATORS);
      for (let i = lower; i <= cappedUpper; i += 1) {
        result.add(i);
        if (result.size >= MAX_VALIDATORS) break;
      }
      if (result.size >= MAX_VALIDATORS) break;
      continue;
    }

    const parsed = Number.parseInt(token, 10);
    if (Number.isInteger(parsed) && parsed >= 0) {
      result.add(parsed);
      if (result.size >= MAX_VALIDATORS) break;
    }
  }

  return [...result].sort((a, b) => a - b);
}

export function compressValidatorRanges(indices: number[]): string {
  const sorted = [...new Set(indices)].sort((a, b) => a - b);
  if (sorted.length === 0) return '';

  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i];
    if (current === end + 1) {
      end = current;
      continue;
    }

    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    start = current;
    end = current;
  }

  ranges.push(start === end ? `${start}` : `${start}-${end}`);
  return ranges.join(',');
}
