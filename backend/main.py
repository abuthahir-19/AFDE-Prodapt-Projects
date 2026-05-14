from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
import models
from routers import feedback

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Feedback Management System",
    description="REST API for managing participant feedback",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(feedback.router, prefix="/api", tags=["Feedback"])


@app.get("/", tags=["Health"])
def root():
    return {"message": "Feedback Management System API is running", "version": "1.0.0"}
