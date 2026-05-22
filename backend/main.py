from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import tickets, analytics, etl
from seed import run_seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables then seed on first run
    Base.metadata.create_all(bind=engine)
    run_seed()
    yield


app = FastAPI(
    title="Helpdesk Ticket Management System",
    description="API for managing IT helpdesk tickets",
    version="1.0.0",
    lifespan=lifespan,
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
app.include_router(analytics.router)
app.include_router(etl.router)


@app.get("/")
def root():
    return {"message": "Helpdesk API running"}
