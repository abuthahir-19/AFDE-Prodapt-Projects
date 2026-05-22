import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import engine, Base, SessionLocal
from app import models  # noqa: F401 — registers all models with SQLAlchemy metadata
from app.routers import auth, users, articles, categories, tags, search, files, approvals, collaboration, analytics
from app.core.security import hash_password, verify_password
from app.config import settings

# Path to the built React app
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")


def _create_default_admin(db: Session) -> None:
    from app.models.user import User

    admin = db.query(User).filter(User.email == "admin@company.com").first()

    if not admin:
        admin = User(
            name="System Administrator",
            email="admin@company.com",
            hashed_password=hash_password("Admin@123"),
            role="admin",
            department="IT",
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print("[startup] Default admin user created: admin@company.com / Admin@123")
    elif not verify_password("Admin@123", admin.hashed_password):
        admin.hashed_password = hash_password("Admin@123")
        db.commit()
        print("[startup] Admin password hash refreshed")


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    db = SessionLocal()
    try:
        _create_default_admin(db)
    finally:
        db.close()

    yield


app = FastAPI(
    title="Enterprise Knowledge Base API",
    version="1.0.0",
    description="A comprehensive knowledge base management system.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── File uploads ───────────────────────────────────────────────────────────────
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ─── API Routers ────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(articles.router)
app.include_router(categories.router)
app.include_router(tags.router)
app.include_router(search.router)
app.include_router(files.router)
app.include_router(approvals.router)
app.include_router(collaboration.router)
app.include_router(analytics.router)

# ─── Serve React frontend ───────────────────────────────────────────────────────
# Serve static assets (JS, CSS, images) from dist/assets
if os.path.isdir(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/health")
    def health_check():
        return {"status": "healthy"}

    # All non-API routes return index.html (React Router handles them client-side)
    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        index = os.path.join(FRONTEND_DIST, "index.html")
        return FileResponse(index)

else:
    @app.get("/")
    def root():
        return {"message": "Enterprise Knowledge Base API", "status": "running", "docs": "/docs"}

    @app.get("/health")
    def health_check():
        return {"status": "healthy"}
