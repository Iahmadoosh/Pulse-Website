<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ac6cc785-19fe-4060-a9bb-059599044edc

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## SPY Options Trainer

A standalone options-trading training app, served at **`/options`** (e.g. `http://localhost:3000/options`). It has its own burgundy-and-white design and is separate from the Pulse dashboard. Source: `src/options/` (UI), `src/lib/options/` (pricing, market calendar, challenge engine, lessons), `server/spyMarketData.ts` (data feeds).

- **Academy:** six walkthrough lessons (options basics, reading the chain, the Greeks, implied volatility, orders and expiration, risk management), each with interactive widgets and a quiz. Passing every quiz unlocks the challenge.
- **Trading Desk:** live SPY quote and intraday chart, the full SPY option chain (bid/ask with sizes, last, volume, open interest, IV, delta, gamma, theta, vega, rho) and an order ticket with pre-trade coaching.
- **$300 challenge:** a simulated cash account that buys calls and puts to open and sells them to close at the real bid/ask. The challenge ends when equity falls 10% (Hard), 25% (Medium) or 50% (Easy) below the $300 start.
- **Glossary** and **Results** (equity curve, past challenges, CSV trade journal).

Progress and challenges are saved in the browser (localStorage).

### Market data

Data is fetched server-side by `server/spyMarketData.ts` and exposed at `/api/spy/*`:

| Data | Default (no key) | With `TRADIER_ACCESS_TOKEN` |
| --- | --- | --- |
| SPY quote & intraday chart | Yahoo Finance (real-time last price) | Tradier (real-time) |
| Option chain, Greeks, IV | Cboe delayed quotes (15-minute delay) | Tradier (real-time) |

US options quotes are licensed (OPRA), so free public feeds are delayed 15 minutes. For real-time option quotes, set `TRADIER_ACCESS_TOKEN` to a Tradier brokerage API token in `.env.local`/`.env`. Sandbox tokens also work with `TRADIER_SANDBOX=true`, but their data is delayed. The UI always labels which feed is active and how delayed it is.

Run the trainer's unit tests with `npm test`.
