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
      for (let i = lower; i <= upper; i += 1) {
        result.add(i);
      }
      continue;
    }

    const parsed = Number.parseInt(token, 10);
    if (Number.isInteger(parsed) && parsed >= 0) {
      result.add(parsed);
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
