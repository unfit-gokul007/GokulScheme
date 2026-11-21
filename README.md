# GokulScheme AI

A free, no-login civic web application helping citizens in India discover Central and State government welfare schemes, understand likely eligibility criteria, review required document names and application steps, and ask questions to a grounded AI assistant.

> **Disclaimer:** GokulScheme AI is an independent informational service, not a government website. Eligibility results are estimates; the concerned government department makes the final decision.

---

## Quick Setup (5 Steps — Windows, Mac, Linux)

1. **Install Node.js 18+**: Download and install Node.js 18 or newer from [nodejs.org](https://nodejs.org/).
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Create `.env` from `.env.example`**:
   - **Mac / Linux:** `cp .env.example .env`
   - **Windows (PowerShell/CMD):** `copy .env.example .env`
4. **Optional — Add a free Gemini API key** (only needed for the `/assistant` chat page; everything else works without it):
   - Visit [Google AI Studio](https://aistudio.google.com/apikey) and sign in with a Google account.
   - Click **Create API key** (free tier available).
   - Paste it into `.env` as `GEMINI_API_KEY=your_actual_key`. Never commit `.env` or share your key in client code.
5. **Run the app**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser (Express API runs on `http://localhost:5000` and Vite proxies `/api/*` automatically).

---

## Running Tests & Build

```bash
npm test       # Runs Vitest unit tests for matching scorer and PII guard
npm run lint   # Runs TypeScript type-checking on /client
npm run build  # Builds the production frontend into client/dist
npm start      # Starts the Express server (serves /api and client/dist if built)
```

---

## Adding or Updating Schemes

Schemes live in `server/data/schemes.json` behind `server/repo/schemeRepo.js` (designed so MongoDB can replace the JSON loader later without changing routes).

1. Verify every detail directly from official `.gov.in` / `.nic.in` portals (`myscheme.gov.in`, ministry or state portals).
2. Add a record matching the schema (`id`, `name_original`, `name_en`, `level`, `state`, `category`, `summary`, `eligibility`, `benefits`, `documents`, `application_steps`, `source_links`, `last_verified`, `data_status`).
3. Set `data_status` to `"verified"` only if every rule, benefit, and link was directly confirmed from an official portal; otherwise set `"demo"` so the UI displays a visible `DEMO DATA, not real` badge.

---

## Adding or Improving Languages

GokulScheme AI supports English plus all 22 Eighth Schedule Indian languages (23 options total) via `react-i18next`:

1. Locale files are in `client/src/locales/<code>.json`, and language metadata (native name, `ltr`/`rtl` direction, translation status) is registered in `client/src/i18n/languages.ts`.
2. Missing keys automatically fall back to `client/src/locales/en.json`.
3. Every non-English locale file includes a `_meta` block (`"status": "unverified"` or `"status": "fallback"`). To improve a translation, edit the corresponding `client/src/locales/<code>.json` file while keeping official scheme names untranslated.
4. For RTL languages (`ur`, `ks`, `sd`), `dir: "rtl"` automatically flips `document.documentElement.dir` and Tailwind logical classes (`ps-*`, `pe-*`, `ms-*`, `me-*`, `rtl:rotate-180`).

---

## Deployment Guide

### Option A: Separate Client (Vercel / Netlify) + Server (Render)

1. **Deploy `/server` on Render** (Web Service):
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables (in Render dashboard):**
     - `GEMINI_API_KEY` (optional, for AI assistant)
     - `CLIENT_ORIGIN` = `https://your-frontend-domain.vercel.app`
     - `PORT` (provided automatically by Render)
2. **Deploy `/client` on Vercel or Netlify**:
   - **Root Directory:** `.` (or configure build command `npm run build` and output directory `client/dist`)
   - Configure a rewrite/proxy rule so `/api/*` forwards to your Render backend URL, or set `VITE_API_BASE_URL` if deploying with separate domains.
   - **Never** place `GEMINI_API_KEY` in client/frontend environment variables.

### Option B: Single Full-Stack Service (Render / Cloud Run)

- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- Set `GEMINI_API_KEY` (optional) and `CLIENT_ORIGIN` in the host dashboard. Express serves both `/api/*` and the built `client/dist` bundle.
