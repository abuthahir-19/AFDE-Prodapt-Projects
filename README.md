# Helpdesk Ticket Management System

A full-stack web application for managing IT helpdesk tickets, built with FastAPI (Python) on the backend and React on the frontend.

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Python 3.8+, FastAPI, SQLAlchemy    |
| Database | SQLite (helpdesk.db)                |
| Frontend | React 18, React Router v6, Axios    |
| Styling  | Inline CSS (no external UI library) |

---

## Project Structure

```
Helpdesk-Ticket-Management-System/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # SQLAlchemy engine & session
│   ├── models.py            # ORM models
│   ├── schemas.py           # Pydantic schemas
│   ├── crud.py              # Database operations
│   ├── routers/
│   │   └── tickets.py       # API route handlers
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── TicketCard.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   └── PriorityBadge.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateTicket.jsx
│   │   │   ├── TicketList.jsx
│   │   │   ├── TicketDetail.jsx
│   │   │   └── EditTicket.jsx
│   │   ├── services/
│   │   │   └── ticketService.js
│   │   ├── api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

---

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. (Recommended) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

5. The API will be available at: `http://localhost:8000`
6. Interactive API docs (Swagger UI): `http://localhost:8000/docs`

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

4. The app will open at: `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint             | Description                          |
|--------|----------------------|--------------------------------------|
| GET    | `/`                  | Health check — API status            |
| GET    | `/tickets`           | Get all tickets (skip, limit params) |
| GET    | `/tickets/{id}`      | Get a ticket by ID                   |
| POST   | `/tickets`           | Create a new ticket (returns 201)    |
| PUT    | `/tickets/{id}`      | Update an existing ticket            |
| DELETE | `/tickets/{id}`      | Delete a ticket                      |
| GET    | `/search`            | Search/filter tickets                |

### Search/Filter Query Parameters (`/search`)

| Parameter  | Type   | Description                        |
|------------|--------|------------------------------------|
| `keyword`  | string | Search in name, dept, description  |
| `category` | string | Filter by issue category           |
| `status`   | string | Filter by status                   |
| `priority` | string | Filter by priority                 |

---

## Database Schema

### `tickets` Table

| Column            | Type     | Constraints                   |
|-------------------|----------|-------------------------------|
| ticket_id         | INTEGER  | PRIMARY KEY, AUTOINCREMENT    |
| employee_name     | VARCHAR  | NOT NULL                      |
| department        | VARCHAR  | NOT NULL                      |
| issue_category    | VARCHAR  | NOT NULL                      |
| description       | TEXT     | NOT NULL                      |
| priority          | VARCHAR  | NOT NULL                      |
| status            | VARCHAR  | DEFAULT 'Open'                |
| resolution_notes  | TEXT     | NULLABLE                      |
| created_at        | DATETIME | DEFAULT current UTC timestamp |

---

## Features

- **Dashboard** — Stats overview (Total, Open, In Progress, Resolved), recent 5 tickets table
- **Create Ticket** — Form with validation for all required fields
- **Ticket List** — Full table with live keyword search and category/status/priority filters
- **Ticket Detail** — Read-only view of all ticket fields
- **Edit Ticket** — Pre-filled form to update any field including status and resolution notes
- **Delete** — Confirmation modal before deletion
- **Priority Badges** — Color-coded (Low=green, Medium=yellow, High=orange, Critical=purple)
- **Status Badges** — Color-coded (Open=blue, In Progress=yellow, Resolved=green, Closed=gray)

---

## Issue Categories

- VPN Issue
- Password Reset
- Software Installation
- Laptop Issue
- Email Access
- Network Connectivity
- Hardware Request

## Priority Levels

| Priority | Color   |
|----------|---------|
| Low      | #4caf50 |
| Medium   | #ff9800 |
| High     | #f44336 |
| Critical | #9c27b0 |

## Ticket Statuses

| Status      | Color   |
|-------------|---------|
| Open        | #2196f3 |
| In Progress | #ff9800 |
| Resolved    | #4caf50 |
| Closed      | #9e9e9e |
