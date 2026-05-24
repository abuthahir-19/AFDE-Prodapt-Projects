from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from routers import books, borrowers, transactions, search, analytics
from routers import etl_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Library Management System API",
    description="REST API for managing books, borrowers, and transactions",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(books.router)
app.include_router(borrowers.router)
app.include_router(transactions.router)
app.include_router(search.router)
app.include_router(analytics.router)
app.include_router(etl_router.router)


@app.get("/", tags=["Root"])
def root():
    return {"message": "Library Management System API", "docs": "/docs"}
