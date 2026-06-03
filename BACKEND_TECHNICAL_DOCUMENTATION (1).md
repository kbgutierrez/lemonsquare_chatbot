# IT Support AI — Comprehensive Backend Technical Documentation

**Project:** IT Support AI (v2.0.0)  
**Framework:** FastAPI  
**Documentation Date:** 2026-06-03  
**Source:** 100% traceable to codebase — no guesses, no invented facts.

---

## Table of Contents

1. Executive Summary
2. System Overview
3. Complete Project Structure
4. File-by-File Documentation
5. Architecture Analysis
6. Request Lifecycle Analysis
7. Routes and API Documentation
8. Database Documentation
9. Services Documentation
10. Repository Documentation
11. Authentication & Authorization
12. Configuration Analysis
13. Dependency Analysis
14. External Integrations
15. Error Handling Analysis
16. Security Review
17. Performance Review
18. Scalability Review
19. Code Quality Review
20. Complete Module Reference
21. Developer Onboarding Guide
22. Future Roadmap
23. Knowledge Base

---

## 1. EXECUTIVE SUMMARY

### Purpose

This is an **IT Helpdesk AI Support Backend** built for Lemon Square (a Philippine company). It provides an intelligent chat interface that employees use to get IT, HR, and Maintenance support. The system uses **Retrieval-Augmented Generation (RAG)** to answer questions from a knowledge base built from resolved helpdesk tickets, uploaded PDF documents, and manually authored entries.

### Business Capabilities Discovered

- **AI Chat Support** — Employees chat with an LLM that is grounded in actual company knowledge.
- **Ticket Escalation** — When the AI cannot resolve an issue, it drafts a helpdesk ticket and submits it to BizPortal.
- **Intelligent Routing** — A separate RAC (Retrieve-Augment-Classify) pipeline predicts which department and subcategory a ticket belongs to.
- **Knowledge Base Management** — Admin users upload PDFs, write manual knowledge entries, and sync resolved helpdesk tickets.
- **Self-Learning** — When a chat is resolved, the AI extracts structured knowledge from the conversation and ingests it as a new vector.
- **Admin Dashboard Support** — Analytics, knowledge explorer, knowledge consolidation maintenance, and AI settings management.

### Core Responsibilities

- RAG pipeline (query reformulation → vector retrieval → reranking → answer generation)
- Document ingestion (PDF, manual text, resolved tickets, resolved chats)
- Chat session lifecycle management
- Ticket escalation drafting and submission to BizPortal
- AI settings runtime configuration
- User authentication via external BizPortal API

### Technology Stack

| Layer | Technology |
|---|---|
| Web Framework | FastAPI 0.136 |
| ASGI Server | Uvicorn 0.46 |
| LLM Provider | Groq API via `langchain-groq` |
| LLM Models | `llama-3.3-70b-versatile` (main), `llama-3.1-8b-instant` (fast) |
| Embeddings | HuggingFace `intfloat/multilingual-e5-large` |
| Reranker | `cross-encoder/ms-marco-MiniLM-L-6-v2` |
| Vector Database | Qdrant |
| Relational DB (primary) | SQL Server (MSSQL) — Chatbot DB |
| Relational DB (secondary) | SQL Server (MSSQL) — Helpdesk DB (read-only) |
| ORM | SQLAlchemy 2.0 |
| HTTP Client | httpx (async) |
| Rate Limiting | SlowAPI |
| Validation | Pydantic v2 + pydantic-settings |
| PDF Parsing | pypdf |
| Tracing (optional) | LangSmith |

### Architectural Style

**Layered Architecture** with explicit Router → Service → Repository → Database layers. The RAG pipeline uses a **Pipeline / Chain of Responsibility** pattern. Singletons are used aggressively for shared resources (embedding model, vector store, Qdrant client).

---

## 2. SYSTEM OVERVIEW

### What the Backend Does

It receives chat messages from employees (via a Streamlit or custom frontend), runs them through a multi-stage RAG pipeline to produce grounded answers, manages chat sessions and message history, and optionally escalates unresolved issues as helpdesk tickets to BizPortal. It also provides an admin interface for managing the knowledge base.

### How Requests Enter the System

All HTTP requests enter through FastAPI routes registered under the `/api` prefix. A custom HTTP middleware assigns each request a unique `request_id` (from `X-Request-ID` header or generated). CORS is handled by `CORSMiddleware`.

### ASCII Architecture Diagram

```
Client (Streamlit / Browser)
         |
         v
 [FastAPI HTTP Layer]
   CORS Middleware
   Request-ID Middleware
   Rate Limiter (SlowAPI)
         |
         v
 [API Routers] /api/*
   auth, admin_auth, chat, documents,
   tickets, settings, explorer, analytics,
   maintenance, routing, self_knowledge, models
         |
         v
 [FastAPI Dependency Injection]
   get_current_user → BizPortal Auth
   get_chatbot_db   → SQLAlchemy Session
   get_helpdesk_db  → SQLAlchemy Session
   get_orchestrator → SupportOrchestrator
   get_ingestion_service → DocumentIngestionService
         |
         v
 ┌───────────────────────────────────────────┐
 │          SERVICE LAYER                    │
 │                                           │
 │  Chat Services:                           │
 │    SessionManager → ChatRepository        │
 │    MessageService → ChatRepository        │
 │    EscalationService → BizPortal API      │
 │                                           │
 │  RAG Pipeline (SupportOrchestrator):      │
 │    QueryReformulator → Groq LLM           │
 │    VectorStoreService → Qdrant            │
 │    RerankerService → CrossEncoder         │
 │    AnswerGenerator → Groq LLM             │
 │                                           │
 │  Ingestion Services:                      │
 │    PDFProcessor                           │
 │    ManualEntryProcessor                   │
 │    TicketProcessor                        │
 │    ChatLearningProcessor                  │
 │                                           │
 │  Routing Engine (RAC):                    │
 │    suggest_route → Qdrant + Groq          │
 │                                           │
 │  Settings / Cache:                        │
 │    SettingsCache (TTL 300s)               │
 │    TaxonomyService (TTL 1800s)            │
 └───────────────────────────────────────────┘
         |
         v
 ┌──────────────────────────────┐
 │      REPOSITORY LAYER        │
 │  ChatRepository              │
 │  DocumentRepository          │
 │  TicketRepository            │
 │  SettingsRepository          │
 │  IngestionStateRepository    │
 └──────────────────────────────┘
         |
         v
 ┌──────────────────────────────┐
 │      DATABASE LAYER          │
 │  Chatbot DB (read/write)     │
 │  Helpdesk DB (read-only)     │
 │  Qdrant (vector store)       │
 └──────────────────────────────┘
         |
         v
 ┌──────────────────────────────┐
 │   EXTERNAL SERVICES          │
 │  Groq API (LLM inference)    │
 │  BizPortal API (auth/tickets)│
 └──────────────────────────────┘
```

### Major Subsystems

1. **Chat Subsystem** — Session management, message persistence, history retrieval.
2. **RAG Pipeline** — Query reformulation, federated vector search, reranking, answer generation.
3. **Ingestion Subsystem** — PDF processing, manual entry, ticket sync, chat learning.
4. **Escalation Subsystem** — Draft generation (two LLM calls), routing prediction, BizPortal submission.
5. **Settings Subsystem** — Runtime AI configuration with 5-minute TTL cache.
6. **Admin Subsystem** — Knowledge explorer, analytics, maintenance (consolidation, factory reset).
7. **Auth Subsystem** — Delegated to BizPortal with in-memory 60-second token cache.

---

## 3. COMPLETE PROJECT STRUCTURE

```
app/
├── main.py                          # App factory, lifespan, middleware, route registration
├── api/
│   ├── deps.py                      # FastAPI dependency providers (auth, DB, services)
│   └── routers/
│       ├── admin_auth.py            # POST /api/admin/login
│       ├── analytics.py             # GET /api/analytics/summary
│       ├── auth.py                  # GET /api/auth/verify
│       ├── chat.py                  # /api/chat/* (main chat, sessions, escalation)
│       ├── documents.py             # /api/documents/* (PDF upload, manual entries)
│       ├── explorer.py              # /api/knowledge/* (KB explorer, FAQ, CSV export)
│       ├── maintenance.py           # /api/maintenance/* (consolidation, wipe)
│       ├── models.py                # GET /api/models/groq
│       ├── routing.py               # POST /api/routing/suggest
│       ├── self_knowledge.py        # /api/self_knowledge/chats/*
│       ├── settings.py              # /api/settings/* (AI config, themes)
│       └── tickets.py               # /api/tickets/* (list, sync, blacklist, whitelist)
├── core/
│   ├── cache.py                     # SettingsCache singleton (TTL-based)
│   ├── config.py                    # Pydantic Settings (env vars)
│   ├── database.py                  # SQLAlchemy engine + session factories (2 DBs)
│   ├── exceptions.py                # Custom exception hierarchy + handlers
│   ├── logging.py                   # JSON formatter + request-ID filter
│   ├── metadata_contract.py         # Qdrant payload schema + doc type constants
│   ├── rate_limit.py                # SlowAPI limiter
│   ├── request_context.py           # ContextVar for request_id propagation
│   └── retrieval_models.py          # RetrievalDocument DTO (Qdrant → domain object)
├── models/
│   ├── chatbot.py                   # SQLAlchemy ORM — Chatbot DB tables
│   └── helpdesk.py                  # SQLAlchemy ORM — Helpdesk DB tables (read-only)
├── repositories/
│   ├── chat_repository.py           # ChatSession, ChatMessage CRUD
│   ├── document_repository.py       # UploadedDocument, ManualKnowledgeEntry, LearnedChat CRUD
│   ├── ingestion_state_repository.py # IngestionSyncState (dedup hashes)
│   ├── settings_repository.py       # AIChatbotSetting CRUD + cache integration
│   └── ticket_repository.py         # TicketEvaluation, BlacklistedTicket CRUD
├── schemas/
│   ├── analytics.py                 # Analytics summary schema
│   ├── chat.py                      # ChatRequest, ChatResponse, history schemas
│   ├── documents.py                 # Document CRUD schemas
│   ├── knowledge.py                 # KB explorer schemas
│   ├── models.py                    # GroqModelResponse
│   ├── routing.py                   # RoutingRequest, RoutingResponse
│   ├── self_knowledge.py            # LearnedChatUpdateRequest
│   ├── settings.py                  # SettingsResponse, SettingsUpdate, theme schemas
│   └── tickets.py                   # Ticket CRUD and escalation schemas
├── services/
│   ├── llm_client.py                # Centralized ChatGroq factory + retry/telemetry wrapper
│   ├── prompts.py                   # All LLM prompt templates (single source of truth)
│   ├── telemetry_service.py         # Async queue-based LLM usage logging
│   ├── analytics/
│   │   └── analytics_service.py     # KPI aggregation from both DBs
│   ├── chat/
│   │   ├── escalation_service.py    # Draft + submit ticket escalation
│   │   ├── message_service.py       # Message persistence + history
│   │   └── session_manager.py       # Chat session lifecycle
│   ├── external/
│   │   ├── bizportal_client.py      # HTTP client for BizPortal API
│   │   └── user_service.py          # Auth token resolution + 60s cache
│   ├── ingestion/
│   │   ├── chat_learning_processor.py # Ingest resolved chat sessions
│   │   ├── chunking_service.py      # Text splitter wrapper
│   │   ├── document_processor.py    # PDF soft-delete/restore/update
│   │   ├── embedding_service.py     # Async embedding helper
│   │   ├── ingestion_service.py     # Facade — delegates to sub-processors
│   │   ├── manual_entry_processor.py # Manual KB entry CRUD + vectors
│   │   ├── pdf_processor.py         # PDF extraction, classification, chunking, embedding
│   │   └── ticket_processor.py      # Resolved ticket ingestion
│   ├── maintenance/
│   │   ├── consolidation_task.py    # Merge similar ticket clusters
│   │   ├── job_manager.py           # In-memory background job tracker
│   │   └── maintenance_service.py   # Consolidation orchestration
│   ├── rag/
│   │   ├── answer_generator.py      # Final LLM answer generation
│   │   ├── query_reformulator.py    # Bilingual query rewriting
│   │   └── support_orchestrator.py  # Main RAG pipeline coordinator
│   ├── resolution/
│   │   └── conversation_resolver.py # (Legacy conversation resolution helper)
│   ├── retrieval/
│   │   ├── embedding_provider.py    # lru_cache-based HuggingFace model loader
│   │   ├── reranker_service.py      # CrossEncoder reranking + Sigmoid scoring
│   │   └── vector_store.py          # VectorStoreService — all Qdrant operations
│   ├── routing/
│   │   └── routing_engine.py        # RAC routing pipeline
│   ├── settings/
│   │   ├── runtime_config.py        # Runtime AI config accessor (model names, prompts)
│   │   └── settings_service.py      # Settings CRUD service
│   └── taxonomy/
│       └── taxonomy_service.py      # Live taxonomy fetch from BizPortal + cache
├── utils/
│   ├── http_utils.py                # safe_json() response parser
│   ├── json_utils.py                # LLM JSON cleaning + safe parse
│   └── text_utils.py                # normalize_text(), sha256_hash()
└── external/
    └── groqapi.py                   # (Minimal file — direct Groq SDK usage)
```

### Folder Responsibilities

| Folder | Purpose |
|---|---|
| `api/` | HTTP boundary — routers and dependency injection only |
| `core/` | Cross-cutting infrastructure: config, DB, exceptions, logging, caching |
| `models/` | SQLAlchemy ORM table definitions |
| `repositories/` | All SQL query logic, one class per aggregate |
| `schemas/` | Pydantic request/response schemas |
| `services/` | All business logic, organized by domain |
| `utils/` | Pure utility functions with no domain dependencies |

---

## 4. FILE-BY-FILE DOCUMENTATION

### `app/main.py`

**Purpose:** Application factory and startup/shutdown lifecycle manager.

**Responsibilities:**
- Creates the FastAPI app via `create_app()`
- Registers all 12 routers under `/api` prefix
- Adds CORS middleware, rate limit handler, and custom HTTP middleware
- Runs lifespan startup: Qdrant connection check, vector store preparation, SupportOrchestrator initialization, DocumentIngestionService initialization
- Exposes `GET /health` endpoint

**Important Logic:**
- `app.state.ai_available = False` is the safe default; set to `True` only after successful AI init. This allows auth and health routes to remain alive even if AI init fails.
- Qdrant vector store preparation (`backfill_active_metadata`, payload index creation) is run as a background asyncio task to avoid blocking startup.
- `request_context_middleware` assigns a request_id to every request for log correlation.

**Risks:** The `SupportOrchestrator` is created with a DB session that is closed after startup. This means its initial settings snapshot is taken at startup time. If settings change in the DB, the orchestrator reloads them per-request from the `SettingsCache`.

---

### `app/core/config.py`

**Purpose:** All application configuration via Pydantic Settings from environment variables / `.env` file.

**Key Settings:**

| Variable | Required | Default | Description |
|---|---|---|---|
| `GROQ_API_KEY` | Yes | — | Groq LLM API key |
| `QDRANT_URL` | Yes | — | Qdrant instance URL |
| `QDRANT_API_KEY` | Yes | — | Qdrant authentication key |
| `HELPDESK_DB_CONN` | Yes | — | SQL Server connection string (Helpdesk DB) |
| `CHATBOT_DB_CONN` | Yes | — | SQL Server connection string (Chatbot DB) |
| `QDRANT_COLLECTION` | No | `LemonSquareQdrant` | Main vector collection name |
| `QDRANT_ROUTING_COLLECTION` | No | `LemonSquareRouting` | Routing vector collection name |
| `EMBEDDING_MODEL` | No | `intfloat/multilingual-e5-large` | HuggingFace embedding model |
| `RERANKER_MODEL` | No | `cross-encoder/ms-marco-MiniLM-L-6-v2` | Cross-encoder reranker |
| `CLASSIFIER_MODEL` | No | `llama-3.1-8b-instant` | Default fast model |
| `ALLOW_TEST_AUTH` | No | `False` | Enable TEST_USER_* bypass tokens |
| `CORS_ORIGINS` | No | `["http://localhost:8501"]` | Allowed origins |
| `BIZPORTAL_API_URL` | No | Hardcoded URL | User detail endpoint |
| `BIZPORTAL_LOGIN_URL` | No | Hardcoded URL | Admin login endpoint |
| `BIZPORTAL_TICKET_URL` | No | Hardcoded URL | Ticket submission endpoint |
| `BIZPORTAL_DEPT_URL` | No | Hardcoded URL | Departments list endpoint |
| `BIZPORTAL_SUBCAT_URL` | No | Hardcoded URL | Subcategories endpoint |
| `DB_POOL_SIZE` | No | 20 | SQLAlchemy pool size |
| `MAX_UPLOAD_MB` | No | 25 | Max PDF upload size |
| `SETTINGS_CACHE_TTL_SECONDS` | No | 300 | AI settings cache TTL |
| `TAXONOMY_CACHE_TTL_SECONDS` | No | 1800 | Taxonomy cache TTL |

---

### `app/core/database.py`

**Purpose:** Dual-database SQLAlchemy engine and session factory setup.

**Two Databases:**
- `engine_helpdesk` / `SessionHelpdesk` — Read-only Helpdesk DB
- `engine_chatbot` / `SessionChatbot` — Read/write Chatbot DB

Both engines use `pool_pre_ping=True`, `pool_recycle=1800`, and configurable pool sizes.

**Generator Functions:** `get_chatbot_db()` and `get_helpdesk_db()` are FastAPI dependency generators that yield a session and close it in the `finally` block.

---

### `app/core/exceptions.py`

**Purpose:** Custom exception hierarchy and global FastAPI exception handlers.

**Exception Hierarchy:**
```
AppException (base, 500)
├── NotFoundError (404)
├── AuthenticationError (401)
├── AuthorizationError (403)
├── ValidationError (422)
└── ExternalServiceError (503)
    └── LLMRateLimitError (429)
VectorStoreError (500)
AIProcessingError (500)
```

**Handlers:**
- `AppException` handler — returns `{"error": detail}` JSON with appropriate status. Logs 5xx as ERROR, 4xx as WARNING.
- Catch-all `Exception` handler — returns generic 500 with CRITICAL log.

---

### `app/core/logging.py`

**Purpose:** JSON-structured logging with request ID correlation.

**Components:**
- `RequestContextFilter` — injects `request_id` from `ContextVar` into every log record.
- `JsonFormatter` — outputs `{timestamp, level, logger, message, request_id, exception?}` JSON.
- `configure_logging()` — replaces root logger handlers; suppresses verbose loggers (sqlalchemy.engine, httpx, sentence_transformers, transformers).

---

### `app/core/cache.py`

**Purpose:** Thread-safe singleton TTL cache for `AIChatbotSetting`.

**Key Design:** Double-checked locking pattern — checks TTL once outside the lock and once inside for thread safety. Uses `_snapshot_settings()` to detach the ORM object from its session before storing, preventing lazy-load issues.

**TTL:** Configurable via `SETTINGS_CACHE_TTL_SECONDS` (default 300 seconds).

---

### `app/core/metadata_contract.py`

**Purpose:** Single source of truth for all Qdrant payload schemas.

**Doc Type Constants:**
- `raw_ticket` — Individual helpdesk ticket
- `canonical_ticket_cluster` — Merged cluster of similar tickets
- `resolved_chat` — AI-learned knowledge from resolved chat
- `official_document` — PDF document chunk
- `general_text` — Manual knowledge entry

**Knowledge Type Constants:** `ticket`, `chat`, `manual`, `pdf`

**Builder Functions:** `build_ticket_metadata()`, `build_chat_metadata()`, `build_manual_metadata()`, `build_pdf_metadata()` — all call `normalize_metadata()` which sets safe defaults for all required fields.

---

### `app/core/retrieval_models.py`

**Purpose:** DTO layer between raw Qdrant search results and the RAG pipeline.

**`RetrievalDocument` dataclass:** Wraps a Qdrant hit into a domain object with typed property accessors (`doc_type`, `source_name`, `source_id`, `cluster_key`, `frequency`, `is_document`, `is_ticket_like`).

**`format_for_prompt()`:** Returns a formatted string for the LLM context — official documents get `[SOURCE: OFFICIAL DOCUMENT]` prefix, ticket-like documents get `[SOURCE: RESOLVED KNOWLEDGE]`.

---

### `app/api/deps.py`

**Purpose:** All FastAPI dependency providers in one place.

**Key Dependencies:**

| Dependency | Returns | Notes |
|---|---|---|
| `get_orchestrator(request)` | `SupportOrchestrator` | From `app.state` |
| `get_ingestion_service(request)` | `DocumentIngestionService` | From `app.state` |
| `get_current_user(request, credentials)` | `dict` | BizPortal auth; falls back to hardcoded user #9999 if no token |
| `require_admin_user(current_user)` | `dict` | Calls `_is_admin_user()` — currently any user with an `id` passes |
| `get_display_name(user)` | `str` | `firstname lastname` or username |

**Security Note:** `_is_admin_user()` currently passes any user with an `id` field. A comment in the code confirms this is a placeholder: "every user ay admin." Real role-based access control is not yet implemented.

**Authentication Fallback:** If no Bearer token, `X-User-Token`, or `X-User-ID` header is present, the user is set to the hardcoded fallback `{id: 9999, username: "jzaru", role: "admin"}`. This is a significant security gap.

---

### `app/api/routers/chat.py`

**Purpose:** All chat-related HTTP endpoints.

**Key Route:** `POST /api/chat` — The primary endpoint. Authenticates via `user_token` in the request body (not a header), creates/retrieves a session, persists the user message, calls the RAG orchestrator, persists the AI response, and maps the orchestrator's `action` to UI flags (`show_resolution_prompt`, `allow_ticket_submission`, `conversation_status`).

**Known Bug:** `GET /api/chat/history/{session_id}` contains `user_data = Samuel` — this is dead code / a placeholder that will cause a `NameError` if this route is called. `user_id` is hardcoded to `67`.

**Action Mapping:**

| Orchestrator Action | UI Flags |
|---|---|
| `show_ticket` | `allow_ticket_submission=True`, status=`need_ticket` |
| `show_resolve` | `show_resolution_prompt=True`, status=`resolved_candidate` |
| `open_draft` | Drafting ticket mode |
| `none` | Normal active conversation |

---

### `app/api/routers/documents.py`

**Purpose:** PDF upload, manual knowledge entry, and document management endpoints.

**PDF Upload Flow:** File is streamed to a temp file (with per-chunk size validation), a background job is created, and processing runs in a background task guarded by an `asyncio.Semaphore(MAX_CONCURRENT_UPLOADS)`.

**Duplicate Detection:** Checks `UploadedDocument.FileName` uniqueness before processing. If a duplicate is detected, returns 400.

**Soft vs Hard Delete:** Soft delete sets `IsActive=False` in both SQL and Qdrant. Hard delete physically removes from both.

---

### `app/api/routers/tickets.py`

**Purpose:** Helpdesk ticket management (list, blacklist, sync, bulk sync).

**Notable:** `POST /api/tickets/bulk-sync` triggers a background task that imports and calls `scripts.ingest_tickets.run_ingestion`. This script is not in the provided source — existence is referenced but file is not included in the zip.

---

### `app/api/routers/settings.py`

**Purpose:** AI runtime configuration management and per-user theme preferences.

**Theme Resolution:** `resolve_user_id()` tries to parse `X-User-Token` header as an integer; falls back to user `11318`. This means the theme system uses integer user IDs as tokens, bypassing real authentication.

---

### `app/models/chatbot.py`

**Purpose:** All SQLAlchemy ORM models for the Chatbot database (read/write).

**Tables:**

| Table | Model | Description |
|---|---|---|
| `ChatSession` | `ChatSession` | Chat session with status lifecycle |
| `ChatMessage` | `ChatMessage` | Individual messages; FK to ChatSession |
| `AIChatbot_Settings` | `AIChatbotSetting` | AI configuration (one active row) |
| `UserThemePreferences` | `UserThemePreference` | Per-user UI theme settings |
| `tbl_uploaded_documents` | `UploadedDocument` | PDF document metadata |
| `tbl_blacklisted_tickets` | `BlacklistedTicket` | Excluded tickets |
| `tbl_manual_knowledge` | `ManualKnowledgeEntry` | Manually authored KB entries |
| `tbl_learned_chats` | `LearnedChat` | AI-extracted knowledge from resolved chats |
| `tbl_knowledge_cluster_map` | `KnowledgeClusterMap` | Source→cluster ID mapping |
| `tbl_ticket_routing_log` | `TicketRoutingLog` | Routing prediction audit log |
| `tbl_ingestion_sync_state` | `IngestionSyncState` | Content hash dedup for ingestion |

---

### `app/models/helpdesk.py`

**Purpose:** SQLAlchemy ORM models for the Helpdesk database (read-only).

| Table | Model | Description |
|---|---|---|
| `tbl_ticket_evaluation` | `TicketEvaluation` | Resolved tickets with issue/work_done |
| `tbl_ticket_header` | `TicketHeader` | Ticket metadata for routing taxonomy |

**Critical:** These models must never be written to by this application. The helpdesk DB is an external system.

---

### `app/services/rag/support_orchestrator.py`

**Purpose:** The core RAG pipeline. Composes sub-components into a complete request-handling flow.

**RAG Pipeline Steps:**

1. **Interview State Interceptor** — If `SessionStatus == "Drafting_Ticket"`, routes to escalation instead of RAG.
2. **Settings Load** — Reads active config from `SettingsRepository` (cached).
3. **Query Reformulation** — `QueryReformulator.reformulate()` uses `llama-3.1-8b-instant` to produce a bilingual (English + Taglish) version of the query.
4. **Embedding** — `HuggingFaceEmbeddings.embed_query()` run in a thread.
5. **Federated Vector Search** — `VectorStoreService.federated_search_async()` runs two Qdrant searches concurrently (tickets and documents).
6. **Optional Reranking** — `RerankerService.rerank()` applies cross-encoder scoring if `UseReranker=True`.
7. **Confidence Filtering** — Documents below the confidence threshold are discarded.
8. **Answer Generation** — `AnswerGenerator.generate()` calls `llama-3.3-70b-versatile` with system prompt + context.
9. **JSON Parsing** — Output is expected as `{response, action, resolution_message}` JSON; falls back to plain text.

**Returns:** `(display_text, action, resolution_message, ticket_ids, debug_info)`

---

### `app/services/llm_client.py`

**Purpose:** Centralized LLM factory with retry, telemetry, and caching.

**`create_llm(model, temperature)`** — Returns an `lru_cache`-backed `ChatGroq` instance. Cache key is `(model, temperature_x100)` to avoid float precision issues.

**`invoke_llm(llm, prompt, model, action, session_id)`** — Async wrapper that handles up to 3 retries on 429/502/503/504 with exponential backoff. On rate limit (429), extracts the wait time from the error message and raises `LLMRateLimitError`. Logs every call to `TelemetryService`.

**`create_main_llm()`** — Creates the main LLM by reading current settings from the database. Opens and closes its own DB session.

---

### `app/services/prompts.py`

**Purpose:** Single source of truth for all LLM prompts.

**Prompts Defined:**

| Constant | Used By | Purpose |
|---|---|---|
| `DEFAULT_SYSTEM_PROMPT` | `AnswerGenerator` | Main IT support agent persona and output format |
| `DEFAULT_REFORMULATOR_PROMPT` | `QueryReformulator` | Bilingual query translation |
| `ESCALATION_DRAFT_PROMPT` | `EscalationService` | Ticket readiness check (Main AI) |
| `TICKET_GENERATION_PROMPT` | `EscalationService` | Ticket draft generation (Instant AI) |
| `DEFAULT_ROUTING_PROMPT` | `routing_engine` | Department/subcategory prediction |
| `CONVERSATION_RESOLUTION_PROMPT` | `conversation_resolver` | Resolution action classification |
| `RESOLVED_CHAT_EXTRACTION_PROMPT` | `ChatLearningProcessor` | Knowledge extraction from chat |
| `build_consolidation_prompt()` | `consolidation_task` | Merge similar ticket clusters |
| `build_document_classifier_prompt()` | `PDFProcessor` | PDF category classification |
| `build_routing_prompt()` | `routing_engine` | Build complete routing prompt |

---

### `app/services/retrieval/vector_store.py`

**Purpose:** All Qdrant vector database operations.

**Key Methods:**

| Method | Description |
|---|---|
| `search_tickets(query_vector, limit)` | Searches `raw_ticket`, `canonical_ticket_cluster`, `resolved_chat` types |
| `search_documents(query_vector, limit)` | Searches `official_document`, `general_text` types |
| `federated_search_async(query_vector, limit)` | Runs both searches concurrently via `asyncio.gather()` |
| `search_ticket_clusters(query_vector, limit)` | FAQ-style search on canonical clusters only |
| `list_top_ticket_clusters(limit)` | Scrolls all clusters and sorts by `frequency` metadata |
| `soft_delete_by_metadata(key, value)` | Sets `metadata.is_active=False` |
| `restore_by_metadata(key, value)` | Sets `metadata.is_active=True` |
| `delete_ticket_vectors(ticket_number)` | Deletes by `ticket_number`, `source_id`, or `source_ids` (OR filter) |
| `hard_delete_by_source_id(source_id)` | Physical deletion by `source_id` |
| `wipe_all_except_tickets()` | Deletes all vectors not of `knowledge_type=ticket` |
| `prepare_collection()` | Creates payload indices + backfills `is_active` field |

**Active Filtering:** All searches filter by `metadata.is_active == True`, enabling soft-delete without physical vector removal.

**Shared Singleton:** `get_shared_vector_store()` is an `lru_cache(maxsize=1)` function ensuring one `VectorStoreService` per process.

---

### `app/services/retrieval/reranker_service.py`

**Purpose:** Cross-encoder reranking with Sigmoid score normalization.

**Important:** Raw cross-encoder logits are passed through `1 / (1 + exp(-score))` to produce 0–1 probability scores. This is crucial because the `confidence_threshold` in the orchestrator assumes 0–1 probability space. The default threshold is `0.15` when reranker is enabled.

---

### `app/services/ingestion/ingestion_service.py`

**Purpose:** Facade that preserves the public interface used by all routers and dispatches to focused sub-processors.

**Properties Exposed:** `qdrant` (raw QdrantClient), `embeddings`, `collection_name` — these are accessed by the routing engine through dependency injection.

**All methods are thin delegators** — they import and instantiate the appropriate processor class on each call.

---

### `app/services/ingestion/pdf_processor.py`

**PDF Ingestion Pipeline:**
1. Validate PDF magic bytes (`%PDF-`)
2. Extract text using `pypdf.PdfReader` (in thread)
3. Classify document category — AI-based if no manual category provided (calls `llama-3.1-8b-instant`)
4. Generate deterministic `document_id` via SHA256 + UUID5
5. Chunk text via `ChunkingService`
6. Embed chunks via `EmbeddingService`
7. Build `PointStruct` objects with `build_pdf_metadata()` payload
8. Upsert to Qdrant
9. Insert to `tbl_uploaded_documents`

**Rollback Safety:** If SQL insert fails after Qdrant upsert, attempts to delete the already-upserted vectors.

---

### `app/services/chat/escalation_service.py`

**Two-Phase Escalation Draft:**

**Phase 1 (Main AI — 70B):** Uses `ESCALATION_DRAFT_PROMPT` to evaluate transcript readiness. Returns `{is_ready, extracted_state, chat_message}`. If `is_ready=false`, sets session to `Drafting_Ticket` status and returns a pushback message asking for missing details.

**Phase 2 (Instant AI — 8B):** Uses `TICKET_GENERATION_PROMPT` to generate `{summary, description, location, equipment}`.

**Phase 3 (Routing):** Calls `suggest_route()` to predict department/subcategory using the `QDRANT_ROUTING_COLLECTION`.

**Draft Cache:** Results are cached in-memory per `session_id` for 60 seconds to prevent duplicate LLM calls.

**Draft Locks:** Per-session `asyncio.Lock` prevents concurrent drafts for the same session.

**BizPortal Submission:** Builds multipart form payload with conditional logic: departments 87/85/40 (LMD/Motorpool/TSD) get `location` and `equipment` as separate fields; ICT (29) and TMG (81) get them appended to the description.

---

### `app/services/external/user_service.py`

**Purpose:** Resolves auth tokens to user details via BizPortal with LRU cache.

**Token Cache:** `OrderedDict` with max 2048 entries, 60-second TTL. Uses `asyncio.Lock` for thread safety. Implements LRU eviction.

**Test Auth Bypass:** If `ALLOW_TEST_AUTH=True`, tokens starting with `TEST_USER_` or `TEST_ADMIN_` resolve locally without hitting BizPortal.

**Response Parsing:** Handles three BizPortal response formats: `{status: success, response: {...}}`, direct user object, and error response.

---

### `app/services/routing/routing_engine.py`

**RAC Pipeline:**
1. Embed `"ISSUE: {summary}\nDETAILS: {description}"` as query
2. Search `QDRANT_ROUTING_COLLECTION` for 5 similar historical tickets
3. Fetch live taxonomy from BizPortal
4. Call LLM with routing prompt including taxonomy + retrieved context
5. Validate predicted `department_id`/`subcategory_id` against live taxonomy
6. If taxonomy validation fails, fallback to ICT/OTHERS (dept 29, subcat 11200)
7. Log to `tbl_ticket_routing_log`

---

### `app/services/settings/settings_service.py`

**Settings Update Strategy:** Never mutates an existing row. Deactivates all current settings (`IsActive=False`) and inserts a new row as the active one. This provides a full audit trail but means all old rows remain in the DB.

**`restore_default_settings()`:** Copies from `SettingID=2` — this is a hardcoded sentinel ID. If that row doesn't exist, it raises `NotFoundError`.

---

### `app/services/telemetry_service.py`

**Purpose:** Non-blocking LLM usage logging via an async queue.

**Architecture:** `TelemetryService` puts entries into an in-memory `asyncio.Queue(maxsize=10_000)`. A background `asyncio.Task` drains the queue by running DB writes in `asyncio.to_thread()`. Queue-full events are silently dropped (logged at DEBUG level).

**Note:** The `LLMUsageLog` model import is guarded by a `try/except ImportError` — the table is optional in current deployments. If the model doesn't exist, telemetry silently no-ops.

---

## 5. ARCHITECTURE ANALYSIS

### Architectural Pattern

**Layered Architecture** with domain service groupings.

```
HTTP Layer      → app/api/routers/
DI Layer        → app/api/deps.py
Service Layer   → app/services/
Repository Layer → app/repositories/
ORM Layer       → app/models/
DB Layer        → Two SQL Server instances + Qdrant
```

### Evidence from Code

- Routers contain no business logic — they only validate input, call services, and format responses.
- Repositories centralize all SQL queries (comment in each: "previously scattered across...").
- Services are injected via `app.state` (long-lived singleton services) or constructed per-request.
- The `metadata_contract.py` enforces a shared vocabulary between the ingestion pipeline and the retrieval pipeline.

### Coupling Analysis

**Tight Coupling (Risks):**
- `deps.py` directly accesses `request.app.state` — tightly coupled to FastAPI's state pattern.
- `EscalationService` imports `suggest_route` and instantiates `get_shared_vector_store()` directly rather than receiving them via DI.
- Several routers import models directly (e.g., `documents.py` queries `UploadedDocument` inline without going through the repository).

**Loose Coupling (Strengths):**
- `DocumentIngestionService` is a pure facade — routers never know about sub-processors.
- `SupportOrchestrator` accepts its sub-components at construction time.
- `metadata_contract.py` decouples ingestion from retrieval.

---

## 6. REQUEST LIFECYCLE ANALYSIS

### Standard Chat Request: POST /api/chat

```
1. HTTP Request arrives
2. CORSMiddleware: Add CORS headers
3. request_context_middleware: Set request_id ContextVar, start timer
4. Rate limiter: Check 20/minute per IP
5. FastAPI routing: Match to handle_chat()
6. FastAPI DI resolution:
   a. get_chatbot_db() → Open SQLAlchemy session
   b. get_orchestrator(request) → Return app.state.orchestrator
7. Handler: fetch_user_details(chat_request.user_token)
   → BizPortalClient.fetch_user_details() [with 60s cache]
   → Returns user dict with id, firstname, lastname
8. SessionManager(db).get_or_create(session_id, user_id, user_name)
   → ChatRepository.get_or_create_session()
   → SQL INSERT or SELECT
9. MessageService(db).save_user_message(session_id, message, user_name)
   → ChatRepository.save_message()
   → SQL INSERT + UPDATE LastActive
10. MessageService(db).get_history_text(session_id)
    → ChatRepository.get_recent_history_text()
    → SQL SELECT last 6 messages
11. orchestrator.orchestrate(session_id, query, history, user_name, db)
    a. Check SessionStatus for Drafting_Ticket intercept
    b. SettingsRepository.get_active_settings() [with 300s cache]
    c. QueryReformulator.reformulate() → Groq API (llama-3.1-8b-instant)
    d. embeddings.embed_query() → HuggingFace model [in thread]
    e. VectorStoreService.federated_search_async()
       → Two concurrent Qdrant searches (tickets + documents)
    f. Optional: RerankerService.rerank() [in thread]
    g. Confidence threshold filtering
    h. AnswerGenerator.generate() → Groq API (llama-3.3-70b-versatile)
    i. Parse JSON output: {response, action, resolution_message}
12. MessageService(db).save_ai_message(session_id, display_text)
    → SQL INSERT
13. Map action → UI flags (show_resolution_prompt, allow_ticket_submission)
14. Return ChatResponse JSON
15. response_context_middleware: Log latency, set X-Request-ID header
16. DB session closed by dependency generator finally block
```

---

## 7. ROUTES AND API DOCUMENTATION

### Auth

| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | `/api/auth/verify?user_token=` | Verify token and return user details | No |
| POST | `/api/admin/login` | Admin login via BizPortal | No |

### Chat

| Method | Path | Description | Auth Required |
|---|---|---|---|
| POST | `/api/chat` | Send a message, get AI response | user_token in body |
| GET | `/api/chat/history/{session_id}?user_token=` | Get chat message history | Yes (has bug) |
| GET | `/api/chat/user-sessions/{requester_id}` | List user's chat sessions | Bearer Token |
| GET | `/api/chat/all-sessions` | List all sessions (admin) | Admin |
| POST | `/api/chat/resolve/{session_id}` | Mark chat resolved, ingest knowledge | No |
| GET | `/api/chat/escalate/draft/{session_id}` | Generate ticket draft from chat | No |
| POST | `/api/chat/escalate/submit` | Submit ticket to BizPortal | No |
| DELETE | `/api/chat/sessions/{session_id}` | Archive a chat session | No |
| DELETE | `/api/chat/users/{requester_id}/sessions` | Archive all user sessions | Admin |
| GET | `/api/chat/taxonomy` | Get live department/subcategory taxonomy | No |
| GET | `/api/chat/{session_id}/check-resolution` | Check if resolution buttons should show | No |

### Documents

| Method | Path | Description | Auth Required |
|---|---|---|---|
| POST | `/api/documents/upload` | Upload and ingest PDF | Admin |
| GET | `/api/documents/upload/status/{job_id}` | Get background job status | No |
| GET | `/api/documents` | List uploaded documents | No |
| DELETE | `/api/documents/{document_id}` | Soft-delete document | Admin |
| DELETE | `/api/documents/hard/{document_id}` | Hard-delete document | Admin |
| POST | `/api/documents/{document_id}/restore` | Restore soft-deleted document | Admin |
| PUT | `/api/documents/{document_id}` | Update document metadata | Admin |
| POST | `/api/documents/manual` | Add manual knowledge entry | Admin |
| GET | `/api/documents/manual` | List manual knowledge entries | No |
| PUT | `/api/documents/manual/{entry_id}` | Update manual entry | Admin |
| DELETE | `/api/documents/manual/{entry_id}` | Soft-delete manual entry | Admin |
| DELETE | `/api/documents/manual/hard/{entry_id}` | Hard-delete manual entry | Admin |
| POST | `/api/documents/manual/{entry_id}/restore` | Restore manual entry | Admin |
| POST | `/api/documents/debug/full-pipeline` | Debug full RAG pipeline | Admin |

### Tickets

| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | `/api/tickets` | List resolved helpdesk tickets | No |
| DELETE | `/api/tickets/{ticket_number}` | Blacklist ticket and delete vectors | Admin |
| POST | `/api/tickets/sync` | Sync a single resolved ticket | No |
| POST | `/api/tickets/{ticket_number}/whitelist` | Remove from blacklist and re-ingest | No |
| POST | `/api/tickets/bulk-sync` | Trigger background bulk sync | No |

### Settings

| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | `/api/settings` | Get active AI configuration | Admin |
| POST | `/api/settings` | Update AI configuration | Admin |
| POST | `/api/settings/default` | Restore to system defaults | Admin |
| GET | `/api/settings/factory-defaults` | Get hardcoded factory defaults | Admin |
| GET | `/api/settings/theme` | Get user theme preferences | By X-User-Token |
| PUT | `/api/settings/theme` | Update user theme preferences | By X-User-Token |

### Knowledge Explorer

| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | `/api/knowledge/explore` | Browse knowledge base | No |
| GET | `/api/knowledge/faqs` | Semantic FAQ cluster search | No |
| GET | `/api/knowledge/export/learned-chats` | Export resolved chats as CSV | No |

### Other

| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | `/api/analytics/summary` | KPI dashboard metrics | No |
| POST | `/api/maintenance/consolidate` | Trigger knowledge consolidation | Admin |
| GET | `/api/maintenance/consolidate/status` | Consolidation job status | No |
| DELETE | `/api/maintenance/wipe-all` | Factory reset knowledge (irreversible) | Admin |
| POST | `/api/routing/suggest` | Predict ticket routing | No |
| PUT | `/api/self_knowledge/chats/{session_id}` | Edit AI-learned chat summary | No |
| DELETE | `/api/self_knowledge/chats/{session_id}` | Delete AI-learned chat | No |
| POST | `/api/self_knowledge/chats/{session_id}/restore` | Restore deleted learned chat | No |
| GET | `/api/models/groq` | List available Groq models | Admin |
| GET | `/health` | Health check | No |

---

## 8. DATABASE DOCUMENTATION

### Chatbot Database (Read/Write)

**ChatSession**
- PK: `SessionID` (UUID string)
- `RequesterUserID` (BigInt) — links to BizPortal user ID
- `SessionStatus`: `Active` | `Resolved` | `Escalated` | `Archived` | `Drafting_Ticket`
- Relationship: `messages` → `ChatMessage` (cascade delete)

**ChatMessage**
- PK: `MessageID` (BigInt autoincrement)
- FK: `SessionID` → `ChatSession`
- `SenderRole`: `user` | `ai`
- `SenderName`: user's display name or "Assistant"

**AIChatbot_Settings**
- PK: `SettingID` (Int autoincrement)
- Single active row pattern — `IsActive` flag
- Stores all AI configuration: models, prompts, temperature, thresholds, UI theme defaults
- Audit: `UpdatedBy`, `UpdatedByUsername`

**UserThemePreferences**
- PK: `PreferenceID`; Unique: `UserID`
- Per-user UI theme overrides (bubble theme, gradient colors, accent colors)

**tbl_uploaded_documents**
- PK: `DocumentID` (UUID); Unique: `FileName`
- Tracks PDF ingestion: category, chunk count, active status, upload/update audit trail

**tbl_blacklisted_tickets**
- PK: `TicketNumber` (String 15)
- Prevents blacklisted tickets from being re-ingested or used in RAG

**tbl_manual_knowledge**
- PK: `EntryID` (UUID)
- Admin-authored knowledge: title, content, category, full audit trail, soft-delete

**tbl_learned_chats**
- PK: `SessionID` (UUID)
- AI-extracted knowledge: issue_reported, issue_found, root_cause, work_done

**tbl_knowledge_cluster_map**
- PK: `SourceID`
- Maps individual sources (ticket IDs, session IDs) to their cluster keys in Qdrant

**tbl_ticket_routing_log**
- PK: `LogID` (UUID)
- Audit log for every routing prediction with confidence and reasoning

**tbl_ingestion_sync_state**
- PK: `EntityKey` (String 256)
- Content hash dedup: prevents re-ingesting unchanged tickets

### Helpdesk Database (Read-Only)

**tbl_ticket_evaluation** — Resolved ticket data (issue_reported, work_done, etc.)

**tbl_ticket_header** — Ticket metadata for routing taxonomy building

### Qdrant Collections

**Primary Collection (`QDRANT_COLLECTION`):**
- Stores vectors for all knowledge types: tickets, clusters, chats, PDFs, manual entries
- Payload schema follows `metadata_contract.py`
- Filtered by `metadata.is_active=True` in all searches

**Routing Collection (`QDRANT_ROUTING_COLLECTION`):**
- Stores historical ticket routing examples
- Used exclusively by the RAC routing pipeline

---

## 9. SERVICES DOCUMENTATION

### SupportOrchestrator

**Purpose:** Coordinates the complete RAG pipeline.
**Key Public Methods:** `orchestrate()`, `debug_orchestrate()`
**Singleton:** Instantiated once at startup in `app.state.orchestrator`
**Settings:** Reloaded per-request from `SettingsRepository` (cached)

### DocumentIngestionService

**Purpose:** Knowledge base ingestion facade.
**Key Public Methods:** `process_pdf_upload()`, `process_manual_entry()`, `process_resolved_ticket()`, `process_resolved_chat()`, `delete_document()`, `restore_document()`, `update_document()`, and all manual/chat CRUD variants.
**Singleton:** Instantiated once at startup in `app.state.ingestion_service`

### EscalationService

**Purpose:** Ticket escalation drafting and BizPortal submission.
**Key Method:** `draft_escalation()` — Two LLM calls + routing, with 60s cache and per-session async lock.
**Key Method:** `submit_escalation()` — Builds conditional multipart payload and POSTs to BizPortal.

### SessionManager / MessageService

**Purpose:** Thin wrappers over `ChatRepository` providing semantic method names.

### SettingsService (settings_service.py)

**Purpose:** AI configuration CRUD with immutable update strategy (new row per change).

### TaxonomyService

**Purpose:** Fetches live department/subcategory taxonomy from BizPortal with 30-minute in-memory cache. Parallelizes subcategory fetches via `asyncio.gather()`.

### AnalyticsService

**Purpose:** KPI aggregation from both databases. (File content not shown in provided source but referenced by analytics router.)

---

## 10. REPOSITORY DOCUMENTATION

### ChatRepository

**Key Queries:**
- `get_or_create_session()` — Handles null/empty session_id
- `require_session_for_update()` — Uses `with_for_update()` row lock for concurrent status transitions
- `get_recent_history_text()` — Last 6 messages, reversed, with current message excluded
- `list_user_sessions()` / `list_all_sessions()` — Aggregate query with message count via `outerjoin`

### DocumentRepository

**Key Operations:** Standard CRUD for documents, manual entries, and learned chats.
**Notable:** `truncate_owned_knowledge()` — deletes all rows from 3 tables in one commit (used by factory reset).

### TicketRepository

**Dual Database:** Requires both `db_chatbot` and `db_helpdesk` sessions.
**Key Method:** `get_blacklisted_numbers()` returns a `set[str]` for O(1) lookup.

### SettingsRepository

**Key Pattern:** `get_active_settings()` uses `SettingsCache` (TTL-based); `get_active_settings_uncached()` bypasses cache (used by cache itself).
**`create_new_active_settings()`** — Deactivates all and inserts a new active row. Invalidates cache after commit.

### IngestionStateRepository

**Purpose:** Content hash deduplication for ticket ingestion.
**SQL Server MERGE:** Detects MSSQL dialect and uses atomic `MERGE INTO` for upserts. Falls back to a retry loop for other databases.

---

## 11. AUTHENTICATION & AUTHORIZATION

### User Auth Flow

```
Client sends user_token (in request body, Bearer header, X-User-Token, or X-User-ID)
         ↓
fetch_user_details(token)
         ↓
Check in-memory token cache (60s TTL, LRU, max 2048)
  Hit → return cached user dict
  Miss → BizPortalClient.fetch_user_details(token)
         ↓
         BizPortal API GET /chatbot/user/details?user_id=&token=
         ↓
Parse response format (success/error/direct object)
         ↓
Cache result, return user dict
```

### Admin Auth Flow

```
Client POST /api/admin/login {username, password}
         ↓
BizPortalClient.admin_login(username, password)
         ↓
BizPortal API POST /chatbot/admin/login
         ↓
Validate HTTP status + logical auth fields
         ↓
Return {success, token: user.id}  ← THE TOKEN IS THE USER'S NUMERIC ID
```

**Critical Security Note:** The admin token returned is simply the user's integer ID. All subsequent authenticated calls use this numeric ID as the Bearer token, which BizPortal maps back to the user record.

### Authorization

`require_admin_user()` dependency calls `_is_admin_user(user_data)` which returns `True` for any user that has an `id` field. This means **every authenticated user is effectively an admin**. This is confirmed by a comment in the code: "since every user ay admin." Role-based access control is not implemented.

### Security Gaps

1. Fallback to user #9999 when no token is provided.
2. Admin check passes for any user with an ID.
3. Theme system uses numeric user IDs directly as "tokens."
4. No JWT validation — all token validation is delegated to BizPortal.

---

## 12. CONFIGURATION ANALYSIS

| Variable | Required | Default | Risk |
|---|---|---|---|
| `GROQ_API_KEY` | Yes | — | Must be kept secret |
| `QDRANT_URL` | Yes | — | — |
| `QDRANT_API_KEY` | Yes | — | Must be kept secret |
| `HELPDESK_DB_CONN` | Yes | — | Contains credentials |
| `CHATBOT_DB_CONN` | Yes | — | Contains credentials |
| `ALLOW_TEST_AUTH` | No | False | Critical — must be False in production |
| `CORS_ORIGINS` | No | localhost:8501 | Must be set correctly in production |
| `LOG_LEVEL` | No | INFO | Set to WARNING in production to reduce volume |
| `SETTINGS_CACHE_TTL_SECONDS` | No | 300 | Settings changes take up to 5 min to propagate |
| `TAXONOMY_CACHE_TTL_SECONDS` | No | 1800 | Taxonomy changes take up to 30 min to propagate |
| `LANGCHAIN_TRACING_V2` | No | — | Optional LangSmith tracing |

**Configuration Sources:** `.env` file (via `python-dotenv`) or environment variables. `pydantic-settings` handles parsing.

**Startup Failure:** If `GROQ_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`, `HELPDESK_DB_CONN`, or `CHATBOT_DB_CONN` are missing, the app fails to start at settings instantiation.

---

## 13. DEPENDENCY ANALYSIS

### Core Framework Dependencies

| Package | Version | Why |
|---|---|---|
| `fastapi` | 0.136.1 | Web framework |
| `uvicorn` | 0.46.0 | ASGI server |
| `pydantic` | 2.13.3 | Validation + settings |
| `pydantic-settings` | 2.14.0 | Env var configuration |
| `sqlalchemy` | 2.0.49 | ORM for both SQL DBs |
| `pyodbc` | 5.3.0 | SQL Server ODBC driver |

### AI/ML Dependencies

| Package | Version | Why |
|---|---|---|
| `langchain-groq` | 0.1.2 | Groq LLM client |
| `groq` | 0.37.1 | Direct Groq SDK |
| `langchain-huggingface` | 1.2.2 | HuggingFace embeddings |
| `sentence-transformers` | 5.4.1 | CrossEncoder reranker |
| `transformers` | 5.8.0 | Model loading |
| `torch` | 2.11.0 | Required by transformers |
| `qdrant-client` | 1.17.1 | Qdrant vector DB client |
| `langchain-qdrant` | 1.1.0 | LangChain Qdrant integration |
| `langchain-core` | 1.3.3 | LangChain base classes |
| `langgraph` | 1.1.10 | Present in requirements — not obviously used in source |

### Document Processing

| Package | Why |
|---|---|
| `pypdf` | PDF text extraction |
| `python-docx` | Word document support (referenced in requirements) |
| `aiofiles` | Async file I/O for PDF upload streaming |
| `python-multipart` | Form data / file upload parsing |

### HTTP / Networking

| Package | Why |
|---|---|
| `httpx` | Async HTTP client (BizPortal, escalation submission) |
| `aiohttp` | Async HTTP (in requirements, exact usage not confirmed in shown source) |

### Utilities

| Package | Why |
|---|---|
| `slowapi` | Rate limiting |
| `python-dotenv` | .env file loading |
| `orjson` | Fast JSON serialization |
| `tenacity` | Retry logic (in requirements — LangChain uses it internally) |

---

## 14. EXTERNAL INTEGRATIONS

### BizPortal API (Lemon Square Internal)

**Purpose:** User authentication, admin login, ticket submission, taxonomy retrieval.

**Endpoints Used:**

| URL | Method | Used By |
|---|---|---|
| `/chatbot/user/details` | GET | `user_service.py` — user auth |
| `/chatbot/admin/login` | POST | `bizportal_client.py` — admin login |
| `/helpdesk-dev/api/chatbot/send/ticket/` | POST | `escalation_service.py` — ticket submit |
| `/helpdesk-dev/api/chatbot/fetch/departments` | GET | `taxonomy_service.py` |
| `/helpdesk-dev/api/chatbot/fetch/subcategories` | GET | `taxonomy_service.py` |

**Timeout:** 3s connect, 5s read (user auth), 10s (admin login), 7s (taxonomy).

**Failure Handling:** User service raises `ExternalServiceError` on network errors. Taxonomy service falls back to cached data if available; returns `"[]"` otherwise. Escalation submission raises `httpx.HTTPStatusError` on failure.

### Groq API

**Purpose:** LLM inference for all AI features.

**Timeout:** 25 seconds per call.
**Retries:** Up to 3 retries on 429/502/503/504 with exponential backoff.
**Models Used:** `llama-3.3-70b-versatile` (main), `llama-3.1-8b-instant` (reformulator, ticket gen, routing, escalation evaluator).

### Qdrant

**Purpose:** Vector database for all knowledge storage and retrieval.

**Connection:** Shared `QdrantClient` instance via `lru_cache`.
**Collections:** Main collection + routing collection.
**Indices:** `metadata.knowledge_type`, `metadata.source_id`, `metadata.source_ids`, `metadata.ticket_number`, `metadata.is_active` — all created on startup.

### HuggingFace (Local Model)

**Purpose:** Embedding generation via `intfloat/multilingual-e5-large`.

**Note:** Model is loaded locally (no API call). First load is slow; subsequent calls use `lru_cache`. Multilingual model supports Filipino/Taglish queries.

---

## 15. ERROR HANDLING ANALYSIS

### Exception Hierarchy

All business errors inherit from `AppException` and are caught by the global handler in `exceptions.py`. The handler returns `{"error": detail}` JSON with the appropriate status code.

### LLM Error Handling

`invoke_llm()` handles:
- **Retryable (429, 502, 503, 504):** Up to 3 retries with exponential backoff.
- **Rate Limit (429):** After retries exhausted, raises `LLMRateLimitError` with extracted wait time.
- **Other errors:** Re-raised immediately.

### Ingestion Error Handling

`PDFProcessor.process()` implements compensating transactions: if SQL insert fails after successful Qdrant upsert, it attempts to delete the orphaned vectors (with its own error handling if cleanup also fails).

### Startup Failure Safety

`main.py` lifespan wraps AI initialization in `try/except`. If `SupportOrchestrator` or `DocumentIngestionService` fail to initialize, `app.state.ai_available = False` but the app continues running. Auth and health routes remain available.

### Known Unhandled Cases

- `GET /api/chat/history/{session_id}` contains `user_data = Samuel` which will raise `NameError` at runtime.
- `restore_default_settings()` hardcodes `SettingID=2` — if this row is deleted, the feature breaks.
- `_draft_cache` in `escalation_service.py` is a module-level dict, not thread-safe if multiple processes are running.

---

## 16. SECURITY REVIEW

### Finding 1 — No Real Authorization
**Severity:** High

`_is_admin_user()` in `deps.py` returns `True` for any user with an `id` field. All authenticated users can perform admin actions (upload documents, delete knowledge, wipe the entire knowledge base, change AI settings).

**Evidence:** `return bool(user_data and user_data.get("id"))` with comment "since every user ay admin."

**Recommendation:** Implement real role checks. Check `user_data.get("role")` or a dedicated `is_admin` flag returned by BizPortal.

---

### Finding 2 — Unauthenticated Fallback User
**Severity:** High

When no token is provided, `get_current_user()` returns a hardcoded user `{id: 9999, username: "jzaru"}` with a warning log. Routes that call `require_admin_user()` will accept this user since the admin check only requires an `id`.

**Evidence:** `logger.warning("No credentials provided; using fallback admin user #9999")`

**Recommendation:** Remove the fallback user. Raise `AuthenticationError` when no credentials are provided.

---

### Finding 3 — Admin Token is Numeric User ID
**Severity:** Medium

`POST /api/admin/login` returns `"token": str(possible_user.get("id"))`. The "token" is the user's integer ID. Anyone who knows another user's numeric ID can authenticate as them.

**Recommendation:** Use a real session token or JWT returned by BizPortal rather than the user ID.

---

### Finding 4 — ALLOW_TEST_AUTH
**Severity:** Critical (if enabled in production)

If `ALLOW_TEST_AUTH=True`, tokens like `TEST_ADMIN_1` grant full admin access without any BizPortal call.

**Evidence:** `user_service.py` test auth bypass block.

**Recommendation:** Ensure `ALLOW_TEST_AUTH=False` in all non-development deployments. Add a startup check that prevents the app from starting in production with this flag enabled.

---

### Finding 5 — Factory Reset with Minimal Protection
**Severity:** Medium

`DELETE /api/maintenance/wipe-all` requires only a confirmation string `"I_UNDERSTAND_THIS_IS_IRREVERSIBLE"` and admin auth (which, per Finding 1, is any authenticated user). This permanently destroys all uploaded documents, manual rules, and AI-learned chats.

**Recommendation:** Add a secondary check (e.g., requiring a specific admin role or a separate confirmation code sent out-of-band).

---

### Finding 6 — No Input Sanitization on LLM Prompts
**Severity:** Medium

User chat messages are inserted directly into LLM prompts without sanitization. This is a prompt injection risk — a malicious user could potentially influence the model's behavior.

**Recommendation:** Consider adding a prompt injection detection layer or input sanitization before inserting user content into prompts.

---

### Finding 7 — Bulk Sync Unauthenticated
**Severity:** Low-Medium

`POST /api/tickets/bulk-sync` requires no authentication and triggers a potentially long-running background process that reads from the Helpdesk database.

**Recommendation:** Add `require_admin_user` dependency.

---

### Finding 8 — SQL Injection Protection
**Severity:** Low (mitigated)

All database queries use SQLAlchemy ORM with parameterized queries. The only raw SQL is in `IngestionStateRepository._sql_server_merge_upsert()` which uses named parameters (`:EntityKey0`, etc.) — this is safe.

---

## 17. PERFORMANCE REVIEW

### Finding 1 — CPU-Bound Operations in Async Context
**Evidence:** Embedding generation and reranking are run via `asyncio.to_thread()` in `support_orchestrator.py`. PDF text extraction and chunking are also threaded.

**Impact:** Mitigated. These correctly use thread offloading.

**Recommendation:** Ensure the thread pool has sufficient capacity for concurrent requests. Consider setting `UVICORN_WORKERS > 1` or `asyncio` worker count tuning.

---

### Finding 2 — Federated Search Doubles Qdrant Calls
**Evidence:** `federated_search_async()` makes two Qdrant calls per request (tickets + documents).

**Impact:** Low latency impact as they run concurrently via `asyncio.gather()`. Twice the Qdrant network traffic.

**Recommendation:** Consider a single Qdrant query with a combined filter if Qdrant performance becomes a bottleneck.

---

### Finding 3 — LLM Cache Could Be Stale After Settings Update
**Evidence:** `create_llm()` uses `lru_cache` keyed by `(model, temperature_x100)`. If settings change the model, a new LLM client is created but old ones remain cached.

**Impact:** Low — new requests will use the new model. Old cached clients are eventually garbage collected.

---

### Finding 4 — Escalation Draft Cache is Module-Level
**Evidence:** `_draft_cache: dict[str, tuple[dict, float]] = {}` in `escalation_service.py`.

**Impact:** In a single-process deployment, this works correctly. In a multi-worker deployment (multiple Uvicorn processes), each process has its own cache and there's no cross-process cache invalidation.

---

### Finding 5 — N+1 Pattern in Taxonomy Fetch
**Evidence:** `taxonomy_service.py` fetches departments, then makes N parallel API calls for subcategories.

**Impact:** Acceptable due to `asyncio.gather()` parallelism and the 30-minute TTL cache.

---

### Finding 6 — Settings Loaded Per-Request in Orchestrator
**Evidence:** `SettingsRepository.get_active_settings()` is called inside `_run_pipeline()` on every request.

**Impact:** Mitigated by `SettingsCache` (300s TTL). After cache hit, cost is a Python function call.

---

## 18. SCALABILITY REVIEW

### Current Assessment

The application is designed for **single-process vertical scaling** with some horizontal scaling considerations:

**Stateless Elements (Horizontally Scalable):**
- HTTP request handling — no per-request in-process state
- Database sessions — per-request, properly closed
- BizPortal auth — stateless delegated auth with in-process cache

**Process-Local State (Horizontal Scaling Challenges):**
- `SettingsCache` — each process has its own cache; settings changes may be inconsistent across processes for up to 300s.
- `_token_cache` in `user_service.py` — per-process, may result in repeated BizPortal calls in multi-process deployment.
- `_draft_cache` in `escalation_service.py` — per-process, draft dedup won't work across processes.
- `_TAXONOMY_CACHE` in `taxonomy_service.py` — per-process.
- `JobManager` — in-process in-memory only; job status lost across workers.

**Background Processing:**
- `TelemetryService` uses `asyncio.Task` — works only in single-process Uvicorn.
- PDF processing uses `BackgroundTasks` — FastAPI background tasks run in the same process.

**Recommendations for Horizontal Scaling:**
- Move `SettingsCache`, `_token_cache`, and `_TAXONOMY_CACHE` to Redis.
- Move `JobManager` to Redis or a persistent queue.
- Use a task queue (Celery/ARQ) for PDF background processing.

---

## 19. CODE QUALITY REVIEW

### Strengths

1. **Clear layered architecture** — strict separation of routers, services, repositories, and models.
2. **Centralized contracts** — `metadata_contract.py`, `prompts.py`, and `retrieval_models.py` prevent duplication.
3. **Defensive AI initialization** — app stays alive even if LLM or Qdrant fails on startup.
4. **Good error handling in critical paths** — PDF processor has compensating transactions; LLM client has retry logic.
5. **JSON structured logging** with request ID correlation throughout.
6. **Singleton pattern** properly applied to expensive resources (embedding model, Qdrant client, vector store).
7. **Extensive docstrings** on services and repositories explaining refactoring history.

### Weaknesses

1. **Known bug in production code** — `user_data = Samuel` in `chat.py:get_chat_history` will crash if that route is called.
2. **Authorization not implemented** — all users are admin.
3. **Inline DB queries in routers** — `documents.py` and `explorer.py` query models directly, bypassing the repository layer.
4. **Hardcoded sentinel IDs** — `SettingID=2` in `restore_default_settings()`, fallback department ID `29`, fallback subcategory `11200`.
5. **Module-level mutable state** — `_draft_cache`, `_TAXONOMY_CACHE`, `_token_cache` as module globals.
6. **Missing `__init__.py` exports** — repository `__init__.py` is empty; imports must use full paths.
7. **Services directory lacking `analytics/`** — `analytics_service.py` is referenced in the analytics router but not present in the zip file.

### SOLID Compliance

| Principle | Status | Notes |
|---|---|---|
| Single Responsibility | Good | Each class has a clear purpose |
| Open/Closed | Good | `DocumentIngestionService` as facade allows sub-processor extension |
| Liskov Substitution | N/A | Limited inheritance |
| Interface Segregation | Good | Thin wrapper services (SessionManager, MessageService) |
| Dependency Inversion | Partial | Some services instantiate dependencies directly rather than receiving the