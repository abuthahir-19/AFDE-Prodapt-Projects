# Library Management System — Phase 1 & 2

A full-stack web application for managing books, borrowers, and library transactions.

**Stack:** React (Vite) · FastAPI · SQLite · SQLAlchemy

---

## Project Structure

```
Library_Management_System/
├── data/
│   ├── books.csv              # 50 book records (Phase 2 dataset)
│   ├── borrowers.csv          # 30 borrower records (Phase 2 dataset)
│   └── transactions.csv       # 200+ transaction records with dirty data
├── backend/
│   ├── main.py                # FastAPI app entry point
│   ├── database.py            # SQLAlchemy engine & session
│   ├── models.py              # ORM models (Book, Borrower, Transaction)
│   ├── schemas.py             # Pydantic request/response schemas
│   ├── crud.py                # Database CRUD operations
│   ├── etl.py                 # ETL pipeline script (Phase 2)
│   ├── routers/
│   │   ├── books.py
│   │   ├── borrowers.py
│   │   ├── transactions.py
│   │   ├── search.py
│   │   └── analytics.py       # Analytics endpoints (Phase 2)
│   └── requirements.txt
└── frontend/
    └── src/
        ├── components/        # Navbar
        ├── pages/             # Dashboard, Books, Borrowers, BorrowReturn, Search, Analytics
        ├── services/          # api.js (axios)
        ├── App.jsx
        └── main.jsx
```

---

## Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ / npm

---

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies (includes pandas for ETL)
pip install -r requirements.txt

# (Phase 2) Run ETL pipeline to seed the database with sample data
# Note: delete backend/library.db first if upgrading from Phase 1
python etl.py

# Start the server
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
API docs (Swagger UI): http://localhost:8000/docs

---

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at: http://localhost:5173

---

## API Reference

### Books
| Method | Endpoint       | Description        |
|--------|----------------|--------------------|
| GET    | /books         | Get all books      |
| GET    | /books/{id}    | Get book by ID     |
| POST   | /books         | Add new book       |
| PUT    | /books/{id}    | Update book        |
| DELETE | /books/{id}    | Delete book        |

### Borrowers
| Method | Endpoint           | Description          |
|--------|--------------------|----------------------|
| GET    | /borrowers         | Get all borrowers    |
| POST   | /borrowers         | Add borrower         |
| PUT    | /borrowers/{id}    | Update borrower      |
| DELETE | /borrowers/{id}    | Delete borrower      |

### Transactions
| Method | Endpoint       | Description              |
|--------|----------------|--------------------------|
| POST   | /borrow        | Borrow a book            |
| POST   | /return        | Return a book            |
| GET    | /transactions  | View all transactions    |

### Search
| Method | Endpoint   | Description                              |
|--------|------------|------------------------------------------|
| GET    | /search?q= | Search books by title, author, category  |

### Analytics (Phase 2)
| Method | Endpoint                                  | Description                          |
|--------|-------------------------------------------|--------------------------------------|
| GET    | /analytics/most-borrowed-books?limit=10   | Top N most borrowed books            |
| GET    | /analytics/category-stats                 | Borrow count per book category       |
| GET    | /analytics/monthly-trends                 | Month-by-month borrow volume         |
| GET    | /analytics/overdue-transactions           | All currently overdue transactions   |

---

## Database Schema

**books** — book_id, title, author, category, isbn, availability_status  
**borrowers** — borrower_id, borrower_name, email, phone  
**transactions** — transaction_id, book_id (FK), borrower_id (FK), borrow_date, due_date, return_date

SQLite database file (`library.db`) is auto-created in the `backend/` directory on first run.  
Use the ETL script to seed it with sample data (see Setup above).

---

## Phase 2: ETL Pipeline & Analytics

### ETL Workflow
The ETL pipeline (`backend/etl.py`) processes three CSV files from the `data/` directory:

1. **Extract** — reads `books.csv`, `borrowers.csv`, `transactions.csv` into DataFrames
2. **Transform** — removes duplicate records (by isbn / email / transaction_id), drops rows with missing required fields, parses datetime columns, and computes `due_date` if absent
3. **Load** — upserts clean records into the SQLite database using SQLAlchemy

The dataset intentionally includes dirty data (duplicate rows, null borrower IDs, missing borrow dates) to demonstrate the transformation step.

### Analytics Dashboard
Navigate to `/analytics` in the running frontend to view:
- **Bar chart** — Top 10 most borrowed books
- **Pie chart** — Borrowing distribution by category
- **Line chart** — Monthly borrowing trends (spanning 2024–2026)
- **Overdue table** — All transactions past their due date, with days overdue counter

---

## Features

- **Dashboard** — live stats (total books, available, borrowed, borrower count) + recent transactions
- **Book Management** — add, edit, delete, view all books with availability status
- **Borrower Management** — add, edit, delete, view all borrowers
- **Borrow / Return** — issue books to borrowers, return with one click, full transaction history
- **Search** — keyword search across title, author, and category
- **Analytics** *(Phase 2)* — borrowing insights, trends, and overdue reporting with Recharts charts
- **ETL Pipeline** *(Phase 2)* — import and clean sample datasets into the database
- **Form Validation** — client-side validation on all forms
- **Responsive UI** — works on desktop and mobile
