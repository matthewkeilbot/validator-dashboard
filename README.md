# validator-dashboard

Static React dashboard for Ethereum validator index monitoring (mainnet), designed for S3 hosting.

## Stack

- React + TypeScript (strict)
- Vite
- Tailwind CSS v4
- shadcn/ui-style components (local)
- ethers.js
- pnpm
- Biome

## Quick Start

```bash
pnpm install
pnpm dev
```

Open: http://localhost:5173

## Build for Static Hosting (S3)

```bash
pnpm build
```

Upload `dist/` contents to your S3 static website bucket (or behind CloudFront).

## Configuration

Everything can be set in URL query params or the UI controls.

### Query Params

- `validators` — validator index list/ranges
- `elRpc` — execution-layer JSON-RPC endpoint
- `clRpc` — consensus-layer beacon API endpoint
- `yieldMode` — `daily|monthly|annual|lifetime`
- `pageSize` — `20|50|100`
- `page` — current page index

Example:

```text
/?validators=1-7,12-15,20&elRpc=https://ethereum-rpc.publicnode.com&clRpc=https://ethereum-beacon-api.publicnode.com&yieldMode=lifetime&pageSize=20&page=1
```

## UX Behavior

- Query params populate UI fields on load.
- Editing UI fields updates query params (bookmarkable dashboard state).
- Totals row aggregates **all loaded validators**, not only current page rows.

## Yield Notes

- Daily/monthly/annual = rolling windows (24h/30d/365d).
- Lifetime yield is based on cumulative rewards generated vs principal.
- Distributions/outflows are treated as cash-outs and do not reduce lifetime yield.

## Rocket Pool Notes

- Displays Rocket Pool RPL rewards as `RPL`.
- RPL is excluded from ETH yield calculations.
- Lido support is deferred to a later spec.

## Limitations / Assumptions (MVP)

- Front-end only, no backend/indexer.
- Some reward attribution may be partial depending on RPC capability and provided addresses.
- Mainnet only.
- Outflow/distribution tracking is currently conservative and may show `0` if not reliably derivable from available data.

## Quality Commands

```bash
pnpm lint
pnpm format
pnpm typecheck
```

## Specs

See `specs/0001-mvp-validator-dashboard.md` for the approved MVP scope.
