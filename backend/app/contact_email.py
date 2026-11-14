# Emails a new contact message to the inbox through the Resend API and reports whether it was sent
import logging

import httpx

from app.contact_schema import ContactMessage
from app.settings import settings

logger = logging.getLogger(__name__)


def send_contact_email(contact_message: ContactMessage) -> bool:
    if not settings.resend_api_key or not settings.contact_inbox_email:
        return False
    single_line_name = " ".join(contact_message.name.split())
    try:
        response = httpx.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            json={
                "from": settings.contact_from_email,
                "to": [settings.contact_inbox_email],
                "reply_to": contact_message.email,
                "subject": f"New message from {single_line_name}",
                "text": f"{single_line_name} <{contact_message.email}>\n\n{contact_message.message}",
            },
            timeout=10,
        )
        response.raise_for_status()
        return True
    except httpx.HTTPError:
        logger.exception("Contact email could not be sent")
        return False
