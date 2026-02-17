# CLAUDE.md — MENA Readiness Assessment

## Project Overview

This is a **MENA Readiness Assessment** web application — a Go-to-Market Readiness Diagnostic for SaaS companies entering the Middle East & North Africa region. It is a branded tool by **Bridge AI**.

The app is a single-page React application with three tabs that replicate an Excel workbook:
1. **Assessment** — Interactive form with 18 weighted questions across 6 categories
2. **Scoring Guide** — Read-only reference explaining scoring methodology
3. **Readiness Roadmap** — Auto-populated gap tracker for questions answered "No"

## Tech Stack

- **Framework**: React 19 (functional components, hooks)
- **Build Tool**: Vite 7
- **Language**: JavaScript (JSX)
- **Styling**: Plain CSS with CSS custom properties (no CSS framework)
- **Linting**: ESLint 9 with React Hooks and React Refresh plugins
- **No backend** — all logic is client-side with React state

## Project Structure

```
my-first-app/
├── index.html                 # Entry HTML (title: "MENA Readiness Assessment — Bridge AI")
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite configuration with React plugin
├── eslint.config.js           # ESLint flat config
├── CLAUDE.md                  # This file
├── README.md                  # Project description
├── public/                    # Static assets (served as-is)
├── src/
│   ├── main.jsx               # React entry point (renders App into #root)
│   ├── App.jsx                # Root component — tab navigation, state management
│   ├── index.css              # All styles — design system, responsive, print
│   ├── data.js                # Assessment data: categories, questions, weights, tier logic
│   └── components/
│       ├── Assessment.jsx     # Sheet 1: interactive form, scoring, category breakdown
│       ├── ScoringGuide.jsx   # Sheet 2: read-only reference tables
│       └── Roadmap.jsx        # Sheet 3: auto-populated gap tracker
└── dist/                      # Production build output (git-ignored)
```

## Key Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (Vite, hot reload)
npm run build        # Production build to dist/
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
```

## Architecture & Key Patterns

### State Management
All state lives in `App.jsx` using React hooks:
- `answers` — object keyed by question ID (e.g., `{ MR1: 1, GM2: 0, ... }`) with values `''`, `0`, or `1`
- `notes` — object keyed by question ID with free-text evidence/notes
- `companyName` — string for the company name input
- `roadmapData` — object keyed by question ID with `{ status, date, owner }` for gap remediation tracking

State is passed down via props. `useCallback` is used for change handlers to prevent unnecessary re-renders.

### Data Model (`src/data.js`)
- `categories` array: 6 categories, each with a `questions` array (18 total questions)
- Each question has: `num`, `id`, `question`, `weight` (2=Important, 3=Critical), `exampleNote`
- `TOTAL_MAX_WEIGHT` = 43 (sum of all question weights)
- `getTier(percentage)` — returns tier info based on thresholds: ≥69% Tier 1, ≥40% Tier 2, <40% Tier 3
- `getStatusBadge(percentage)` — returns status label and CSS class for category badges

### Scoring Logic
- **Weighted Score** per question: `answer × weight` (only when answer is not blank)
- **Category subtotal**: sum of weighted scores for all questions in the category
- **Overall %**: `totalWeightedScore / 43 × 100`
- **Tier determination**: ≥69% = Market Ready, ≥40% = Conditionally Ready, <40% = Not Ready

### Tab Navigation
Tabs use CSS `display: none/block` to toggle visibility (not conditional rendering), preserving state across tab switches.

### PDF Export
Uses `window.print()` with `@media print` CSS rules that hide tabs/export bar and clean up form inputs.

## Design System

### Colors (CSS Custom Properties in `:root`)

| Variable              | Hex       | Usage                                    |
|-----------------------|-----------|------------------------------------------|
| `--navy`              | `#1B2A4A` | Headers, title bars, score backgrounds   |
| `--teal`              | `#0D7C66` | Table headers, section accents           |
| `--gold`              | `#D4A84B` | Score %, readiness tier text, tab accent |
| `--light-teal-bg`     | `#E0F2EF` | Score achieved row background            |
| `--light-gray-bg`     | `#F5F5F5` | Alternating rows, max score row          |
| `--subtotal-gray-bg`  | `#E0E0E0` | Subtotal row backgrounds                 |
| `--green-text/bg`     | `#1E8449` / `#EAFAF1` | "Ready" status badge          |
| `--yellow-text/bg`    | `#B7950B` / `#FFF8E7` | "Gaps" status badge            |
| `--red-text/bg`       | `#C0392B` / `#FDEDEC` | "Not Ready" status badge       |
| `--dark-gray`         | `#555555` | Sub-header rows in scoring guide         |

### Typography
- Font family: Arial, sans-serif
- Title: 18px bold, white on navy
- Section headers: 12px bold, white on navy
- Score percentage: 18px bold, gold on navy
- Body: 11px regular

### Responsive Breakpoints
- **Desktop**: Full layout with all columns
- **Tablet** (≤768px): Notes column hidden in assessment, owner column hidden in roadmap, score grid stacks vertically

## Assessment Categories

1. **Market Readiness** (4 questions, max weight: 10)
2. **Go-to-Market & Commercial Readiness** (4 questions, max weight: 9)
3. **Localization** (3 questions, max weight: 7)
4. **Government & Enterprise Procurement** (2 questions, max weight: 5)
5. **Data Residency & Compliance** (3 questions, max weight: 7)
6. **Security & Certifications** (2 questions, max weight: 5)

**Total**: 18 questions, maximum weighted score: 43

## Conventions

- Components are functional with hooks (no class components)
- One component per file in `src/components/`
- CSS is global in `src/index.css` using BEM-like class naming
- No TypeScript — plain JavaScript with JSX
- No external UI library — all styling is custom CSS
- Form inputs are controlled components
- Data constants are separated from components in `src/data.js`

## Common Tasks

### Adding a new assessment question
1. Add the question object to the appropriate category in `src/data.js`
2. Update `TOTAL_MAX_WEIGHT` if needed (sum of all weights)
3. The UI auto-renders from the `categories` data — no component changes needed

### Modifying tier thresholds
Edit the `getTier()` function in `src/data.js`. Current thresholds: 69% (Tier 1), 40% (Tier 2).

### Changing brand colors
All colors are CSS custom properties in `:root` in `src/index.css`. Change there for global effect.

### Adding new roadmap status options
Edit the `<select>` options in `src/components/Roadmap.jsx`.
