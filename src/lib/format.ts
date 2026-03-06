const numberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatEth(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return '—';
  return `${numberFormatter.format(value)} ETH`;
}

export function formatRpl(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return '—';
  return `${numberFormatter.format(value)} RPL`;
}

export function formatPercent(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return '—';
  return `${percentFormatter.format(value)}%`;
}

export function truncateMiddle(value: string | undefined, length = 8): string {
  if (!value) return '—';
  if (value.length <= length * 2) return value;
  return `${value.slice(0, length)}…${value.slice(-length)}`;
}
