# Backend configuration, read from environment variables or the .env file
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    allowed_origins: list[str] = ["http://localhost:3000"]
    ip_hash_salt: str
    messages_per_hour_limit: int = 5
    resend_api_key: str = ""
    contact_from_email: str = "Portfolio <onboarding@resend.dev>"
    contact_inbox_email: str = ""


settings = Settings()
