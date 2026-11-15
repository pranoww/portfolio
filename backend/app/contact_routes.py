# POST /contact: drops honeypot spam, limits messages per visitor, saves the message to Postgres and emails it on
from fastapi import APIRouter, HTTPException, Request, status

from app.contact_email import send_contact_email
from app.contact_schema import ContactMessage
from app.database import connection_pool
from app.settings import settings
from app.visitor_ip import hash_visitor_ip

contact_router = APIRouter()


@contact_router.post("/contact", status_code=status.HTTP_201_CREATED)
def create_contact_message(contact_message: ContactMessage, request: Request):
    if contact_message.website:
        return {"status": "received"}

    sender_ip_hash = hash_visitor_ip(request)

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
