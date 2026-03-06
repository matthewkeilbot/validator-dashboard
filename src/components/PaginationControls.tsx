import { Button } from '@/components/ui/button';

interface PaginationControlsProps {
  page: number;
  totalRows: number;
  pageSize: number;
  setPage: (page: number) => void;
}

export function PaginationControls({
  page,
  totalRows,
  pageSize,
  setPage,
}: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm">
      <span className="text-zinc-400">
        Page {page} of {totalPages} ({totalRows} validators)
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
