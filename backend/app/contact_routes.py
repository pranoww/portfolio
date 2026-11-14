# POST /contact: drops honeypot spam, limits messages per visitor, saves the message to Postgres and emails it on
import hashlib

from fastapi import APIRouter, HTTPException, Request, status

from app.contact_email import send_contact_email
from app.contact_schema import ContactMessage
from app.database import connection_pool
from app.settings import settings

contact_router = APIRouter()


@contact_router.post("/contact", status_code=status.HTTP_201_CREATED)
def create_contact_message(contact_message: ContactMessage, request: Request):
    if contact_message.website:
        return {"status": "received"}

    # On Vercel the visitor's address arrives in a header Vercel sets itself; elsewhere use the direct connection
    vercel_forwarded_ip = request.headers.get("x-vercel-forwarded-for", "").split(",")[0].strip()
    sender_ip = (settings.vercel and vercel_forwarded_ip) or (request.client.host if request.client else "unknown")
    sender_ip_hash = hashlib.sha256(f"{settings.ip_hash_salt}{sender_ip}".encode()).hexdigest()

    with connection_pool.connection() as connection:
        recent_message_count = connection.execute(
            "SELECT COUNT(*) FROM contact_messages WHERE sender_ip_hash = %s AND created_at > NOW() - INTERVAL '1 hour'",
            (sender_ip_hash,),
        ).fetchone()[0]
        if recent_message_count >= settings.messages_per_hour_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many messages for now. Please try again later or email me directly.",
            )
        message_id = connection.execute(
            "INSERT INTO contact_messages (sender_name, sender_email, message, sender_ip_hash) VALUES (%s, %s, %s, %s) RETURNING id",
            (contact_message.name, contact_message.email, contact_message.message, sender_ip_hash),
        ).fetchone()[0]

    if send_contact_email(contact_message):
        with connection_pool.connection() as connection:
            connection.execute("UPDATE contact_messages SET is_email_sent = TRUE WHERE id = %s", (message_id,))

    return {"status": "received"}
