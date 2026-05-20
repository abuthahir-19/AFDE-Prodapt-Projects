from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import tickets

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Helpdesk Ticket Management System",
    description="API for managing IT helpdesk tickets",
    version="1.0.0",
)

# CORS middleware - allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tickets.router)


@app.get("/")
def root():
    return {"message": "Helpdesk API running"}
