# Checks that /contact saves good messages, rejects bad ones, ignores bots and limits repeat senders
from app import contact_routes
from tests.conftest import fetch_saved_messages

valid_message = {"name": "Asha", "email": "asha@example.com", "message": "I need a website for my bakery."}


def test_valid_message_is_saved_and_emailed(client, sent_email_list):
    response = client.post("/api/contact", json=valid_message)
    assert response.status_code == 201
    assert fetch_saved_messages() == [("Asha", "asha@example.com", "I need a website for my bakery.", True)]
    assert sent_email_list[0].email == "asha@example.com"


def test_invalid_fields_are_rejected(client):
    for invalid_fields in [{"name": "  "}, {"email": "asha@"}, {"message": "hi"}, {"message": "a" * 5001}]:
        response = client.post("/api/contact", json={**valid_message, **invalid_fields})
        assert response.status_code == 422
    assert fetch_saved_messages() == []


def test_honeypot_message_is_dropped_quietly(client, sent_email_list):
    response = client.post("/api/contact", json={**valid_message, "website": "spam.example"})
    assert response.status_code == 201
    assert fetch_saved_messages() == []
    assert sent_email_list == []


def test_sender_is_limited_per_hour(client):
    status_code_list = [client.post("/api/contact", json=valid_message).status_code for _ in range(4)]
    assert status_code_list == [201, 201, 201, 429]


def test_message_is_kept_when_email_fails(client, monkeypatch):
    monkeypatch.setattr(contact_routes, "send_contact_email", lambda contact_message: False)
    response = client.post("/api/contact", json=valid_message)
    assert response.status_code == 201
    assert fetch_saved_messages()[0][3] is False


def test_on_vercel_each_visitor_address_has_its_own_limit(client, monkeypatch):
    from app.settings import settings

    monkeypatch.setattr(settings, "vercel", True)
    first_visitor = {"x-vercel-forwarded-for": "203.0.113.7"}
    second_visitor = {"x-vercel-forwarded-for": "198.51.100.4"}
    first_visitor_codes = [client.post("/api/contact", json=valid_message, headers=first_visitor).status_code for _ in range(4)]
    assert first_visitor_codes == [201, 201, 201, 429]
    assert client.post("/api/contact", json=valid_message, headers=second_visitor).status_code == 201
