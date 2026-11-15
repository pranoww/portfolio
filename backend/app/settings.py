# Backend configuration, read from environment variables or the .env file.
# Errors never echo the loaded values, and keys are SecretStr so they don't print by accident.
import logging
from typing import Literal

from pydantic import SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", hide_input_in_errors=True)

    database_url: str
    allowed_origins: list[str] = ["http://localhost:3000"]
    ip_hash_salt: str
    messages_per_hour_limit: int = 5
    resend_api_key: str = ""
    contact_from_email: str = "Portfolio <onboarding@resend.dev>"
    contact_inbox_email: str = ""
    vercel: bool = False
    # Vercel sets this to "production", "preview" or "development"
    vercel_env: str = ""

    # Simbha chatbot: Groq's free tier while developing, Claude only on the live production deployment
    simbha_llm_provider: Literal["groq", "anthropic"] = "groq"
    anthropic_api_key: SecretStr = SecretStr("")
    anthropic_model: str = "claude-haiku-5-5"
    groq_api_key: SecretStr = SecretStr("")
    groq_model: str = "openai/gpt-oss-20b"
    voyage_api_key: SecretStr = SecretStr("")
    voyage_model: str = "voyage-4-lite"
    # Spending guards: a kill switch, per-visitor limits, and one cap for the whole site per day
    simbha_enabled: bool = True
    simbha_questions_per_minute_limit: int = 5
    simbha_questions_per_hour_limit: int = 20
    simbha_questions_per_day_limit: int = 200

    @property
    def is_vercel_production(self) -> bool:
        return self.vercel and self.vercel_env == "production"

    @property
    def is_paid_model_blocked(self) -> bool:
        # Claude only ever runs on the live production deployment. Anywhere else (a laptop, a preview deployment,
        # or Vercel without its system variables exposed) Simbha naps instead of spending credits. The rest of
        # the backend, like the contact form, keeps working.
        return self.simbha_llm_provider == "anthropic" and not self.is_vercel_production

    @model_validator(mode="after")
    def warn_when_paid_model_is_blocked(self):
        if self.is_paid_model_blocked:
            logging.getLogger(__name__).warning("Simbha is set to the paid Claude model outside Vercel production, so he stays switched off.")
        return self


settings = Settings()
