# Customer Complaint & Resolution Tracking System (CCRS)

A full-stack web application that manages the complete lifecycle of customer complaints — from registration through resolution — with role-based access control, automated SLA tracking, escalation management, and a two-phase analytics pipeline.

---

## Screenshots

### Dashboard
![Dashboard](images/dashboard.png)

Personalised landing page showing six live stat cards — Total Complaints, Open, In Progress, Escalated, Resolved, and SLA Breaches — each colour-coded by status.
Admin, Supervisor, and Quality Team users also see a Monthly Complaint Trends bar chart covering the last 6 months.

---

### Complaint Detail View
![Complaint Detail](images/all-complaints.png)

Full complaint view showing metadata (customer, category, SLA deadline, escalation level), description, and a chronological Activity History timeline of every status change.
The right sidebar renders role-specific action cards — Admins/Supervisors can assign agents and update status; Agents can resolve with a mandatory resolution comment.

---

### New Complaint Registration
![New Complaint Registration](images/new-complaint-registration.png)

Registration form with fields for Complaint Title, Category, Priority, and Description; the SLA info banner updates dynamically to reflect the deadline for the selected priority.
On submission the system auto-generates a unique complaint number and calculates the SLA deadline.

---

### Escalation Dashboard
![Escalation Dashboard](images/escalations-dashboard.png)

Supervisor and Admin view listing all escalated complaints with complaint number, customer, priority, escalation level, assigned agent, and SLA deadline in a single table.
A warning banner at the top alerts the team when any complaints have exceeded their SLA deadlines and need immediate attention.

---

### Reports — Overview
![Reports Overview](images/reports-overview.png)

The Overview tab of the Reports page displays a Monthly Complaint Trends bar chart and a Complaints by Category pie chart side by side.
The five-tab navigation (Overview, SLA Analysis, Resolution Trends, Agent Performance, ETL Pipeline) is visible at the top of the page.

---

### Reports — SLA Analysis
![SLA Analysis](images/sla-analysis.png)

Grouped bar chart comparing Total vs Breached complaint counts across every complaint category, powered by the ETL analytics table.
A detailed SLA Breach table below lists each category-priority combination with total count, breached count, breach rate (%), and average breach hours.

---

### Reports — Resolution Trends
![Resolution Trends](images/resolution-trends.png)

Dual-line chart tracking Average Resolution Hours (blue) and SLA Breaches (red) month-over-month; hovering a data point shows exact values for that month.
A Monthly Resolution Summary table beneath the chart provides the raw numbers for each period.

---

### Reports — Agent Performance
![Agent Performance](images/agent-performance.png)

Per-agent KPI table showing Total Assigned, Resolved, Resolution Rate (colour-coded progress bar — green ≥ 75%, amber ≥ 50%, red below), Avg Resolution Hours, and SLA Breaches.
All metrics are sourced from the ETL analytics table to reflect accurate historical data.

---

### Reports — ETL Pipeline
![ETL Pipeline](images/etl-pipeline.png)

Admin-only control panel with four status cards (Pipeline Status, Records Processed, Last Duration, Last Run timestamp) and a Run ETL Now button with a live loading spinner.
The success banner confirms the last run processed 251 records in 0.235 s; a "What ETL Populates" section below explains which report tabs the pipeline feeds.

---

### Admin — User Management
![Admin User Management](images/admin-user-management.png)

Complete user list with role summary badge counts at the top and a table showing each user's name, email, phone, role, account status, and join date.
Each row has a one-click Activate / Deactivate toggle for instant account management without touching the database.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Phase 1 — Core System](#phase-1--core-system)
5. [Phase 2 — Analytics & ETL](#phase-2--analytics--etl)
6. [Roles & Permissions](#roles--permissions)
7. [Complaint Lifecycle](#complaint-lifecycle)
8. [SLA Policy](#sla-policy)
9. [ETL Pipeline](#etl-pipeline)
10. [API Reference](#api-reference)
11. [Data Models](#data-models)
12. [Project Structure](#project-structure)
13. [Getting Started](#getting-started)
14. [Environment Variables](#environment-variables)
15. [Demo Accounts](#demo-accounts)

---

## Project Overview

CCRS is built to give organizations a structured way to receive, track, and resolve customer complaints. It enforces SLA deadlines based on complaint priority, escalates breached complaints, and gives management a data-driven view of team performance through an ETL-powered analytics layer.

**Key capabilities:**
- Customers submit complaints and track their status in real time
- Support agents manage a personal work queue with SLA visibility
- Supervisors and Admins assign, escalate, and monitor all complaints
- The analytics pipeline computes SLA breaches, resolution trends, and agent KPIs from raw complaint data
- A dedicated ETL control panel lets Admins refresh the analytics table on demand

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + React Router 6 | Single-page application with client-side routing |
| **UI Components** | Lucide React + Recharts | Professional icons and interactive charts |
| **HTTP Client** | Axios | API calls with JWT interceptor |
| **Build Tool** | Vite 5 | Fast dev server and production bundler |
| **Backend** | Python 3.12 + FastAPI | REST API with automatic OpenAPI docs |
| **ORM** | SQLAlchemy 2 | Database models and queries |
| **Migrations** | Alembic | Schema version control |
| **Auth** | JWT (python-jose) + bcrypt | Stateless token auth with secure password hashing |
| **Database** | SQLite (dev) / PostgreSQL (prod) | Relational data store |
| **Containerization** | Docker + Docker Compose | Reproducible dev and production environments |
| **Fonts** | Inter (Google Fonts) | Clean, professional UI typography |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Browser (React SPA)                │
│  Login → Dashboard → Complaints → Reports → Users   │
└────────────────────┬────────────────────────────────┘
                     │ HTTP (Axios + JWT Bearer token)
                     │ Proxied via Vite dev server
┌────────────────────▼─────────────────────────────────┐
│               FastAPI Backend                        │
│  /api/auth   /api/complaints   /api/analytics        │
│  /api/users  /api/dashboard    /api/feedback         │
│  /api/categories               /api/reports          │
└────────────────────┬─────────────────────────────────┘
                     │ SQLAlchemy ORM
       ┌─────────────┴──────────────┐
       │                            │
┌──────▼───────┐           ┌────────▼────────┐
│  Operational │           │  Analytics      │
│  Database    │  ◄─ ETL ─►│  Table          │
│  (complaints,│           │  (pre-computed  │
│   users...)  │           │   metrics)      │
└──────────────┘           └─────────────────┘
```

The system uses a **dual-table pattern**: operational tables store live complaint data, while the analytics table stores a flattened, enriched snapshot with pre-computed fields (resolution time, SLA breach status, breach hours). The ETL pipeline populates this analytics table on demand.

---

## Phase 1 — Core System

Phase 1 delivers the complete complaint management workflow.

### 1.1 Authentication & User Management
- JWT-based login with configurable token expiry
- Passwords hashed with bcrypt (SHA-256 pre-hash to stay under bcrypt's 72-byte limit)
- Role-based access control enforced on every API route
- Self-service customer registration
- Admin can activate/deactivate any user account

### 1.2 Complaint Registration
- Customers fill in: **title**, **category**, **priority**, and **description**
- System auto-generates a unique complaint number (e.g. `CCRS-20240523-001`)
- SLA deadline is automatically calculated from the priority at the moment of submission
- Complaint starts in **Open** status

### 1.3 Complaint Tracking
- All users see complaints filtered to their role (customers see only their own; agents see only their assigned ones)
- Filterable by **status** and **priority**
- Paginated list (20 per page)
- Full detail view showing: metadata, description, attachments, activity timeline

### 1.4 Complaint Lifecycle Management
- **Assign**: Admin / Supervisor selects an agent → status moves to `Assigned`
- **Status update**: Agents and supervisors can move complaints through any status
- **Resolve**: Agent enters a resolution comment → status moves to `Resolved`, resolved timestamp recorded
- **Close**: Customer confirms satisfaction → status moves to `Closed`

### 1.5 SLA Tracking
- Every complaint carries an SLA deadline computed at creation time
- SLA breach is surfaced in the UI: badge on complaint detail, highlighted rows in agent queue
- Escalation dashboard flags escalated complaints for supervisor attention

### 1.6 File Attachments
- Any authenticated user can upload files to a complaint
- Files stored on the backend filesystem under `/uploads/{complaint_id}/`
- Filename and upload timestamp displayed in complaint detail

### 1.7 Customer Feedback
- After a complaint is **Resolved** or **Closed**, the customer can submit a 1–5 star rating with free-text comments
- One feedback submission per complaint; not editable after submission

### 1.8 Dashboard
- **All roles** see a personalized stats panel (total, open, in-progress, escalated, resolved, SLA breaches)
- **Admin / Supervisor / Quality Team** also see a 6-month monthly trends bar chart
- Average resolution time is shown when resolved complaints exist

### 1.9 Agent Work Queue
- Dedicated page for Support Agents listing their active (non-resolved) complaints
- Each row shows: complaint number, title, customer name, priority, status, SLA deadline, SLA on-track/breached status
- Rows are highlighted in red when SLA is breached

### 1.10 Escalation Dashboard
- Admin and Supervisors see all `Escalated` complaints in one view
- Columns: complaint number, title, customer, priority, escalation level, assigned agent, SLA deadline
- Warning banner shown when any escalations are active

### 1.11 User Management (Admin)
- Full user list with name, email, phone, role, status, and join date
- Role summary badges show counts by role at the top
- Toggle any user between Active and Inactive with one click

### 1.12 Category Management
- Admin can create and delete complaint categories via API
- Categories are used for complaint classification and analytics grouping

---

## Phase 2 — Analytics & ETL

Phase 2 adds a dedicated analytics layer powered by an ETL pipeline.

### 2.1 ETL Pipeline
The ETL (Extract, Transform, Load) pipeline reads all complaint records from the operational database, computes enriched fields, and writes them to a separate `analytics_complaints` table.

**What the ETL computes for each complaint:**
| Field | Description |
|-------|-------------|
| `resolution_time_hours` | Hours between complaint creation and resolution |
| `sla_breached` | True if resolved after deadline, or still open past deadline |
| `breach_hours` | How many hours past the SLA deadline |
| `created_month` | `YYYY-MM` string used for monthly grouping |
| `agent_name` | Denormalized agent name for fast aggregation |
| `category_name` | Denormalized category name |
| `customer_name` | Denormalized customer name |

Every run is logged to the `etl_run_log` table with: run timestamp, status (success/error), records processed, duration in seconds, and any error message.

### 2.2 ETL Pipeline Control (Admin UI)
The **ETL Pipeline** tab in Reports gives Admins full visibility and control:
- **Status cards**: pipeline health, total records processed, last run duration, last run timestamp
- **Run ETL Now** button with a live loading spinner
- **Error display**: shows the last error message if the pipeline failed
- **What ETL populates**: a reference panel explaining each section the pipeline feeds

### 2.3 SLA Analysis Report
Powered by the analytics table. Shows:
- **Bar chart**: total vs breached complaints per category
- **Detail table**: category, priority, total count, breached count, breach rate (%), average breach hours

### 2.4 Resolution Trends Report
- **Line chart**: average resolution hours and SLA breach count by calendar month
- **Summary table**: month, total complaints, average resolution hours, breach count

### 2.5 Agent Performance Report (Admin / Supervisor)
- Per-agent breakdown: total assigned, resolved, resolution rate (with colour-coded progress bar), average resolution hours, SLA breach count
- Powered by the ETL analytics table for accurate historical data

### 2.6 Reports Page Overview
The Reports page has five tabs:

| Tab | Roles | Data Source |
|-----|-------|-------------|
| Overview | Admin, Supervisor, Quality Team | Live DB |
| SLA Analysis | Admin, Supervisor, Quality Team | ETL analytics table |
| Resolution Trends | Admin, Supervisor, Quality Team | ETL analytics table |
| Agent Performance | Admin, Supervisor | ETL analytics table |
| ETL Pipeline | Admin only | ETL run log |

> **Note:** SLA Analysis, Resolution Trends, and Agent Performance tabs show a warning banner until the ETL pipeline has been run at least once.

---

## Roles & Permissions

The system has five roles. Access is enforced on both the API and the UI.

| Capability | Customer | Support Agent | Supervisor | Admin | Quality Team |
|-----------|:--------:|:-------------:|:----------:|:-----:|:------------:|
| Register & submit complaints | ✅ | — | — | ✅ | — |
| View own complaints | ✅ | — | — | — | — |
| View all complaints | — | (assigned only) | ✅ | ✅ | — |
| Agent work queue | — | ✅ | — | — | — |
| Assign complaints to agents | — | — | ✅ | ✅ | — |
| Update complaint status | — | ✅ | ✅ | ✅ | — |
| Resolve complaints | — | ✅ | ✅ | ✅ | — |
| Close complaints | ✅ | — | — | — | — |
| Submit feedback | ✅ | — | — | — | — |
| Escalation dashboard | — | — | ✅ | ✅ | — |
| Dashboard & trends | ✅ (personal) | ✅ (personal) | ✅ (all) | ✅ (all) | ✅ (all) |
| Reports & analytics | — | — | ✅ | ✅ | ✅ |
| ETL pipeline control | — | — | — | ✅ | — |
| User management | — | — | — | ✅ | — |
| Category management (API) | — | — | — | ✅ | — |

---

## Complaint Lifecycle

```
                  ┌─────────┐
                  │  Open   │  ◄── Customer submits complaint
                  └────┬────┘
                       │ Admin / Supervisor assigns agent
                  ┌────▼────┐
                  │Assigned │
                  └────┬────┘
                       │ Agent begins work
              ┌────────▼────────┐
              │   In Progress   │
              └────────┬────────┘
                       │
          ┌────────────┼─────────────────┐
          │                              │
  ┌───────▼────────┐             ┌───────▼────┐
  │Pending Customer│             │ Escalated  │  ◄── SLA breached or manually escalated
  │   Response     │             └───────┬────┘
  └───────┬────────┘                     │
          │                              │
          └───────────┬──────────────────┘
                      │ Agent / Supervisor resolves
                 ┌────▼────┐
                 │Resolved │  ◄── Resolution comment recorded, timestamp set
                 └────┬────┘
                      │ Customer confirms & optionally submits feedback
                 ┌────▼────┐
                 │ Closed  │
                 └─────────┘
```

---

## SLA Policy

SLA deadlines are calculated automatically at complaint creation time based on priority.

| Priority | SLA Deadline | Use Case |
|----------|-------------|----------|
| **Low** | 72 hours (3 days) | Minor issues, general inquiries |
| **Medium** | 48 hours (2 days) | Standard complaints |
| **High** | 24 hours (1 day) | Significant service failures |
| **Critical** | 4 hours | System outages, severe failures |

A complaint is marked as SLA-breached if:
- It is **not yet resolved/closed** and the current time exceeds the deadline, OR
- It was **resolved after** the deadline

The ETL pipeline calculates breach hours for resolved complaints to enable historical analysis.

---

## ETL Pipeline

### How to Run
1. Log in as **Admin**
2. Navigate to **Reports → ETL Pipeline tab**
3. Click **Run ETL Now**
4. The pipeline processes all complaint records (typically under 5 seconds)
5. All analytics tabs (SLA Analysis, Resolution Trends, Agent Performance) will reflect the updated data

### Pipeline Internals
```
Extract  →  Load all Complaint rows with related User/Category via joinedload
Transform → Compute resolution_time_hours, sla_breached, breach_hours, created_month
Load     →  Delete existing analytics_complaints rows, bulk-insert new rows
Log      →  Write ETLRunLog entry with status, count, and duration
```

### ETL API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analytics/run-etl` | Trigger the ETL pipeline (Admin only) |
| `GET` | `/api/analytics/etl-status` | Get the last run log entry |
| `GET` | `/api/analytics/sla-report` | SLA breach data by category & priority |
| `GET` | `/api/analytics/resolution-trends` | Monthly resolution metrics |
| `GET` | `/api/analytics/agent-performance` | Per-agent KPIs |

---

## API Reference

All endpoints are prefixed with `/api`. Interactive docs available at `http://localhost:8000/docs`.

### Authentication — `/api/auth`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | None | Register a new customer account |
| `POST` | `/auth/login` | None | Login, returns JWT access token |
| `GET` | `/auth/me` | JWT | Get the current authenticated user |

### Complaints — `/api/complaints`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/complaints` | JWT | Create a new complaint |
| `GET` | `/complaints` | JWT | List complaints (role-filtered, paginated) |
| `GET` | `/complaints/escalated` | Admin, Supervisor | List escalated complaints |
| `GET` | `/complaints/{id}` | JWT | Get complaint detail with history & attachments |
| `PUT` | `/complaints/{id}/assign` | Admin, Supervisor | Assign complaint to an agent |
| `PUT` | `/complaints/{id}/status` | Agent, Admin, Supervisor | Update complaint status |
| `PUT` | `/complaints/{id}/resolve` | Agent, Admin, Supervisor | Resolve a complaint |
| `PUT` | `/complaints/{id}/close` | JWT (Customer) | Close a resolved complaint |
| `POST` | `/complaints/{id}/attachments` | JWT | Upload a file attachment |

### Users — `/api/users`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/users` | Admin | List all users |
| `GET` | `/users/agents` | Admin, Supervisor | List active support agents |
| `GET` | `/users/roles` | JWT | List all roles |
| `PUT` | `/users/{id}` | Admin | Update user (name, phone, active status) |

### Categories — `/api/categories`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/categories` | JWT | List all categories |
| `POST` | `/categories` | Admin | Create a new category |
| `DELETE` | `/categories/{id}` | Admin | Delete a category |

### Dashboard — `/api/dashboard`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/dashboard/stats` | JWT | Complaint counts and avg resolution time |
| `GET` | `/dashboard/trends` | Admin, Supervisor, Quality Team | 6-month monthly complaint counts |
| `GET` | `/dashboard/category-stats` | Admin, Supervisor, Quality Team | Complaint count per category |

### Feedback — `/api/feedback`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/feedback/{complaint_id}` | Customer | Submit star rating and comment |
| `GET` | `/feedback/{complaint_id}` | JWT | Retrieve feedback for a complaint |

### Analytics — `/api/analytics`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/analytics/run-etl` | Admin | Run the full ETL pipeline |
| `GET` | `/analytics/etl-status` | Admin, Supervisor, Quality Team | Last ETL run status |
| `GET` | `/analytics/sla-report` | Admin, Supervisor, Quality Team | SLA breach stats by category/priority |
| `GET` | `/analytics/resolution-trends` | Admin, Supervisor, Quality Team | Monthly resolution trends |
| `GET` | `/analytics/agent-performance` | Admin, Supervisor | Per-agent performance KPIs |
| `GET` | `/analytics/category-analysis` | Admin, Supervisor, Quality Team | Category-level breakdown |

---

## Data Models

### Operational Tables

| Table | Description |
|-------|-------------|
| `roles` | Five predefined roles (Admin, Supervisor, Support Agent, Customer, Quality Team) |
| `users` | All system users with hashed passwords and role assignment |
| `categories` | Complaint categories (e.g. Billing, Technical, Shipping) |
| `complaints` | Core complaint records with status, priority, SLA deadline |
| `complaint_history` | Immutable audit trail of every status change with actor and comment |
| `attachments` | File metadata linked to complaints |
| `feedback` | Customer star ratings and comments for resolved complaints |

### Analytics Tables

| Table | Description |
|-------|-------------|
| `analytics_complaints` | ETL-populated snapshot with computed metrics per complaint |
| `etl_run_log` | Log of every ETL pipeline execution with status, count, and duration |

---

## Project Structure

```
CustomerComplaintAndRTS/
│
├── backend/
│   ├── app/
│   │   ├── etl/
│   │   │   └── pipeline.py          # ETL extract-transform-load logic
│   │   ├── models/
│   │   │   ├── analytics.py         # AnalyticsComplaint, ETLRunLog ORM models
│   │   │   ├── attachment.py        # File attachment model
│   │   │   ├── category.py          # Complaint category model
│   │   │   ├── complaint.py         # Core complaint model
│   │   │   ├── complaint_history.py # Audit trail model
│   │   │   ├── feedback.py          # Customer feedback model
│   │   │   ├── role.py              # Role model
│   │   │   └── user.py              # User model
│   │   ├── routers/
│   │   │   ├── analytics.py         # Analytics & ETL endpoints
│   │   │   ├── auth.py              # Login & registration
│   │   │   ├── categories.py        # Category CRUD
│   │   │   ├── complaints.py        # Complaint lifecycle endpoints
│   │   │   ├── dashboard.py         # Stats & trend endpoints
│   │   │   ├── feedback.py          # Feedback submit & retrieve
│   │   │   └── users.py             # User management
│   │   ├── schemas/                 # Pydantic request/response models
│   │   ├── services/
│   │   │   ├── auth_service.py      # User creation & authentication
│   │   │   ├── complaint_service.py # Complaint number generation & history
│   │   │   └── sla_service.py       # SLA deadline calculation & breach check
│   │   ├── utils/
│   │   │   └── auth.py              # JWT creation, verification, role guard
│   │   ├── config.py                # Environment variable settings
│   │   ├── database.py              # SQLAlchemy engine & session
│   │   └── main.py                  # FastAPI app, CORS, router registration
│   ├── seed_data.py                 # Seeds demo users, categories, and complaints
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env
│   └── .env.example
│
├── frontend/
│   └── src/
│       ├── components/
│       │   └── common/
│       │       ├── Layout.jsx        # Navbar + Sidebar wrapper
│       │       ├── Navbar.jsx        # Top bar with user avatar and logout
│       │       ├── Sidebar.jsx       # Role-based navigation with Lucide icons
│       │       ├── StatusBadge.jsx   # Status and Priority pill badges
│       │       └── PrivateRoute.jsx  # Auth guard with role check
│       ├── context/
│       │   └── AuthContext.jsx       # Global auth state (user, token, login, logout)
│       ├── pages/
│       │   ├── Login.jsx             # Login form with demo account quick-fill
│       │   ├── Register.jsx          # Customer self-registration
│       │   ├── Dashboard.jsx         # Stat cards + monthly trends chart
│       │   ├── ComplaintRegistration.jsx  # New complaint form
│       │   ├── ComplaintTracking.jsx      # Paginated complaint list with filters
│       │   ├── ComplaintDetail.jsx        # Full complaint view with actions & timeline
│       │   ├── AgentWorkQueue.jsx         # Agent's active complaint queue
│       │   ├── EscalationDashboard.jsx    # Escalated complaints for supervisors
│       │   ├── Reports.jsx                # 5-tab analytics page with ETL control
│       │   └── UserManagement.jsx         # Admin user list with activate/deactivate
│       ├── services/
│       │   └── api.js                # Axios instance with JWT interceptor
│       ├── App.jsx                   # Routes + PrivateRoute role config
│       ├── main.jsx                  # React 18 entry point
│       └── index.css                 # Global stylesheet (Inter font, design system)
│
├── images/                           # Application screenshots
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Option 1 — Docker (Recommended)

Requires Docker Desktop installed and running.

```bash
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

---

### Option 2 — Local Development

You need **Python 3.10+** and **Node.js 18+**.

#### Step 1 — Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows CMD / PowerShell
# source venv/Scripts/activate # Git Bash
# source venv/bin/activate     # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env           # Already done if .env exists

# Start the API server
uvicorn app.main:app --reload --port 8000
```

#### Step 2 — Seed the database

In a separate terminal (with venv activated):

```bash
cd backend
python seed_data.py
```

This creates all 5 demo users, complaint categories (Billing, Technical Support, Shipping & Delivery, Product Quality, General Inquiry), and sample complaints.

#### Step 3 — Frontend setup

```bash
cd frontend
npm install     # Only needed the first time
npm run dev
```

#### Step 4 — Open the app

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |

---

## Environment Variables

Located at `backend/.env`. Copy from `.env.example` to get started.

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./complaint_db.sqlite3` | SQLAlchemy database connection string |
| `SECRET_KEY` | *(change this!)* | JWT signing secret — use a long random string in production |
| `ALGORITHM` | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token lifetime in minutes |

For production with PostgreSQL:
```env
DATABASE_URL=postgresql://user:password@host:5432/ccrs_db
SECRET_KEY=a-very-long-random-secret-key-here
```

---

## Demo Accounts

All demo accounts are created by running `python seed_data.py`.

On the login page, click the **Use** button next to any role to auto-fill the credentials, then click **Sign In**.

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | admin@ccrs.com | Admin@123 | Full system access, ETL control, user management |
| **Supervisor** | supervisor@ccrs.com | Supervisor@123 | Assign complaints, escalation dashboard, reports |
| **Support Agent** | agent@ccrs.com | Agent@123 | Personal work queue, update and resolve complaints |
| **Customer** | customer@ccrs.com | Customer@123 | Submit complaints, track status, submit feedback |
| **Quality Team** | quality@ccrs.com | Quality@123 | Read-only access to all reports and analytics |
