# Pakistan Office Guide

A web app that helps you find and navigate government offices across Pakistan — with AI-powered search, detailed service information, and a mobile-first PWA design.

## Features

- **AI Search** — Ask in plain English: "passport office in Islamabad" or "NADRA near DHA Lahore"
- **Browse by City** — Lahore, Karachi, Islamabad, Rawalpindi, Peshawar, Multan, Faisalabad, Quetta
- **Browse by Category** — NADRA, Passport, Driving License, Utilities, Police, Excise, Land, Courts, Post Office
- **Office Details** — Requirements, step-by-step procedures, fees, hours, and notes per office
- **Google Maps Links** — Direct navigation to office locations
- **Favorites** — Save offices locally to your device
- **PWA** — Installable as a standalone app with offline support

## Tech Stack

- **Next.js 16** (App Router, webpack)
- **React 19**
- **OpenAI API** — GPT-4o-mini with structured JSON output for AI search
- **next-pwa** + Workbox — service worker and offline caching
- **Prisma** + PostgreSQL — ORM configured, data served from local JSON
- **Zod** — schema validation

## Getting Started

### Prerequisites

- Node.js 18+
- OpenAI API key

### Install

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=your_postgres_connection_string   # optional
```

### Run (Development)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build & Start (Production)

```bash
npm run build
npm start
```

## How AI Search Works

Type a natural language query and the app uses OpenAI to extract structured filters (city, category, area, keywords), then matches and ranks results from the local office dataset. A regex-based fallback handles cases where the API is unavailable.

Example queries:
- `passport office in islamabad`
- `nadra near dha lahore`
- `electricity bill office rawalpindi`

## Project Structure

```
src/
├── app/
│   ├── page.js                  # Home — quick start, city grid, category grid
│   ├── layout.js                # Root layout (dark theme, bottom nav)
│   ├── cities/page.js           # All cities with images
│   ├── city/[city]/page.js      # Offices in a city
│   ├── office/[id]/page.js      # Office detail (requirements, steps, fees)
│   ├── search/page.js           # Manual + AI search with filter chips
│   ├── favorites/page.js        # Saved offices (localStorage)
│   └── api/ai-search/route.js   # POST endpoint — AI search via OpenAI
├── components/
│   ├── BottomNav.js             # Fixed bottom navigation
│   ├── AISearchBox.js           # AI search input component
│   ├── CollapsibleSection.js    # Expandable detail card
│   ├── FavoriteButton.js        # Star toggle (localStorage)
│   └── CopyButton.js            # Copy to clipboard
├── data/
│   └── offices.json             # Master office dataset (100+ offices)
└── lib/
    ├── offices.js               # Data utilities and search scoring
    ├── favorites.js             # localStorage helpers
    └── ui.js                    # Design system (colors, layout tokens)
scripts/
  addOffice.js                   # CLI tool to add offices to the dataset
```

## Adding Offices

Use the interactive CLI to add new offices to the dataset:

```bash
npm run add-office
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run add-office` | Interactively add a new office to the dataset |
