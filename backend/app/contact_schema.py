# Shape and rules for a contact message, matching the checks in the site's contact form
import re

from pydantic import BaseModel, Field, field_validator

email_pattern = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")


class ContactMessage(BaseModel):
    name: str = Field(max_length=200)
    email: str = Field(max_length=320)
    message: str = Field(max_length=5000)
    website: str = ""

    @field_validator("name")
    @classmethod
    def require_name(cls, name: str) -> str:
        if not name.strip():
            raise ValueError("Please add your name.")
        return name.strip()

    @field_validator("email")
    @classmethod
    def require_valid_email(cls, email: str) -> str:
        if not email_pattern.match(email.strip()):
            raise ValueError("That email doesn't look right.")
        return email.strip()

    @field_validator("message")
    @classmethod
    def require_short_message(cls, message: str) -> str:
        if len(message.strip()) < 10:
            raise ValueError("Please write a short message (at least 10 characters).")
        return message.strip()
