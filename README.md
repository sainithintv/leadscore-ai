# LeadScore AI

Score and enrich LinkedIn leads with AI. Built for NxtWave B2B sales teams.

## What it does

1. **Upload** — drag-drop a CSV exported from Emelia (LinkedIn Sales Navigator)
2. **Setup** — describe your ideal customer persona; enter your AI + Lusha API keys
3. **Score** — GPT-4o-mini or Mistral AI scores every profile 0–100 (Hot / Warm / Cold)
4. **Enrich** — Lusha fetches email + phone for your top-scored profiles
5. **Export** — download enriched results as CSV

---

## Deploy to Vercel (5 minutes)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "init"
gh repo create leadscore-ai --public --push
```

### 2. Import on Vercel
Go to https://vercel.com/new → Import the repo → click **Deploy**.

No build configuration needed — `vercel.json` handles it.

### 3. (Optional) Set server-side API keys
In Vercel → Project → Settings → Environment Variables, add any of:

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI key (skips UI entry) |
| `MISTRAL_API_KEY` | Mistral key (skips UI entry) |
| `LUSHA_API_KEY` | Lusha key (skips UI entry) |

If you skip this, users enter their own keys in the Setup screen.

---

## Local development

```bash
npm install
cp .env.example .env.local   # add your keys
npm run dev
```

Open http://localhost:3000

---

## CSV format (Emelia export)

The app auto-detects column names. Supported field names:

| Field | Accepted column names |
|---|---|
| LinkedIn URL | `LinkedIn URL`, `linkedin_url`, `Profile URL`, `url` |
| First Name | `First Name`, `first_name`, `firstName` |
| Last Name | `Last Name`, `last_name`, `lastName` |
| Title | `Job Title`, `title`, `Position`, `Headline` |
| Company | `Company`, `company`, `Current Company` |
| Location | `Location`, `location` |
| Industry | `Industry`, `industry` |

---

## Tech stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4** — dark glass-morphism UI
- **OpenAI / Mistral AI** — profile scoring
- **Lusha API** — contact enrichment (email + phone)
- **Vercel** — hosting
