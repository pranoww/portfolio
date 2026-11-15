# FastAPI app for the portfolio: opens the database on startup and serves everything under /api, matching the Vercel route
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.contact_routes import contact_router
from app.database import connection_pool, open_database
from app.settings import settings
from app.simbha_routes import simbha_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    open_database()
    yield
    connection_pool.close()


app = FastAPI(title="Portfolio API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)
app.include_router(contact_router, prefix="/api")
app.include_router(simbha_router, prefix="/api")


@app.get("/api/health")
def read_health():
    return {"status": "ok"}
