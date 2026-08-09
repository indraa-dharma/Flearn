# Flearn Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task. Do **not** start coding until this plan is approved.

**Goal:** Mengubah project `first-project` dari baseline FLearn/mock UI menjadi MVP **Flearn**: AI Academic Study Planner + Google Calendar two-way sync + GLM-5.2/Qwen Cloud workflow generator.

**Architecture:** Pertahankan Next.js App Router + Prisma/PostgreSQL yang sudah ada, rapikan backend menjadi service modules (`auth`, `documents`, `calendar`, `ai`, `study-plans`, `dashboard`) dan API routes yang mengembalikan structured JSON untuk UI. Frontend yang sudah ada dipakai sebagai shell/desain, lalu mock data diganti bertahap dengan API real.

**Tech Stack:** Next.js 16.2.9, React 19, TypeScript 6, Prisma 7 + PostgreSQL, NextAuth v4 Google OAuth/Credentials, Google Calendar API, local uploads untuk dev/Supabase Storage untuk target deploy, GLM-5.2 via Qwen Cloud/OpenAI-compatible HTTP API.

---

## 0. Current Context / Findings

### Project state discovered

- Root: `C:\Users\LENOVO\first-project`
- Next.js version: `16.2.9`
- Important repo instruction: `AGENTS.md` says Next.js APIs may have breaking changes; before coding, read relevant docs in installed `node_modules/next/dist/docs/` if present, otherwise verify against Next 16 docs online.
- Existing auth:
  - `src/app/api/auth/[...nextauth]/route.ts`
  - NextAuth + Google + Credentials + PrismaAdapter already exists.
  - Google scope already includes Calendar read/write scopes.
- Existing Prisma schema:
  - Has NextAuth models: `User`, `Account`, `Session`, `VerificationToken`.
  - Has partial app models: `Document`, `Task`, `WorkflowItem`, `StudySession`, `CalendarEvent`.
  - Missing MVP entities/fields: document text/chunks/status, study plan parent/items, AI outputs, sync status, Google event mapping metadata, profile preferences.
- Existing upload API:
  - `src/app/api/upload/route.ts`
  - Stores locally under `public/uploads`.
  - Uses fallback user id `cuid-fallback-local-user-id` — must be removed for production flow.
  - Returns `documents`, but Sources UI expects `sources`; this mismatch must be fixed.
- Existing calendar API:
  - `src/app/api/calendar/events/route.ts`
  - GET fetches Google events and formats for UI.
  - Calendar page already calls POST `/api/calendar/events`, but POST is not implemented yet.
  - Calendar page calls `/api/calendar/sync`, but route does not exist yet.
- Existing frontend:
  - Landing page still says FLearn in many strings.
  - Dashboard, Calendar, Priorities/Workflow, Chat/Workspace AI, Sources pages exist.
  - Many pages still use `src/lib/mock-data.ts` or simulated AI responses.

### Security note

The LLM API key was pasted in chat. Treat it as exposed. Implementation must:

1. Put the key only in `.env.local` as `QWEN_API_KEY`.
2. Never commit `.env.local`.
3. Recommend rotating/regenerating the exposed key before deployment/demo.
4. Never hardcode the key in source.

---

## 1. Target MVP Acceptance Criteria

MVP is complete when all below work end-to-end locally:

1. User can sign in with Google.
2. App can detect Google Calendar connection status.
3. App can fetch upcoming Calendar events from Google and persist them locally.
4. App can create study block events in Google Calendar and store local↔Google event mapping.
5. User can upload a document from Sources or Workspace.
6. Backend stores document metadata, extracts readable text where possible, and stores extraction/summary status.
7. Backend calls GLM-5.2 through Qwen Cloud using `QWEN_API_KEY` from env.
8. AI returns structured JSON for summary + workflow/study plan.
9. Study plan is saved in DB and rendered in Workflow/Priorities page.
10. Dashboard shows real aggregate data from documents, plans, and calendar events instead of static mock values.
11. Build/lint pass, and basic API smoke tests pass.

---

## 2. Environment Variables

Create or update `.env.local` manually before running implementation. Do not commit it.

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-random-secret"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
QWEN_API_KEY="..."
QWEN_BASE_URL="https://www.qwencloud.com" # verify exact OpenAI-compatible base URL from docs before coding
QWEN_MODEL="glm-5.2"
UPLOAD_STORAGE_DRIVER="local"
```

Implementation must also update `.env.example` with placeholder names only, never real secrets.

---

## 3. Proposed Backend Module Layout

Create these modules under `src/lib/`:

```text
src/lib/auth.ts                 # server session helpers, requireUser()
src/lib/api-response.ts         # success/error response helpers
src/lib/documents/types.ts
src/lib/documents/extract.ts    # basic text extraction by MIME/ext
src/lib/documents/service.ts
src/lib/calendar/types.ts
src/lib/calendar/google.ts      # Google API fetch/create/update/delete
src/lib/calendar/service.ts     # DB sync and mappings
src/lib/ai/types.ts
src/lib/ai/prompts.ts
src/lib/ai/qwen.ts              # GLM-5.2 client
src/lib/ai/service.ts           # summary/workflow generation
src/lib/study-plans/types.ts
src/lib/study-plans/service.ts
src/lib/dashboard/service.ts
```

Reasoning:

- API routes stay thin.
- Business logic is testable without rendering UI.
- Frontend can consume stable JSON shapes.
- Calendar, AI, and documents can be developed independently.

---

## 4. Database Design Update

Modify `prisma/schema.prisma` carefully. Keep NextAuth models compatible.

### Add/extend models

#### `User`

Add relations:

```prisma
profile          Profile?
documentChunks   DocumentChunk[]
studyPlans       StudyPlan[]
studyPlanItems   StudyPlanItem[]
aiOutputs        AiOutput[]
```

#### `Profile`

```prisma
model Profile {
  id          String   @id @default(cuid())
  userId      String   @unique
  university  String?
  major       String?
  year        String?
  preferences Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### Extend `Document`

Replace minimal fields with richer state while preserving existing data where possible:

```prisma
model Document {
  id              String   @id @default(cuid())
  userId          String
  title           String
  fileName        String
  originalName    String?
  type            String
  size            Int
  url             String
  storagePath     String?
  subject         String?
  course          String?
  status          String   @default("uploaded") // uploaded, extracting, ready, failed
  extractionStatus String  @default("pending") // pending, done, failed
  extractedText   String?  @db.Text
  summaryStatus   String  @default("pending") // pending, generating, done, failed
  summary         Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user       User @relation(fields: [userId], references: [id], onDelete: Cascade)
  chunks     DocumentChunk[]
  aiOutputs  AiOutput[]
  planItems  StudyPlanItem[]
}
```

#### `DocumentChunk`

```prisma
model DocumentChunk {
  id         String   @id @default(cuid())
  userId     String
  documentId String
  index      Int
  text       String   @db.Text
  tokenCount Int?
  metadata   Json?
  createdAt  DateTime @default(now())

  user     User @relation(fields: [userId], references: [id], onDelete: Cascade)
  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@unique([documentId, index])
}
```

#### Extend `CalendarEvent`

Current `googleEventId String @unique` is too strict because app-created/local draft events may not have Google IDs. Replace with:

```prisma
model CalendarEvent {
  id            String   @id @default(cuid())
  userId        String
  googleEventId String?
  title         String
  description   String?  @db.Text
  location      String?
  startTime     DateTime
  endTime       DateTime
  timezone      String?
  source        String   @default("google") // google, app, ai
  eventType     String   @default("calendar") // class, deadline, study_block, reminder, personal
  syncStatus    String   @default("synced") // synced, pending, failed, deleted
  lastSyncedAt  DateTime?
  metadata      Json?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)
  planItems StudyPlanItem[]

  @@unique([userId, googleEventId])
  @@index([userId, startTime])
}
```

#### `StudyPlan`

```prisma
model StudyPlan {
  id                String   @id @default(cuid())
  userId            String
  title             String
  status            String   @default("draft") // draft, active, archived
  summary           String?  @db.Text
  priorityReasoning String?  @db.Text
  nextAction        String?  @db.Text
  sourceDocumentIds Json?
  calendarContext   Json?
  rawAiOutput       Json?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user    User @relation(fields: [userId], references: [id], onDelete: Cascade)
  items   StudyPlanItem[]
  outputs AiOutput[]
}
```

#### `StudyPlanItem`

```prisma
model StudyPlanItem {
  id              String   @id @default(cuid())
  userId          String
  studyPlanId     String
  documentId      String?
  calendarEventId String?
  order           Int
  title           String
  description     String?  @db.Text
  course          String?
  topic           String?
  type            String   @default("study") // study, review, practice, break
  durationMinutes Int
  scheduledStart  DateTime?
  scheduledEnd    DateTime?
  reasoning       String?  @db.Text
  status          String   @default("pending") // pending, completed, skipped
  syncStatus      String   @default("not_synced") // not_synced, pending, synced, failed
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user          User @relation(fields: [userId], references: [id], onDelete: Cascade)
  studyPlan     StudyPlan @relation(fields: [studyPlanId], references: [id], onDelete: Cascade)
  document      Document? @relation(fields: [documentId], references: [id], onDelete: SetNull)
  calendarEvent CalendarEvent? @relation(fields: [calendarEventId], references: [id], onDelete: SetNull)

  @@index([userId, scheduledStart])
  @@unique([studyPlanId, order])
}
```

#### `AiOutput`

```prisma
model AiOutput {
  id          String   @id @default(cuid())
  userId      String
  documentId  String?
  studyPlanId String?
  taskType    String   // document_summary, study_workflow, tutor_answer, recommendation
  model       String
  promptHash  String?
  output      Json
  metadata    Json?
  createdAt   DateTime @default(now())

  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)
  document  Document? @relation(fields: [documentId], references: [id], onDelete: SetNull)
  studyPlan StudyPlan? @relation(fields: [studyPlanId], references: [id], onDelete: SetNull)
}
```

### Migration command

After schema update:

```bash
npx prisma format
npx prisma generate
npx prisma migrate dev --name flearn_mvp_core
```

Expected: Prisma formats schema, generates client, and applies migration successfully.

---

## 5. API Contract Plan

### Auth

- Keep `src/app/api/auth/[...nextauth]/route.ts`.
- Add shared helper `src/lib/auth.ts`:
  - `getCurrentUser()` returns Prisma user or null.
  - `requireUser()` throws typed unauthorized error.
- Ensure Google provider scopes include:
  - `openid email profile`
  - `https://www.googleapis.com/auth/calendar.readonly`
  - `https://www.googleapis.com/auth/calendar.events`

### Documents

#### `GET /api/documents`

Returns current user documents:

```json
{
  "success": true,
  "documents": [
    {
      "id": "...",
      "title": "...",
      "fileName": "...",
      "type": "application/pdf",
      "size": 12345,
      "sizeLabel": "1.2 MB",
      "status": "ready",
      "summaryStatus": "done",
      "createdAt": "..."
    }
  ]
}
```

#### `POST /api/documents`

Uploads file, extracts text, stores metadata/chunks, optionally triggers summary generation.

Inputs:

- `multipart/form-data`
- `file`
- optional `subject`, `course`

Returns:

```json
{
  "success": true,
  "document": { "id": "...", "title": "...", "status": "ready" },
  "summary": { "summary": "...", "key_points": [] }
}
```

#### Compatibility route

Keep `/api/upload` as wrapper during frontend migration:

- `POST /api/upload` calls document service.
- `GET /api/upload` returns both `documents` and `sources` keys until all UI is fixed.

### AI

#### `POST /api/ai/summary`

Input:

```json
{ "documentId": "..." }
```

Output structured:

```json
{
  "success": true,
  "summary": {
    "summary": "...",
    "key_points": ["..."],
    "important_terms": [{ "term": "...", "definition": "..." }],
    "suggested_topics": ["..."]
  }
}
```

#### `POST /api/ai/study-plan`

Input:

```json
{
  "documentIds": ["..."],
  "dateRange": { "start": "...", "end": "..." },
  "preferences": { "sessionMinutes": 60, "language": "id" }
}
```

Output:

```json
{
  "success": true,
  "studyPlan": {
    "id": "...",
    "title": "...",
    "summary": "...",
    "workflow_steps": [],
    "recommended_time_blocks": [],
    "next_action": "..."
  }
}
```

### Calendar

#### `GET /api/calendar/status`

Already exists; improve to include safe metadata:

```json
{ "connected": true, "email": "user@example.com", "scopesOk": true }
```

#### `GET /api/calendar/events?start=...&end=...`

- Fetch from Google if connected.
- Upsert local DB records.
- Return UI-compatible events plus raw fields.

#### `POST /api/calendar/events`

Create study block/reminder in Google Calendar and DB.

Input:

```json
{
  "title": "Review Bab 4 Biologi",
  "description": "Generated by Flearn",
  "startTime": "2026-07-20T08:00:00+07:00",
  "endTime": "2026-07-20T09:00:00+07:00",
  "eventType": "study_block",
  "studyPlanItemId": "optional"
}
```

Output:

```json
{ "success": true, "event": { "id": "local-id", "googleEventId": "google-id", "syncStatus": "synced" } }
```

#### `PATCH /api/calendar/events/[id]`

Update local + Google event.

#### `DELETE /api/calendar/events/[id]`

Delete from Google or mark deleted if Google call fails.

#### `POST /api/calendar/sync`

Manual refresh. Pulls Google events and persists sync status.

### Study Plans

#### `GET /api/study-plans?status=active`

Returns saved plans and items.

#### `POST /api/study-plans/generate`

Wrapper around AI study plan generation + persistence.

#### `PATCH /api/study-plans/[id]/items/[itemId]`

Update status/order/scheduled time after user edits.

#### `POST /api/study-plans/[id]/sync-calendar`

Create Google Calendar events for selected plan items.

### Dashboard

#### `GET /api/dashboard`

Aggregates:

- document count/processed count
- tasks/study plan items today
- upcoming calendar events
- free time estimate
- readiness score (simple MVP heuristic)
- next action

---

## 6. LLM Integration Plan: GLM-5.2 via Qwen Cloud

### Files

- Create `src/lib/ai/qwen.ts`
- Create `src/lib/ai/prompts.ts`
- Create `src/lib/ai/types.ts`
- Create `src/lib/ai/service.ts`

### `qwen.ts` responsibilities

- Read env vars:
  - `QWEN_API_KEY`
  - `QWEN_BASE_URL`
  - `QWEN_MODEL`
- Call GLM-5.2 endpoint from Qwen Cloud docs.
- Before coding, verify exact endpoint and payload against: `https://www.qwencloud.com/models/glm-5.2#api-reference`
- Use server-only code. Never import this into client components.
- Enforce timeouts and helpful errors.

### Structured output rules

Prompts must request strict JSON, no markdown fences.

Use Indonesian default UX language:

```text
You are Flearn, an AI academic study planner for Indonesian students.
Return ONLY valid JSON matching the requested schema.
Do not include markdown, commentary, or extra keys.
If input is insufficient, fill safe defaults and explain uncertainty in priority_reasoning.
```

### Summary output schema

```ts
export type DocumentSummaryOutput = {
  summary: string;
  key_points: string[];
  important_terms: Array<{ term: string; definition: string }>;
  suggested_topics: string[];
  difficulty_level: "easy" | "medium" | "hard";
  estimated_study_minutes: number;
};
```

### Study plan output schema

```ts
export type StudyPlanOutput = {
  title: string;
  summary: string;
  priority_reasoning: string;
  workflow_steps: Array<{
    title: string;
    description: string;
    course?: string;
    topic?: string;
    type: "study" | "review" | "practice" | "break";
    duration_minutes: number;
    reasoning: string;
  }>;
  recommended_time_blocks: Array<{
    title: string;
    start_time: string;
    end_time: string;
    reason: string;
  }>;
  next_action: string;
  calendar_events_to_create: Array<{
    title: string;
    description: string;
    start_time: string;
    end_time: string;
  }>;
};
```

### JSON parsing fallback

If provider returns JSON text with extra wrappers:

1. Try `JSON.parse` directly.
2. Extract first `{...}` block safely.
3. Validate required keys manually or with small helper.
4. If invalid, store raw AI output in `AiOutput` with failed metadata and return actionable API error.

---

## 7. Document Ingestion Plan

### MVP extraction priority

1. Plain text / markdown: use `file.text()`.
2. PDF: install/use `pdf-parse` or equivalent compatible package after verifying with Next.js server runtime.
3. PPT/DOCX: for MVP, store file metadata and return `extractionStatus = failed` with clear message unless a lightweight parser is added.
4. Limit input text sent to LLM (e.g. first 20k chars) to avoid huge requests.

### Upload implementation details

- Require logged-in user.
- Store locally in `public/uploads` for dev.
- Sanitize filenames.
- Store actual `userId` from session, not fallback.
- Create document row with status `extracting`.
- Extract text.
- Create chunks of ~2,000-3,000 characters.
- Call summary generation or provide explicit button/API to generate.
- Update status to `ready` or `failed`.

### Avoid overengineering

- Do not implement pgvector in MVP unless retrieval becomes necessary.
- Do not build advanced chat-with-doc RAG yet; just summary + workflow planning.

---

## 8. Calendar Sync Plan

### Token handling

- NextAuth stores Google `access_token`, `refresh_token`, `expires_at` in `Account`.
- Implement helper to refresh token when expired if refresh token exists.
- Never send tokens to client.

### Google event mapping

On inbound sync:

- For each Google event:
  - `where: { userId_googleEventId: { userId, googleEventId } }`
  - upsert fields: title, description, start/end, location, source=`google`, syncStatus=`synced`, lastSyncedAt.

On outbound create:

- Validate start/end.
- Create Google event.
- Create local `CalendarEvent` with returned Google id.
- If Google call fails, either reject or store pending event with `syncStatus = failed` depending UX.

### UI-compatible event mapping

Keep a formatter:

```ts
formatCalendarEventForUi(event): {
  id,
  title,
  time,
  day,
  color,
  category,
  isConflict,
  isSuggestion,
  startTime,
  endTime,
  syncStatus
}
```

---

## 9. Frontend Wiring Plan

### Branding

Replace visible FLearn naming with Flearn in:

- `src/app/page.tsx`
- `src/components/auth/login-modal.tsx`
- footer/copy strings
- sidebar/header copy as needed

Keep page design unless it conflicts with product positioning.

### Auth context

Modify `src/lib/auth-context.tsx`:

- Do not default `user` to `initialUser` when unauthenticated.
- Use session user data.
- `connectGoogleCalendar` should redirect to Google sign-in/consent.
- `disconnectGoogleCalendar` should call real DELETE/PATCH route or keep disabled until implemented.

### Sources page

Modify `src/app/(app)/sources/page.tsx`:

- Fetch `/api/documents` or fixed `/api/upload` response.
- Use consistent field names: `title`, `fileName`, `status`, `summaryStatus`, `createdAt`.
- On upload success, prepend returned document.

### Workspace/Chat page

Modify `src/app/(app)/chat/page.tsx`:

- Replace simulated file processing with real upload endpoint.
- Replace simulated AI reply with `POST /api/study-plans/generate` or `POST /api/ai/summary` depending prompt.
- Render generated workflow from API response.

### Calendar page

Modify `src/app/(app)/calendar/page.tsx`:

- Use actual `start`/`end` query based on selected week.
- Implement POST body with ISO times, not legacy `day/startHour` only.
- Add clear error state for not connected / expired token.
- Wire manual refresh to `/api/calendar/sync` after route exists.

### Workflow/Priorities page

Modify `src/app/(app)/priorities/page.tsx`:

- Fetch `/api/study-plans?status=active`.
- If empty, show CTA to upload docs and generate plan.
- Button to sync items to Google Calendar calls `/api/study-plans/[id]/sync-calendar`.

### Dashboard page

Modify `src/app/(app)/dashboard/page.tsx`:

- Fetch `/api/dashboard`.
- Replace hard-coded stats and mock arrays.
- Keep graceful empty states.

---

## 10. Step-by-Step Implementation Tasks

### Task 1: Safety and repo baseline

**Objective:** Confirm current build state before changes.

**Files:** none modified.

**Steps:**

1. Run:
   ```bash
   cd /c/Users/LENOVO/first-project && npm run lint
   ```
2. Run:
   ```bash
   cd /c/Users/LENOVO/first-project && npm run build
   ```
3. Record existing failures separately from introduced failures.
4. Do not fix unrelated UI polish yet.

**Verification:** Baseline known.

---

### Task 2: Add env example and security docs

**Objective:** Document required secrets safely.

**Files:**

- Create/modify: `.env.example`
- Modify: `README.md`

**Steps:**

1. Add placeholder env names only.
2. Add short setup section for Google OAuth, DB, Qwen key.
3. Add note: exposed keys must be rotated.

**Verification:** No real secrets in files.

---

### Task 3: Update Prisma schema

**Objective:** Add Flearn MVP persistence models.

**Files:**

- Modify: `prisma/schema.prisma`

**Steps:**

1. Add `Profile`, `DocumentChunk`, `StudyPlan`, `StudyPlanItem`, `AiOutput`.
2. Extend `Document` and `CalendarEvent`.
3. Add necessary User relations.
4. Run:
   ```bash
   npx prisma format
   npx prisma generate
   npx prisma migrate dev --name flearn_mvp_core
   ```

**Verification:** Prisma generate/migration succeeds.

---

### Task 4: Create shared server helpers

**Objective:** Centralize auth and API errors.

**Files:**

- Create: `src/lib/auth.ts`
- Create: `src/lib/api-response.ts`

**Core behavior:**

- `requireUser()` reads NextAuth server session and returns Prisma user.
- `jsonError(message, status, details?)` standardizes errors.
- `jsonSuccess(data, status?)` standardizes success.

**Verification:** TypeScript compiles.

---

### Task 5: Implement AI client and prompt templates

**Objective:** Add GLM-5.2 backend-only integration.

**Files:**

- Create: `src/lib/ai/types.ts`
- Create: `src/lib/ai/prompts.ts`
- Create: `src/lib/ai/qwen.ts`
- Create: `src/lib/ai/service.ts`

**Steps:**

1. Verify Qwen Cloud API exact endpoint from docs.
2. Implement timeout-based `callQwenJson()`.
3. Add summary prompt.
4. Add study-plan prompt.
5. Add JSON parsing/validation fallback.

**Verification:** With env set, a tiny test call returns valid JSON. Without env, API returns clear server config error.

---

### Task 6: Implement document service

**Objective:** Make upload and extraction real.

**Files:**

- Create: `src/lib/documents/types.ts`
- Create: `src/lib/documents/extract.ts`
- Create: `src/lib/documents/service.ts`
- Modify/create API routes:
  - `src/app/api/documents/route.ts`
  - `src/app/api/documents/[id]/route.ts`
  - `src/app/api/upload/route.ts` compatibility wrapper

**Steps:**

1. Require authenticated user.
2. Save file locally.
3. Extract text for txt/md; add PDF support if package works.
4. Chunk text.
5. Persist document and chunks.
6. Return both document shape and source-compatible shape.

**Verification:** Upload file from UI creates DB row under real user id.

---

### Task 7: Implement summary endpoint

**Objective:** Generate and store document summaries.

**Files:**

- Create: `src/app/api/ai/summary/route.ts`
- Modify: `src/lib/ai/service.ts`
- Modify: `src/lib/documents/service.ts` if auto-summary is desired

**Steps:**

1. Validate document belongs to current user.
2. Use extracted text/chunks.
3. Call Qwen.
4. Store in `Document.summary` and `AiOutput`.
5. Return structured summary.

**Verification:** Upload sample text then summary API returns JSON with `summary`, `key_points`, `important_terms`.

---

### Task 8: Implement calendar service and token refresh

**Objective:** Reliable Calendar API reads/writes.

**Files:**

- Create: `src/lib/calendar/types.ts`
- Create: `src/lib/calendar/google.ts`
- Create: `src/lib/calendar/service.ts`
- Modify: `src/app/api/calendar/status/route.ts`
- Modify: `src/app/api/calendar/events/route.ts`
- Create: `src/app/api/calendar/events/[id]/route.ts`
- Create: `src/app/api/calendar/sync/route.ts`

**Steps:**

1. Add helper to find current user’s Google account.
2. Add token refresh helper if expired.
3. Implement inbound sync/upsert.
4. Implement event create/update/delete.
5. Keep UI formatter.

**Verification:** Calendar page can fetch real events and create one test study block.

---

### Task 9: Implement study plan service

**Objective:** Generate and persist calendar-aware workflow.

**Files:**

- Create: `src/lib/study-plans/types.ts`
- Create: `src/lib/study-plans/service.ts`
- Create: `src/app/api/study-plans/route.ts`
- Create: `src/app/api/study-plans/generate/route.ts`
- Create: `src/app/api/study-plans/[id]/sync-calendar/route.ts`

**Steps:**

1. Load selected documents + summaries/text.
2. Load calendar events for selected date range.
3. Build prompt context.
4. Call Qwen structured study plan.
5. Save `StudyPlan`, `StudyPlanItem`, `AiOutput`.
6. Implement sync-to-calendar for plan items.

**Verification:** From uploaded document + calendar data, generated plan appears in DB and can create Calendar events.

---

### Task 10: Implement dashboard service

**Objective:** Replace dashboard mock stats with real aggregate data.

**Files:**

- Create: `src/lib/dashboard/service.ts`
- Create: `src/app/api/dashboard/route.ts`

**Steps:**

1. Count documents and processed docs.
2. Load today’s study plan items.
3. Load upcoming calendar events.
4. Estimate free time from today events.
5. Compute simple readiness score.

**Verification:** `/api/dashboard` returns stable JSON for empty and populated states.

---

### Task 11: Frontend branding pass FLearn → Flearn

**Objective:** Align product identity with spec.

**Files:**

- Modify: `src/app/page.tsx`
- Modify: `src/components/auth/login-modal.tsx`
- Modify: `src/components/layout/app-sidebar.tsx` as needed
- Search all: `FLearn`, `EduPulse`

**Steps:**

1. Replace visible FLearn strings with Flearn.
2. Update value proposition copy per spec.
3. Keep design/components.

**Verification:** Search returns no visible stale branding except migration comments if intentionally retained.

---

### Task 12: Wire Sources UI

**Objective:** Sources page uses real document API.

**Files:**

- Modify: `src/app/(app)/sources/page.tsx`
- Modify: `src/components/upload/file-upload-modal.tsx`

**Steps:**

1. Fetch `/api/documents`.
2. Upload to `/api/documents` or compatibility `/api/upload` consistently.
3. Fix field mismatch (`data.sources` vs `data.documents`).
4. Show status badges: uploaded/extracting/ready/failed.

**Verification:** Upload from modal updates grid without refresh.

---

### Task 13: Wire Calendar UI

**Objective:** Calendar page uses real week range, errors, and create flow.

**Files:**

- Modify: `src/app/(app)/calendar/page.tsx`

**Steps:**

1. Fetch `/api/calendar/events?start=...&end=...` when week changes.
2. Show connect CTA when 401/403.
3. Change add study block payload to ISO start/end.
4. Manual refresh calls `/api/calendar/sync`.

**Verification:** Google Calendar events render in correct weekday columns; new study block appears after creation.

---

### Task 14: Wire Workspace AI page

**Objective:** Replace simulated chat/workflow with backend AI calls.

**Files:**

- Modify: `src/app/(app)/chat/page.tsx`

**Steps:**

1. Drag/drop upload calls document API.
2. Suggestion “Ringkas dokumen...” calls summary endpoint.
3. Suggestion “Buatkan jadwal...” calls study plan generation endpoint.
4. Render returned workflow steps.

**Verification:** User can upload doc and generate plan from Workspace page.

---

### Task 15: Wire Workflow/Priorities page

**Objective:** Render persisted study plans.

**Files:**

- Modify: `src/app/(app)/priorities/page.tsx`

**Steps:**

1. Fetch active/latest study plan.
2. Render items instead of empty `workflowItems` constant.
3. Add CTA to generate plan if empty.
4. Calendar toggle/sync uses plan sync endpoint.

**Verification:** Generated plan persists after page refresh.

---

### Task 16: Wire Dashboard page

**Objective:** Dashboard aggregates real MVP data.

**Files:**

- Modify: `src/app/(app)/dashboard/page.tsx`

**Steps:**

1. Fetch `/api/dashboard`.
2. Replace static quick stats.
3. Replace Today’s Focus and Weekly Schedule data.
4. Keep loading and empty states.

**Verification:** Dashboard changes after upload/generate/sync.

---

### Task 17: Final validation

**Objective:** Ensure “once set jadi” quality before handoff.

**Commands:**

```bash
cd /c/Users/LENOVO/first-project
npm run lint
npm run build
npx prisma validate
```

Manual smoke test:

1. Start dev server:
   ```bash
   npm run dev
   ```
2. Sign in with Google.
3. Open Calendar and sync.
4. Upload a small `.txt` or `.md` lecture note.
5. Generate summary.
6. Generate study plan.
7. Sync one study block to Google Calendar.
8. Refresh Dashboard/Workflow and confirm data persists.

---

## 11. Risks / Tradeoffs

1. **Qwen Cloud endpoint uncertainty:** Must verify exact API base URL/payload before code. Do not guess from model page alone.
2. **Exposed API key:** Key must be rotated before demo/deploy.
3. **PDF/PPT extraction:** Full robust extraction may require extra dependencies. MVP can support txt/md first and add PDF if dependency installs cleanly.
4. **Next.js 16 changes:** Follow local/official docs for App Router route handlers and server runtime details.
5. **NextAuth v4 + PrismaAdapter mismatch:** Existing code casts adapter as `any`. Keep stable initially; do not migrate auth library during MVP unless necessary.
6. **Calendar token refresh:** If refresh token missing, app must ask reconnect instead of silently failing.
7. **Supabase target vs existing Prisma PostgreSQL:** Spec mentions Supabase. For MVP, use Supabase PostgreSQL through Prisma and NextAuth. Supabase Auth migration is out of scope unless explicitly required.

---

## 12. Non-Goals for This Implementation

- Multi-user collaboration.
- Real-time chat streaming.
- Payment/subscription.
- Mobile app.
- Advanced vector search/pgvector RAG.
- Full PPT/DOCX parser if it delays MVP.
- Complete analytics engine.

---

## 13. Recommended Execution Style

Implement in this order:

1. Backend schema + helpers.
2. AI client verified with tiny payload.
3. Document upload/extraction.
4. Calendar sync/read/write.
5. Study plan generation/persistence.
6. Frontend wiring.
7. Final build + smoke test.

Commit after each major task if using git:

```bash
git add .
git commit -m "feat: add flearn core schema"
git commit -m "feat: add qwen ai pipeline"
git commit -m "feat: implement document ingestion"
git commit -m "feat: implement calendar sync"
git commit -m "feat: implement study plan generation"
git commit -m "feat: wire flearn frontend"
```

---

## 14. Open Questions Before Coding

1. Database: apakah `DATABASE_URL` sudah menunjuk ke Supabase PostgreSQL yang aktif?
2. Google OAuth: apakah `GOOGLE_CLIENT_ID/SECRET` sudah siap dan redirect URI sudah benar untuk `http://localhost:3000/api/auth/callback/google`?
3. Storage: untuk demo lokal boleh tetap `public/uploads`, atau harus langsung Supabase Storage?
4. Dokumen MVP: format wajib apa dulu? `.txt/.md/.pdf` cukup, atau harus PPT juga?
5. Bahasa UI final: full Indonesia, full English, atau bilingual seperti sekarang?

If defaults are acceptable: use Prisma + Supabase PostgreSQL, local uploads for dev, txt/md/pdf first, Indonesian UX copy, and Google Calendar via NextAuth.
