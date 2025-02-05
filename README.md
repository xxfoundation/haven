Haven is a vite app.

## Getting Started

First, run the development server:

```bash
npm install
npm run dev
# or
yarn install
yarn dev
# or
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ICP Cannister HOWTO

https://internetcomputer.org/docs/current/developer-docs/web-apps/application-frontends/existing-frontend

Test Locally:

```
dfx start
dfx deploy
```

Generate and fund an Identity, in this case `icp_prod`:

```
dfx identity new icp_prod
dfx ledger account-id --identity icp_prod --network ic # Use output here to send funds
dfx ledger balance --identity icp_prod --network ic
dfx cycles convert --amount 2.0 --network ic --identity icp_prod
```

Deploy

```
dfx deploy --network ic --identity icp_prod
```

# Production

```
npm run build
npm run preview
# or
yarn build
yarn preview
# or
bun run build
bun run preview
```
