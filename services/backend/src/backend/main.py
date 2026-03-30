from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import backend.models  # noqa: F401 – registers all ORM models with Base.metadata
from backend.database import Base, engine
from backend.routers import classes, parents, registrations, students, subscriptions


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables on first startup (POC – use Alembic for production migrations)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Website Management API",
    description=(
        "Mini LMS backend: manage Parents, Students, Classes, "
        "Registrations, and Subscriptions."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(parents.router)
app.include_router(students.router)
app.include_router(classes.router)
app.include_router(registrations.router)
app.include_router(subscriptions.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}


def run() -> None:
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
