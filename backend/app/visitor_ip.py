# Turns a visitor's IP address into a salted hash, so rate limits work without storing raw addresses
import hashlib

from fastapi import Request

from app.settings import settings


def hash_visitor_ip(request: Request) -> str:
    # On Vercel the visitor's address arrives in a header Vercel sets itself; elsewhere use the direct connection
    vercel_forwarded_ip = request.headers.get("x-vercel-forwarded-for", "").split(",")[0].strip()
    visitor_ip = (settings.vercel and vercel_forwarded_ip) or (request.client.host if request.client else "unknown")
    return hashlib.sha256(f"{settings.ip_hash_salt}{visitor_ip}".encode()).hexdigest()
