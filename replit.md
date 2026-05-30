# ProofStore

Decentralized file certification on Sui Blockchain — hash client-side, store on Walrus, sign with your Sui wallet, verify forever.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/proofstore run dev` — run the frontend (assigned port)
- `pnpm run typecheck` — full typecheck across all packages
- Required env: `TATUM_API_KEY` — Tatum API key for Walrus storage and Sui RPC proxy

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- **Frontend**: React 19 + Vite, Tailwind CSS v4, @mysten/dapp-kit (Sui wallet), wouter, TanStack Query
- **Backend**: Express 5, file-based JSON storage (`artifacts/api-server/data/`)
- **Blockchain**: Sui Mainnet (wallet identity + signing)
- **Storage**: Walrus decentralized storage via Tatum API
- Build: esbuild (API server CJS bundle)

## Where things live

- `artifacts/proofstore/src/` — React frontend (pages, components, context, providers)
- `artifacts/api-server/src/routes/` — Express routes (certificates, sui-rpc, walrus, health)
- `artifacts/api-server/data/certificates.json` — certificate store (file-based, auto-created)
- `artifacts/api-server/data/blobs/` — Walrus blob metadata cache

## Architecture decisions

- **File-based storage** — certificates are stored as JSON in `data/certificates.json`, no DB needed. Simple, zero-config, works immediately.
- **Client-side hashing** — SHA-256/SHA-512 computed in browser via Web Crypto API; files never leave the device during verification.
- **Sui wallet as identity** — no accounts, no passwords; wallet address is the user's identity. Signatures are Ed25519/secp256k1, gas-free.
- **Tatum API proxy** — `TATUM_API_KEY` lives only on the backend; never exposed to the browser. Falls back to public Sui RPC if key is absent.
- **Walrus blob caching** — blob metadata cached locally in `data/blobs/` to reduce Tatum API calls.

## Product

ProofStore creates tamper-proof, cryptographically verifiable certificates for any file:
- **Certify**: drop a file → hash client-side → upload to Walrus → sign with wallet → certificate stored
- **Verify**: drop any file → hash client-side → check if certificate exists → instant result
- **Browse**: paginated registry of all certificates, filterable by wallet
- **Search**: query by hash, blob ID, filename, or wallet address
- **Dashboard**: stats and recent activity feed

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `TATUM_API_KEY` is required for Walrus uploads. Without it, `/api/walrus/upload` returns 503. Sui RPC falls back to public node if key is missing.
- The `data/` directory in `artifacts/api-server/` is auto-created on first write.
- `pnpm install` must be run from workspace root after adding new packages to proofstore.
- The API server's `dev` script runs `build` then `start` — changes require a workflow restart.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
