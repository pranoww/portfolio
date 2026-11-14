# Points the app at the test database, gives each test an empty table and a fake email sender
import os

import pytest
from dotenv import load_dotenv

load_dotenv()
os.environ["DATABASE_URL"] = os.environ["TEST_DATABASE_URL"]
os.environ["IP_HASH_SALT"] = "test-salt"
os.environ["MESSAGES_PER_HOUR_LIMIT"] = "3"

from fastapi.testclient import TestClient  # noqa: E402

from app import contact_routes  # noqa: E402
from app.database import connection_pool  # noqa: E402
from app.main import app  # noqa: E402


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
def client(running_app_client, sent_email_list):
    with connection_pool.connection() as connection:
        connection.execute("TRUNCATE contact_messages")
    return running_app_client


def fetch_saved_messages():
    with connection_pool.connection() as connection:
        return connection.execute(
            "SELECT sender_name, sender_email, message, is_email_sent FROM contact_messages ORDER BY id"
        ).fetchall()
