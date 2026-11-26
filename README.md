# People's Priorities (ప్రజల ప్రాథమ్యతలు)

A Telugu-first grievance workflow platform for government field and extension
officers. Citizens report local issues conversationally in Telugu, Hindi or
English; officers process each application through a fixed, auditable workflow
with AI assistance at every step — while the officer always makes the final
call.

Built as a **Next.js 14 (App Router, TypeScript)** frontend, a **FastAPI +
LangGraph** backend, and **MongoDB Atlas + Atlas Vector Search**.

## The problem, and who it affects

Field and extension officers in a constituency process citizen grievances —
water, roads, drainage, streetlights, pensions — through slow systems and
paper files. Each application passes through several steps before a decision,
but the officer has no ordered view of what needs attention first, no help
reading unstructured complaints (often written in Telugu), and no clean record
of what happened to each application. Citizens, in turn, never learn what
happened to their report.

This platform is the tool the officer should have had. It serves the
constituency of Visakhapatnam, Andhra Pradesh, and the entire officer-facing
interface is in Telugu, the language the work actually happens in.

## What the application does

**Officer workflow (the core).** Every citizen submission becomes an
application that moves through four steps:

1. **Received (స్వీకరణ)** — the complaint is structured, translated and
   categorized automatically.
2. **Details check (వివరాల పరిశీలన)** — the officer verifies the location,
   description and completeness.
3. **Field check (క్షేత్ర పరిశీలన)** — the officer verifies on the ground and
   records a field note.
4. **Decision (నిర్ణయం)** — the officer approves, rejects, or returns the
   application for more information. Reject and return require a written
   reason.

The **Officer Desk (అధికారి డెస్క్)** shows the pending queue ordered by an
explainable priority score, so what needs attention first is always on top.
Every move, every AI suggestion, and every decision is written to a
**decision log** — a per-application timeline showing who did what, when, and
what the AI had suggested at that moment. The AI suggests; the officer
decides.

**Supporting surfaces.**

| Route | Who | Purpose |
|---|---|---|
| `/officer` | Field / extension officers | Login, prioritized queue, step workflow, AI assistance, decisions, history |
| `/citizen` | Citizens | Conversational issue intake in Telugu/Hindi/English, tracking ID + guidance |
| `/staff` | MP office staff | Manual entry, review queue, cluster management, public updates |
| `/mp/chat` | MP | Natural-language, evidence-backed Q&A over the constituency knowledge base |
| `/mp/dashboard` | MP | Top priorities, category breakdown, hotspots, heatmap, reports |
| `/public/issues` | Public | Anonymized issue clusters + public updates (no personal data) |

## Where AI helps, and why

- **Intake structuring and translation.** Messy, multilingual complaints are
  parsed into structured fields (category, urgency, location, sensitive
  flags) and translated to English for the record. Citizens write in their
  own language; officers read structured Telugu.
- **Per-step assistance on the Officer Desk.** At each step the officer can
  ask for help: a triage summary at Received, a completeness checklist at
  Details check, what to confirm and record at Field check, and a balanced
  recommendation at Decision that explicitly leaves the call to the officer.
  Every suggestion is logged, so assistance is auditable.
- **Priority ordering.** Applications are ranked by an explainable score
  (complaint volume, urgency, affected population, vulnerable groups, trend,
  evidence), so the queue reflects ground reality rather than arrival order.
- **Clustering.** Similar complaints are grouped with multilingual
  embeddings + Atlas Vector Search, so 99 reports of the same water shortage
  become one priority, not 99 rows.
- **MP intelligence.** The MP asks questions in natural language and gets
  answers grounded only in recorded data, with confidence and limitations
  shown.

AI never approves, rejects or returns an application. It reads, summarizes,
translates and ranks; humans decide.

## How impact would be measured, and why it will work

- **Time to first action**: from application received to first officer step.
  Target: same day, versus days in a paper queue.
- **First-pass completeness**: share of applications passing Details check
  without a return. The checklist should raise it.
- **Queue age**: age of the oldest pending application; priority ordering
  should keep urgent ones from waiting.
- **Decision turnaround**: received-to-decision time per category.
- **Audit coverage**: 100% of decisions carry an actor, timestamp and reason;
  returns/rejects always carry a written reason.

It should work because it mirrors the process officers already follow (the
steps are theirs, not invented), removes the two friction points that slow
them down (reading unstructured multilingual complaints, deciding what to
pick up next), keeps every decision human, and meets the worker in Telugu
instead of forcing English.

## Main technical decisions

- **FastAPI + LangGraph agents** for the conversational surfaces; the
  tool-calling model (an OpenAI-compatible endpoint, default
  `openai/gpt-oss-120b:groq` via Hugging Face Inference Providers) keeps
  agent turns fast enough for live use.
- **multilingual-e5-large embeddings** (1024-dim) so Telugu, Hindi and
  English complaints cluster together; Atlas `$vectorSearch` for retrieval.
- **Explainable scoring over black-box ranking**: the priority formula's
  weights are visible and each factor can be defended to a citizen.
- **A dedicated decision-log collection** (`applicationevents`), separate
  from the public status-update feed: per-application, records the AI
  suggestion shown, and never public.
- **Telugu-first UI with an English toggle**: one shared dictionary
  (`lib/i18n.tsx`), data values stay English in the database and are
  translated only for display, Noto Sans Telugu for readable body text.
- **Simple token login** for the Officer Desk (demo credentials below);
  citizen and public surfaces need no account.
- **Next.js rewrites** proxy `/api/*` to the backend, so frontend and API
  deploy independently.

## Run it locally

Prerequisites: Node.js 18+, Python 3.11+, a MongoDB Atlas cluster (free M0
supports Vector Search), and a Hugging Face token with Inference Providers
permission.

```bash
# Frontend (repo root)
npm install
cp .env.example .env        # fill values
npm run dev                 # http://localhost:3000
```

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate   # .venv\Scripts\activate on Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

`.env` values (repo root):

```
MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/peoples_priorities?retryWrites=true&w=majority"
HF_TOKEN="hf_..."
HF_BASE_URL="https://router.huggingface.co/v1"
CHAT_MODEL="openai/gpt-oss-120b:groq"
EMBEDDING_MODEL="intfloat/multilingual-e5-large"
EMBEDDING_DIM="1024"
ATLAS_VECTOR_INDEX="cluster_vector_index"
OFFICER_USERNAME="officer"          # Officer Desk login (demo)
OFFICER_PASSWORD="officer123"
BACKEND_URL="http://127.0.0.1:8000" # where the frontend proxies /api
```

Create the Atlas Vector Search index once: Atlas UI → Atlas Search → Create
Search Index → JSON Editor, database `peoples_priorities`, collection
`issueclusters`, paste `docs/atlas-vector-index.json`. Then embed existing
clusters and guidance: `python backend/scripts/embed_guidance.py`.

**Demo login for the Officer Desk (`/officer`):** `officer` / `officer123`.

## Privacy & safety

- Public pages expose clusters only — never names, phones, raw text or home
  locations.
- Submissions mentioning sensitive keywords are auto-flagged to the staff
  review queue and never auto-published.
- AI answers show confidence, sources and limitations.
- The platform does not replace official grievance systems (CPGRAMS, state
  PGRS); it is a listening, prioritization, guidance and planning layer.
