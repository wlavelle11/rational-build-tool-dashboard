# Rational Build Design — Investment Dashboard

Multi-strategy real estate investment analysis platform built for Rational Build Design. Covers Multifamily, Residential Flip/BRRR, ADU Development, and an integrated property lead pipeline.

---

## Overview

A Next.js dashboard that gives Rational Build a unified command center across all investment strategies. Each tool performs real-time financial modeling and stores results to a shared Supabase PostgreSQL database.

---

## Investment Tools

### Multifamily
Underwriting model for apartment buildings and multi-unit properties.
- 10-year cash flow pro forma
- IRR, equity multiple, cap rate
- Investor waterfall: 6% preferred return → capital return → sponsor promote
- Recommendation engine: Strong Buy / Caution / Pass

### Residential Flip & BRRR
Side-by-side comparison of two exit strategies for the same property.
- **Flip:** Cash or hard money financing toggle. Loan fee (1%), annualized interest (10%), 33.33% investor profit share per RBD investor doc.
- **BRRR:** Bridge loan → refinance model. Cash returned, monthly investor distributions, actual vs target cash yield (8%), equity split at sale.
- Both strategies modeled simultaneously from shared property inputs.

### ADU Development
San Diego Bonus ADU feasibility and 10-year financial analysis.
- **Feasibility scoring:** 5 weighted categories (Lot & Coverage 25pts, Zoning 25pts, Setbacks 20pts, Utility Capacity 15pts, HOA & Permit Complexity 15pts). GO ≥70 / CAUTION 50–69 / NO-GO <50.
- **Address auto-fill:** Census Bureau geocoder → SD County ArcGIS parcel service (free, no API key required). Returns lot size, zoning code, existing coverage, APN.
- **10-year pro forma:** Gross rent → vacancy → EGI → OpEx → NOI → exit valuation. IRR (Newton-Raphson), equity multiple, investor waterfall.

### Property Leads
Scored lead feed from the Rational Build Pipeline (see below). Displays all incoming NOD, Auction, and Listed properties scored 1–100. One-click "Analyze" opens the Residential form pre-filled with the lead's address and estimated value.

---

## Pipeline Integration

The `rational-pipeline` Python scraper (separate repo) scrapes 5 distressed property sources daily, scores leads 1–100, and syncs to this dashboard via `POST /api/leads`. Google Sheets output is preserved alongside — both run in parallel.

Flow:
```
pipeline.py → Google Sheets (unchanged)
           → POST /api/leads → Supabase Lead table → /leads dashboard tab
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.1 (App Router, Turbopack) |
| Language | TypeScript |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 7 with `PrismaPg` adapter |
| Forms | react-hook-form + Zod |
| Styling | Custom CSS design tokens (CSS custom properties) |
| Icons | lucide-react |
| Geocoding | Census Bureau + SD County ArcGIS (free) |

---

## Data Models

| Model | Purpose |
|-------|---------|
| `Deal` | Multifamily underwriting projects |
| `ResidentialProject` | Flip + BRRR analysis projects |
| `ADUProject` | ADU feasibility + financial analysis |
| `Lead` | Incoming scored leads from the pipeline |

---

## Setup

### Prerequisites
- Node.js 18+
- Supabase project (PostgreSQL)

### Install

```bash
git clone https://github.com/wlavelle11/rbd-multi-family-deal-analyzer.git
cd rbd-multi-family-deal-analyzer
npm install
```

### Configure `.env`

```
DATABASE_URL=postgresql://...     # Supabase connection string
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Database

```bash
npx prisma db push
npx prisma generate
```

### Run

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Project Structure

```
app/
├── (main)/
│   ├── page.tsx               # Dashboard home — aggregate stats + strategy cards
│   ├── multifamily/           # Multifamily deal portfolio + underwriting form
│   ├── residential/           # Flip vs BRRR portfolio + analysis form
│   ├── adu/                   # ADU feasibility + financial analysis
│   ├── leads/                 # Pipeline lead feed
│   └── properties/            # Unified property directory across all strategies
├── api/
│   ├── deals/                 # Multifamily CRUD
│   ├── residential/           # Residential project CRUD
│   ├── adu/                   # ADU project CRUD + address lookup
│   └── leads/                 # Lead upsert endpoint (called by pipeline)
components/
├── layout/                    # Nav, sidebar
├── residential/               # ResidentialForm, FlipPanel, BRRRPanel
├── adu/                       # ADUForm, FeasibilityScoreCard, ADUMetricsPanel
└── ui/                        # StatCard, shared components
lib/
├── finance/
│   ├── index.ts               # Multifamily analysis
│   ├── flip.ts                # Flip calculations
│   ├── brrr.ts                # BRRR calculations
│   ├── adu.ts                 # ADU 10-year pro forma + IRR
│   └── adu-feasibility.ts     # Feasibility scoring engine
├── prisma.ts                  # Prisma client singleton
├── formatters.ts              # Currency, percent, multiple formatters
└── validations.ts             # Zod schemas
prisma/
└── schema.prisma              # All data models
```

---

## Related Repos

- **[Rational-Pipeline](https://github.com/wlavelle11/Rational-Pipeline)** — Python scraper that generates and scores property leads, feeding this dashboard's Leads tab.
