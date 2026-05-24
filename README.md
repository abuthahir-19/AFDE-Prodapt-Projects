# AFDE Projects – Syed Abuthahir

A collection of 5 full-stack web applications built as part of the **AFDE (Accelerated Forward Deployed Engineering)** program at **Prodapt**.

Each project follows a FastAPI + React architecture with an SQLite (or PostgreSQL) database and includes an ETL pipeline for data import and analytics.

---

## Projects at a Glance

| # | Folder | Project | Stack |
|---|--------|---------|-------|
| 1 | [AFDE-May26-Syed-CCRTS](./AFDE-May26-Syed-CCRTS) | Customer Complaint & Resolution Tracking System | FastAPI · React · SQLite / PostgreSQL |
| 2 | [AFDE-May26-Syed-EKBMS](./AFDE-May26-Syed-EKBMS) | Enterprise Knowledge Base Management System | FastAPI · React · PostgreSQL |
| 3 | [AFDE-May26-Syed-FMS](./AFDE-May26-Syed-FMS) | Feedback Management System | FastAPI · React · SQLite |
| 4 | [AFDE-May26-Syed-HDMS](./AFDE-May26-Syed-HDMS) | Helpdesk Ticket Management System | FastAPI · React · SQLite |
| 5 | [AFDE-May26-Syed-LMS](./AFDE-May26-Syed-LMS) | Library Management System | FastAPI · React · SQLite |

---

## 1. Customer Complaint & Resolution Tracking System (CCRTS)

**Folder:** `AFDE-May26-Syed-CCRTS`

A full-stack web application that manages the complete lifecycle of customer complaints — from registration through resolution. It features role-based access control for five user roles (Customer, Support Agent, Supervisor, Admin, Quality Team), automated SLA deadline tracking by priority, and an escalation dashboard. A two-phase ETL analytics pipeline aggregates raw complaint data into actionable reports.

**Key Features:**
- Role-based access control with 5 user roles
- SLA deadline tracking with priority-based deadlines (4 hrs – 72 hrs)
- Escalation dashboard and full complaint audit trail
- File attachment support on complaints
- Analytics dashboard: SLA analysis, resolution trends, agent performance, ETL pipeline view

**Stack:** Python 3.12 · FastAPI · SQLAlchemy · SQLite / PostgreSQL · React 18 · Vite · Recharts · JWT Auth · Docker

---

## 2. Enterprise Knowledge Base Management System (EKBMS)

**Folder:** `AFDE-May26-Syed-EKBMS`

A knowledge management platform that supports article authoring with a rich text editor, a role-based approval workflow, and bulk ETL imports from CSV/JSON. Articles flow through a structured lifecycle (draft → pending → published/rejected → archived) with category hierarchies, tagging, bookmarks, comments, and star ratings.

**Key Features:**
- Article lifecycle management with approval queue
- Rich text editor (Quill) for content authoring
- Category hierarchy, tags, bookmarks, comments, and ratings
- ETL bulk import from CSV or JSON with automatic category/tag resolution
- Analytics: author activity, engagement stats, creation trends

**Stack:** Python · FastAPI · SQLAlchemy · PostgreSQL · React 18 · Vite · Tailwind CSS · Recharts · JWT Auth

---

## 3. Feedback Management System (FMS)

**Folder:** `AFDE-May26-Syed-FMS`

A centralised platform for collecting and analysing participant feedback across training programs and events. Administrators can submit, search, filter, edit, and delete feedback entries, and bulk-import data from CSV or Excel files via an ETL pipeline.

**Key Features:**
- Structured feedback form with 1–5 star ratings and optional comments
- Real-time keyword search and filter by program / rating
- ETL bulk import supporting CSV and Excel files with flexible column alias resolution
- Analytics dashboard: KPI cards, rating distribution chart, program performance table
- CSV report download with filtering; automated seed data (50 entries across 8 programs)

**Stack:** Python · FastAPI · SQLAlchemy · SQLite · Pandas · React 18 · Recharts · Axios

---

## 4. Helpdesk Ticket Management System (HDMS)

**Folder:** `AFDE-May26-Syed-HDMS`

A full-stack IT helpdesk application for creating, tracking, and resolving support tickets with role-based workflows. An ETL pipeline normalises and imports historical ticket data from CSV, enabling an interactive analytics dashboard with charts across categories, resolution times, priority, and department.

**Key Features:**
- Ticket CRUD with live keyword search and multi-field filtering
- Dashboard with stat cards (Total / Open / In Progress / Resolved)
- ETL pipeline with automatic normalisation and deduplication of messy CSV data
- 4 analytics charts: issue categories, monthly resolution time, priority distribution, department counts
- Sample dataset of 200+ historical tickets included

**Stack:** Python 3.8+ · FastAPI · SQLAlchemy · SQLite · Pandas · React 18 · Recharts · Axios

---

## 5. Library Management System (LMS)

**Folder:** `AFDE-May26-Syed-LMS`

A full-stack library management system for books, borrowers, and borrow/return transactions with a keyword search engine and a 14-day borrowing policy. Phase 2 adds an ETL pipeline that cleans dirty CSV data and feeds an analytics dashboard covering borrowing trends, category distribution, and overdue monitoring.

**Key Features:**
- CRUD for books and borrowers with availability status tracking
- Borrow/Return panel with automatic due date calculation (14-day policy)
- Case-insensitive keyword search across title, author, and category
- ETL pipeline: Extract → Transform (dedup, null removal, invalid dates) → Load with color-coded logs
- Analytics: top-10 borrowed books, category pie chart, 18-month trend line, overdue analysis table

**Stack:** Python 3.10+ · FastAPI · SQLAlchemy · SQLite · Pandas · React 18 · Vite · Recharts · Pydantic v2

---

*Built by Syed Abuthahir A — AFDE Batch, May 2026 | Prodapt*
