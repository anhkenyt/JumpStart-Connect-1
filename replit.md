# Jumpstart

A map-based jump-start marketplace demo connecting stranded drivers with nearby people who have a jump pack or a car with jumper cables.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/jumpstart run dev` — frontend, started using its managed workflow
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- Frontend: `artifacts/jumpstart/`
- API contract: `lib/api-spec/openapi.yaml`
- Request transitions, price checks, and demo seed: `artifacts/api-server/src/lib/jumpstart.ts`
- Routes and demo workspace isolation: `artifacts/api-server/src/routes/jumpstart.ts`
- Database schema: `lib/db/src/schema/jumpstart-demo.ts`

## Architecture decisions

- This first version is deliberately a test-payment demo, not a real payment or identity system. Live use needs managed authentication and a marketplace payment/payout provider.
- Every browser has a separate five-user demo workspace so strangers cannot edit each other's test jobs. Switch demo users inside the same browser to play both sides.
- Store demo workspaces in PostgreSQL, not local files, for durable reloads. Serialize changes with a row lock to prevent conflicting requests and duplicate success receipts.
- Use Leaflet/OpenStreetMap without a paid map key. Distance is straight-line and travel time is an estimate, not a routing service.

## Product

- GPS/pin-based nearby helper discovery, agreed helper quotes, explicit helper acceptance, arrival, driver-confirmed success or failure, cancellation, and test receipts.
- No fees on failed, declined, or cancelled jobs.

## User preferences

- Keep the experience simple and friendly like Google Maps.
- Provide five fake users to test driver and helper roles.
- Use test payments for the first version.

## Gotchas

- Always regenerate the API client and validation after changing OpenAPI.
- The state request initializes the demo cookie. Wait for it before sending parallel demo requests.
- Managed workflows provide `PORT` and `BASE_PATH`; do not replace them with ad hoc dev servers.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
