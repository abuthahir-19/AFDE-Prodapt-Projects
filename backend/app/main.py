import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app import models  # noqa: F401 — ensures all models are registered
from app.routers import auth, users, complaints, categories, feedback, dashboard, analytics

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Customer Complaint & Resolution Tracking System",
    description="Centralized platform for managing customer complaints and resolutions.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(complaints.router)
app.include_router(categories.router)
app.include_router(feedback.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {"message": "CCRS API v1.0.0", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}
