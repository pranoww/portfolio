# Points the app at the test database, gives each test empty tables, a fake email sender and fake AI calls.
# No test may reach a real model or embedding API: keys are blanked and the real clients are blocked outright.
import os

import pytest
from dotenv import load_dotenv

load_dotenv()
os.environ["DATABASE_URL"] = os.environ["TEST_DATABASE_URL"]
os.environ["IP_HASH_SALT"] = "test-salt"
os.environ["MESSAGES_PER_HOUR_LIMIT"] = "3"
os.environ["SIMBHA_QUESTIONS_PER_HOUR_LIMIT"] = "3"
os.environ["SIMBHA_QUESTIONS_PER_MINUTE_LIMIT"] = "100"
os.environ["SIMBHA_QUESTIONS_PER_DAY_LIMIT"] = "50"
os.environ["SIMBHA_ENABLED"] = "true"
os.environ["VERCEL"] = "false"
os.environ["SIMBHA_LLM_PROVIDER"] = "groq"
for key_name in ["ANTHROPIC_API_KEY", "GROQ_API_KEY", "VOYAGE_API_KEY"]:
    os.environ[key_name] = ""

import anthropic  # noqa: E402
import groq  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app import contact_routes, simbha_embeddings, simbha_index, simbha_reply, simbha_retrieval  # noqa: E402
from app.database import connection_pool  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(autouse=True)
def block_real_ai_clients(monkeypatch):
    def refuse(*args, **kwargs):
        raise AssertionError("Tests must not call a real AI API")

    monkeypatch.setattr(anthropic, "Anthropic", refuse)
    monkeypatch.setattr(groq, "Groq", refuse)
    monkeypatch.setattr(simbha_embeddings.httpx, "post", refuse)


class FakeCallList(list):
    embed_call_list: list


def fake_embed_texts(texts, input_type):
    # Same-length vectors whose direction depends on the text, enough for ordering by distance
    return [[1.0 if index == len(text) % 1024 else 0.001 for index in range(1024)] for text in texts]


@pytest.fixture
def fake_ai(monkeypatch):
    call_list = FakeCallList()

    def fake_stream_reply(system_prompt, message_list):
        call_list.append({"system_prompt": system_prompt, "message_list": message_list})
        yield "Mrrp. "
        yield "He builds things."

    monkeypatch.setattr(simbha_reply, "stream_reply", fake_stream_reply)
    def counting_fake_embed_texts(texts, input_type):
        embed_call_list.append(texts)
        return fake_embed_texts(texts, input_type)

    embed_call_list = []
    monkeypatch.setattr(simbha_retrieval, "embed_texts", counting_fake_embed_texts)
    monkeypatch.setattr(simbha_index, "embed_texts", fake_embed_texts)
    call_list.embed_call_list = embed_call_list
    return call_list


@pytest.fixture
def sent_email_list(monkeypatch):
    sent_email_list = []

    def record_contact_email(contact_message):
        sent_email_list.append(contact_message)
        return True

    monkeypatch.setattr(contact_routes, "send_contact_email", record_contact_email)
    return sent_email_list


@pytest.fixture(scope="session")
def running_app_client():
    with TestClient(app) as running_app_client:
        yield running_app_client


@pytest.fixture
def client(running_app_client, sent_email_list, fake_ai):
    with connection_pool.connection() as connection:
        connection.execute("TRUNCATE contact_messages, simbha_questions, simbha_chunks, simbha_query_embeddings")
    return running_app_client


def fetch_saved_messages():
    with connection_pool.connection() as connection:
        return connection.execute(
            "SELECT sender_name, sender_email, message, is_email_sent FROM contact_messages ORDER BY id"
        ).fetchall()
