# Library Management System — Phase 1

A full-stack web application for managing books, borrowers, and library transactions.

**Stack:** React (Vite) · FastAPI · SQLite · SQLAlchemy

---

## Project Structure

```
Library_Management_System/
├── backend/
│   ├── main.py           # FastAPI app entry point
│   ├── database.py       # SQLAlchemy engine & session
│   ├── models.py         # ORM models (Book, Borrower, Transaction)
│   ├── schemas.py        # Pydantic request/response schemas
│   ├── crud.py           # Database CRUD operations
│   ├── routers/
│   │   ├── books.py
│   │   ├── borrowers.py
│   │   ├── transactions.py
│   │   └── search.py
│   └── requirements.txt
└── frontend/
    └── src/
        ├── components/   # Navbar
        ├── pages/        # Dashboard, Books, Borrowers, BorrowReturn, Search
        ├── services/     # api.js (axios)
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

# Install dependencies
pip install -r requirements.txt

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

---

## Database Schema

**books** — book_id, title, author, category, isbn, availability_status  
**borrowers** — borrower_id, borrower_name, email, phone  
**transactions** — transaction_id, book_id, borrower_id, borrow_date, return_date

SQLite database file (`library.db`) is auto-created in the `backend/` directory on first run.

---

## Features

- **Dashboard** — live stats (total books, available, borrowed, borrower count) + recent transactions
- **Book Management** — add, edit, delete, view all books with availability status
- **Borrower Management** — add, edit, delete, view all borrowers
- **Borrow / Return** — issue books to borrowers, return with one click, full transaction history
- **Search** — keyword search across title, author, and category
- **Form Validation** — client-side validation on all forms
- **Responsive UI** — works on desktop and mobile
