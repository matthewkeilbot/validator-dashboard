import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { YieldMode } from '@/types';

interface ControlsPanelProps {
  validatorInput: string;
  setValidatorInput: (value: string) => void;
  elRpc: string;
  setElRpc: (value: string) => void;
  clRpc: string;
  setClRpc: (value: string) => void;
  yieldMode: YieldMode;
  setYieldMode: (value: YieldMode) => void;
  pageSize: number;
  setPageSize: (value: number) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function ControlsPanel(props: ControlsPanelProps) {
  return (
    <section className="grid gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="validatorInput"
            className="mb-1 block text-xs text-zinc-400"
          >
            Validator indices (single + ranges)
          </label>
          <Input
            id="validatorInput"
            value={props.validatorInput}
            onChange={(event) => props.setValidatorInput(event.target.value)}
            placeholder="1-7,12-15,20"
          />
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <div>
            <label
              htmlFor="yieldMode"
              className="mb-1 block text-xs text-zinc-400"
            >
              Yield mode
            </label>
            <Select
              id="yieldMode"
              value={props.yieldMode}
              onChange={(event) =>
                props.setYieldMode(event.target.value as YieldMode)
              }
            >
              <option value="daily">Daily (rolling 24h)</option>
              <option value="monthly">Monthly (rolling 30d)</option>
              <option value="annual">Annual (rolling 365d)</option>
              <option value="lifetime">Lifetime</option>
            </Select>
          </div>
          <div>
            <label
              htmlFor="pageSize"
              className="mb-1 block text-xs text-zinc-400"
            >
              Rows per page
            </label>
            <Select
              id="pageSize"
              value={String(props.pageSize)}
              onChange={(event) =>
                props.setPageSize(Number(event.target.value))
              }
            >
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="elRpc" className="mb-1 block text-xs text-zinc-400">
            Execution Layer RPC (elRpc)
          </label>
          <Input
            id="elRpc"
            value={props.elRpc}
            onChange={(event) => props.setElRpc(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="clRpc" className="mb-1 block text-xs text-zinc-400">
            Consensus Layer Beacon API (clRpc)
          </label>
          <Input
            id="clRpc"
            value={props.clRpc}
            onChange={(event) => props.setClRpc(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={props.onRefresh} disabled={props.loading}>
          {props.loading ? 'Loading…' : 'Refresh'}
        </Button>
        <p className="text-xs text-zinc-400">
          Lifetime yield is based on cumulative rewards generated and does not
          subtract distributions/cash-outs.
        </p>
      </div>
    </section>
  );
}
