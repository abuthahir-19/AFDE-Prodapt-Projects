from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, SessionLocal
import models
from routers import feedback
from routers import etl
from seed import seed_database

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Feedback Management System",
    description="REST API for managing participant feedback with ETL pipeline",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(feedback.router, prefix="/api", tags=["Feedback"])
app.include_router(etl.router, prefix="/api", tags=["ETL"])


@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


@app.get("/", tags=["Health"])
def root():
    return {"message": "Feedback Management System API is running", "version": "2.0.0"}
