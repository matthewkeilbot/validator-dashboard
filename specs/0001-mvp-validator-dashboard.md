# Spec 0001 — MVP Static Validator Dashboard

## Status
Approved for implementation

## Goal
Build a static, front-end-only React dashboard for Ethereum validators that can be hosted on S3 and configured entirely via URL query parameters and UI controls.

## Tech Stack
- React + TypeScript (strict)
- Vite
- Tailwind CSS
- shadcn/ui
- ethers.js
- pnpm (package manager)
- Biome (formatting + linting)

## Product Requirements

### 1) Data Sources
- Query Ethereum data from configurable:
  - Execution Layer (EL) RPC endpoint
  - Consensus Layer (CL) Beacon API endpoint (standard format)
- No backend required.
- App must run as static assets.
- Users can provide their own EL/CL endpoints.
- Network scope for MVP: Ethereum mainnet only.

### 2) Validator Input
- Support multiple validators by validator index.
- Accept indices from query param:
  - `validators=1-7,12-15,20,22,30-35`
- Parser must support mixed singles + ranges.
- Ranges expand to unique sorted index list.
- UI field must allow editing same format.
- UI and URL must stay synchronized (2-way).

### 3) RPC Input
- Query params:
  - `elRpc`
  - `clRpc`
- UI fields must:
  - Populate from URL
  - Update URL when edited
- User can run without code changes.

### 4) Display
- Spreadsheet-like table.
- One row per validator.
- Totals/aggregate row at bottom.
- Theme: black background, gold accents, white/light-gray text/components.
- Add pagination UI with display-size options: 20 / 50 / 100 rows per page.
- Totals must aggregate across all loaded validators (not only visible page rows).

### 5) Per-Validator Metrics (MVP)
- Validator index
- Validator pubkey (if available)
- Withdrawal address (if available)
- Effective balance / staked ETH
- Rewards earned (ETH)
- Inflows to reward-related addresses (ETH)
- Outflows/distributions from reward-related addresses (ETH)
- Yield (based on selected mode)
- Rocket Pool/minipool reward-related fields where applicable
- Relevant status field(s)

### 6) Yield Modes
- Toggle: daily / monthly / annual / lifetime
- Controlled by state and optional query param `yieldMode`.

### 7) Yield Window Definition
- Daily/monthly/annual use **rolling windows** from current time:
  - Daily: trailing 24h
  - Monthly: trailing 30d
  - Annual: trailing 365d
- Lifetime uses all known cumulative history in currently queried data.

### 8) Lifetime Yield Rules
- Lifetime yield = cumulative rewards generated relative to principal.
- Outflows/distributions DO NOT reduce lifetime yield.
- Distributions are cash-outs, not negative performance.
- UI note/tooltip must explicitly explain this.

### 9) Rocket Pool Support
- Rocket Pool enrichment should prefer public on-chain data.
- RPL rewards shown as RPL (no ETH conversion for MVP).
- Show note: RPL excluded from ETH yield calculations.

### 10) State Management
Use React Context (no Redux) for shared state:
- Parsed validator set
- RPC endpoint config
- Loaded validator data
- Aggregated totals
- Selected yield mode
- Loading + error states
- Pagination state (page index + page size)

### 11) UX
- Loading state
- Empty state
- Error state
- Easy paste for validator ranges
- URL-driven bookmarkable state
- Practical, professional minimal UI

### 12) Architecture / Utilities
Create utility modules for:
- Validator range parsing/expansion
- Query param read/write
- ETH/RPL formatting
- Yield calculations
- Totals aggregation

Code quality:
- Strict TypeScript
- Production-quality structure
- Helpful comments around range parsing + yield logic

### 13) Deliverables
- Full app code for local run and static build
- README including:
  - Setup
  - Build/deploy (S3 static hosting)
  - RPC configuration
  - URL query usage
  - Example URLs
  - Limitations/assumptions

## MVP Data Strategy (Implementation)

### Consensus Layer
- Use Beacon REST standard endpoints to fetch validator metadata/state by index.

### Execution Layer
- Use EL RPC + public contract calls/log queries for reward-flow data.
- Reward attribution in MVP will use:
  1. Validator withdrawal destination
  2. Fee recipient (when inferable/provided)
  3. Rocket Pool minipool addresses (when inferable/provided)

### Protocol Enrichment
- Rocket Pool: public contract data + logs (on-chain only)
- Lido: deferred (out of MVP scope)

## Assumptions
1. Users may need to provide/confirm fee recipient or operator addresses when not inferable from base validator data.
2. EL RPC must support required historical log queries for selected windows.
3. Some metrics may be marked “N/A” when underlying data cannot be reliably attributed from available endpoints.

## Non-Goals (MVP)
- Backend services
- Authentication
- Cross-user persistence
- RPL->ETH conversion
- Lido support (deferred)
- Perfect attribution for every possible operator topology without extra user-provided mappings
