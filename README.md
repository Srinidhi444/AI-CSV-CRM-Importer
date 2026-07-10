# GrowEasy AI CSV Importer

A full-stack AI-powered CSV import tool that previews uploaded CSV files locally, then transforms messy lead data into a structured GrowEasy CRM format after explicit user confirmation.

This project was built as a staged import workflow: upload a CSV, preview it in the browser, confirm processing, and then review both imported and skipped records with reasons. That staged flow aligns with common CSV importer UX patterns where users inspect data before commit and verify row-level outcomes after processing [1][2].

## What the project does

The application accepts arbitrary CSV files that may have inconsistent headers, mixed value formats, or partially missing contact information, and converts them into a fixed CRM schema. Imported rows are normalized into a common lead structure, while invalid rows are skipped and surfaced back to the user with a reason and raw source data [3][4].

### Core workflow

1. Upload a CSV file from the frontend.
2. Parse and preview the CSV locally in the browser before any AI call is made.
3. Confirm import manually.
4. Send the CSV to the backend for AI-based extraction and normalization.
5. Return structured imported rows and skipped rows separately.
6. Review imported records, skipped records, and summary counts in the UI.

## Features included

### Core features

- CSV upload with drag-and-drop support.
- Local CSV preview before backend processing.
- AI-based extraction into a fixed GrowEasy CRM schema.
- Support for inconsistent source column names.
- Imported vs skipped row summary counts.
- Skipped rows with row index, reason, and raw row data.
- Clean table-based review UI for preview, imported rows, and skipped rows.
- Light and dark mode.

### Data handling features

- Flexible mapping from arbitrary CSV headers to CRM fields.
- Support for multiple emails in one source row, using the first email as the primary value and appending extras into `crm_note`.
- Support for multiple phone numbers in one source row, using the first number as the primary mobile and appending extras into `crm_note`.
- Sanitization of AI output so CRM strings remain plain text JSON values.
- Conservative handling of uncertain fields such as `country_code`.
- Row skipping when both email and phone are missing.

### UI/UX features

- Clean CRM-style layout with black-and-white table emphasis.
- Compact top navigation and cleaner import/review layout.
- Minimal pill badges for lead status.
- Reviewer-friendly imported and skipped tables.
- File metadata display after upload.
- Clear staged status messaging during preview and processing.

## CRM schema produced

The backend normalizes rows into the following CRM shape:

```ts
{
  created_at: string | null;
  name: string | null;
  email: string | null;
  country_code: string | null;
  mobile_without_country_code: string | null;
  company: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  lead_owner: string | null;
  crm_status: "GOOD_LEAD_FOLLOW_UP" | "DID_NOT_CONNECT" | "BAD_LEAD" | "SALE_DONE" | null;
  crm_note: string | null;
  data_source: "leads_on_demand" | "meridian_tower" | "eden_park" | "varah_swamy" | "sarjapur_plots" | null;
  possession_time: string | null;
  description: string | null;
}
```

## Tech stack

| Layer | Technology | Why it was used |
|---|---|---|
| Frontend | Next.js | Good fit for a clean React-based app shell and componentized UI. |
| Frontend UI | React + Tailwind CSS | Fast iteration for table-heavy layouts and responsive UI. |
| CSV preview | Papa Parse | Local browser parsing for preview before backend AI processing. |
| Backend | Node.js + Express | Simple API layer for file uploads, validation, batching, and AI orchestration. |
| File upload | Multer | Handles multipart CSV upload cleanly in Express. |
| CSV parsing | csv-parse | Reliable server-side CSV parsing for backend processing. |
| Validation | Zod | Runtime schema validation for environment variables and AI output. |
| LLM provider | Google Gemini API | Structured output support plus a practical free-tier path for development and submission [5][6]. |
| Dev runtime | tsx | Better fit than `ts-node-dev` for modern TypeScript ESM workflows [7][8]. |
| Monorepo tooling | Turborepo | Keeps frontend and backend in one workspace with shared development scripts. |

## Project structure

```txt
groweasy-csv-importer/
├─ apps/
│  ├─ web/                  # Next.js frontend
│  │  ├─ app/
│  │  ├─ components/
│  │  ├─ hooks/
│  │  └─ lib/
│  └─ server/               # Express + TypeScript backend
│     ├─ src/
│     │  ├─ config/
│     │  ├─ controllers/
│     │  ├─ middleware/
│     │  ├─ routes/
│     │  ├─ schemas/
│     │  ├─ services/
│     │  ├─ types/
│     │  └─ utils/
├─ packages/
└─ turbo.json
```

## Key implementation decisions

### 1. Preview first, AI second

The CSV is previewed locally in the browser before any backend AI processing happens. This was done so the user can inspect the uploaded file first and confirm import intentionally, which is a standard staged-import pattern and reduces accidental bad imports [1][2].

### 2. AI only on the backend

The frontend never calls the model provider directly. The browser talks only to the Express API, while the Gemini API key stays in the backend environment file. This protects secrets and keeps the architecture production-safe.

### 3. Structured output + server-side validation

Gemini is instructed to return structured JSON, and the backend validates the response again with Zod before using it. That two-step guardrail helps reduce malformed AI output and keeps the imported CRM records predictable [5][6].

### 4. Conservative normalization

The system prefers null over invention when values are uncertain. For example, `country_code` is not forced unless it is actually present or clearly separable from the source phone number.

### 5. Row-level failure handling

Instead of failing the entire import when a row is invalid, the app skips invalid rows and returns a reason with raw data. This is a much better import experience for messy real-world CSVs and matches row-level review expectations in mature import tools [4][9].

### 6. Clean reviewer-friendly UI

The final UI was intentionally simplified to focus on readability: neutral palette, compact layout, table-first review, visible skipped reasons, and status pills. That makes the extraction output easier to audit during evaluation.

## Setup instructions

### Prerequisites

- Node.js 20+
- npm
- A Gemini API key from Google AI Studio

### 1. Install dependencies

From the repo root:

```bash
npm install
```

### 2. Create environment files

#### Backend

Create `apps/server/.env`:

```env
PORT=4000
NODE_ENV=development
ALLOWED_ORIGIN=http://localhost:3000
GEMINI_API_KEY=your_actual_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
BATCH_SIZE=25
MAX_FILE_SIZE_MB=5
MAX_ROWS=5000
```

#### Frontend

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

### 3. Run the app

From the repo root:

```bash
npx turbo run dev
```

Expected local URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

### 4. Production build

```bash
npx turbo run build
```

## How to test the app

### Recommended manual test flow

1. Open the frontend.
2. Upload a sample CSV.
3. Confirm the preview appears before processing.
4. Click **Confirm Import**.
5. Verify imported rows, skipped rows, and counts.
6. Check that skipped rows include a row-level reason.
7. Review whether messy headers were mapped correctly into the CRM schema.

### Test cases covered during development

- Clean CSV with one intentionally invalid row.
- Messy real-estate CSV with multiple phones and multiple emails.
- Marketing export CSV with looser source fields.

## Validation rules implemented

- Skip a row if both email and mobile number are missing.
- Use only allowed enum values for `crm_status`.
- Use only allowed enum values for `data_source` when confidence is sufficient.
- Merge extra phones/emails into `crm_note`.
- Sanitize markdown-style or formatted AI output into plain text.
- Preserve row-level skipped reasons for UI review.

## What is covered

### Core requirements covered

- Upload CSV and preview data.
- AI transformation into structured CRM output.
- Imported and skipped results displayed separately.
- Row-level skipped reasons.
- Support for inconsistent source schemas.

### Bonus-quality improvements included

- Cleaner production-style UI.
- Multiple realistic CSV test files.
- Output sanitization and normalization.
- Better ESM dev tooling with `tsx`.
- Safer backend-only AI integration.
- Light/dark mode.

