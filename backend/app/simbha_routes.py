# POST /simbha: guards spending (kill switch, site-only origin, per-visitor and site-wide limits),
# looks up the relevant facts about Pranav and streams Simbha's reply as plain text
import logging
import re
from urllib.parse import urlsplit

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import StreamingResponse

from app import simbha_reply, simbha_retrieval
from app.database import connection_pool
from app.settings import settings
from app.simbha_persona import build_system_prompt
from app.simbha_schema import SimbhaQuestion
from app.visitor_ip import hash_visitor_ip

simbha_router = APIRouter()
logger = logging.getLogger(__name__)
napping_line = "Simbha is napping. Try again in a bit."
# Emoji and pictograph code points (faces, cats, hearts, flags, symbols) plus the joiners and variation marks that glue them
emoji_pattern = re.compile(
    "[\U0001F000-\U0001FAFF\U00002600-\U000027BF\U0001F1E6-\U0001F1FF\U00002B00-\U00002BFF\U0000FE0F\U0000200D\U000020E3]"
)
# Any fixed number works: it lets one request at a time check and record the limits
limits_lock_id = 7_401_355


def refuse(status_code: int, detail: str):
    raise HTTPException(status_code=status_code, detail=detail)


def check_origin(request: Request):
    # Browsers always send Origin on this POST. On Vercel only the portfolio's own pages may call it: the site's own
    # domain (the frontend calls /api on the same host) or an origin listed in ALLOWED_ORIGINS.
    if not settings.vercel:
        return
    origin = request.headers.get("origin") or ""
    own_host = request.headers.get("x-forwarded-host") or request.headers.get("host") or ""
    is_own_site = bool(own_host) and urlsplit(origin).netloc == own_host and urlsplit(origin).scheme == "https"
    if not (is_own_site or origin in settings.allowed_origins):
        refuse(status.HTTP_403_FORBIDDEN, "Simbha only talks to visitors on Pranav's site.")


def record_question_within_limits(sender_ip_hash: str):
    # Count, check and record inside one locked transaction, so a burst of requests can't slip past the caps
    with connection_pool.connection() as connection, connection.transaction():
        connection.execute("SELECT pg_advisory_xact_lock(%s)", (limits_lock_id,))
        minute_count, hour_count, site_day_count = connection.execute(
            """
            SELECT
                COUNT(*) FILTER (WHERE sender_ip_hash = %(ip)s AND created_at > NOW() - INTERVAL '1 minute'),
                COUNT(*) FILTER (WHERE sender_ip_hash = %(ip)s AND created_at > NOW() - INTERVAL '1 hour'),
                COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day')
            FROM simbha_questions
            """,
            {"ip": sender_ip_hash},
        ).fetchone()
        if site_day_count >= settings.simbha_questions_per_day_limit:
            refuse(status.HTTP_429_TOO_MANY_REQUESTS, "I've answered enough questions for today. Back tomorrow, after my nap.")
        if minute_count >= settings.simbha_questions_per_minute_limit:
            refuse(status.HTTP_429_TOO_MANY_REQUESTS, "Slow down. Cats don't do speed. Try again in a minute.")
        if hour_count >= settings.simbha_questions_per_hour_limit:
            refuse(status.HTTP_429_TOO_MANY_REQUESTS, "That's enough questions for now. I need a nap. Come back in an hour.")
        connection.execute("INSERT INTO simbha_questions (sender_ip_hash) VALUES (%s)", (sender_ip_hash,))
        # The limits look back one day at most, so older rows are dropped to keep the free Neon storage (1 GB) clear
        connection.execute("DELETE FROM simbha_questions WHERE created_at < NOW() - INTERVAL '1 day'")


@simbha_router.post("/simbha")
def ask_simbha(simbha_question: SimbhaQuestion, request: Request):
    if not settings.simbha_enabled or settings.is_paid_model_blocked:
        refuse(status.HTTP_503_SERVICE_UNAVAILABLE, napping_line)
    check_origin(request)
    record_question_within_limits(hash_visitor_ip(request))

    try:
        chunk_list = simbha_retrieval.find_relevant_chunks(simbha_question.question)
    except Exception:
        logger.exception("Simbha could not look up his knowledge")
        refuse(status.HTTP_503_SERVICE_UNAVAILABLE, napping_line)

    system_prompt = build_system_prompt(chunk_list)
    history = [turn.model_dump() for turn in simbha_question.history]
    while history and history[0]["role"] != "user":
        history.pop(0)
    message_list = [*history, {"role": "user", "content": simbha_question.question}]

    def reply_text():
        try:
            for text in simbha_reply.stream_reply(system_prompt, message_list):
                # No emojis on the site, ever: whatever the model writes, they are stripped before visitors see it
                cleaned_text = re.sub(r" {2,}", " ", emoji_pattern.sub("", text))
                if cleaned_text:
                    yield cleaned_text
        except Exception:
            logger.exception("Simbha's model call failed")
            yield napping_line

    return StreamingResponse(reply_text(), media_type="text/plain; charset=utf-8", headers={"Cache-Control": "no-store"})
