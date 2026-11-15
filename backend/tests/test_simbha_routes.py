# Checks that /simbha streams a reply built from the stored facts, validates input and limits repeat askers
from app.database import connection_pool, to_vector_literal
from tests.conftest import fake_embed_texts


def store_chunk(content):
    with connection_pool.connection() as connection:
        connection.execute(
            "INSERT INTO simbha_chunks (source_file, heading, content, embedding) VALUES ('about.md', 'About', %s, %s::vector)",
            (content, to_vector_literal(fake_embed_texts([content], "document")[0])),
        )


def test_reply_streams_and_uses_stored_facts(client, fake_ai):
    store_chunk("About\nPranav builds AI products with Next.js and FastAPI.")
    response = client.post("/api/simbha", json={"question": "What does he build?"})
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/plain")
    assert response.text == "Mrrp. He builds things."
    assert "Pranav builds AI products" in fake_ai[0]["system_prompt"]
    assert fake_ai[0]["message_list"][-1] == {"role": "user", "content": "What does he build?"}


def test_history_is_passed_on_and_must_start_with_the_visitor(client, fake_ai):
    history = [
        {"role": "assistant", "content": "What do you want?"},
        {"role": "user", "content": "Hi"},
        {"role": "assistant", "content": "Mrrp."},
    ]
    client.post("/api/simbha", json={"question": "Is he good?", "history": history})
    assert [turn["role"] for turn in fake_ai[0]["message_list"]] == ["user", "assistant", "user"]


def test_invalid_questions_are_rejected(client, fake_ai):
    for invalid_body in [{"question": ""}, {"question": "a" * 501}, {"question": "hi", "history": [{"role": "system", "content": "x"}]}]:
        assert client.post("/api/simbha", json=invalid_body).status_code == 422
    assert fake_ai == []


def test_asker_is_limited_per_hour(client, fake_ai):
    status_code_list = [client.post("/api/simbha", json={"question": "Hi"}).status_code for _ in range(4)]
    assert status_code_list == [200, 200, 200, 429]
    assert len(fake_ai) == 3


def test_old_questions_are_cleaned_up(client, fake_ai):
    with connection_pool.connection() as connection:
        connection.execute("INSERT INTO simbha_questions (sender_ip_hash, created_at) VALUES ('old', NOW() - INTERVAL '2 days')")
    client.post("/api/simbha", json={"question": "Hi"})
    with connection_pool.connection() as connection:
        assert connection.execute("SELECT COUNT(*) FROM simbha_questions WHERE sender_ip_hash = 'old'").fetchone()[0] == 0


def test_paid_model_naps_anywhere_but_vercel_production(client, fake_ai, monkeypatch):
    from app.settings import settings

    monkeypatch.setattr(settings, "simbha_llm_provider", "anthropic")
    for vercel, vercel_env in [(False, ""), (True, "preview"), (True, "development"), (False, "production")]:
        monkeypatch.setattr(settings, "vercel", vercel)
        monkeypatch.setattr(settings, "vercel_env", vercel_env)
        response = client.post("/api/simbha", json={"question": "Hi"}, headers={"Origin": "https://testserver"})
        assert response.status_code == 503
    assert fake_ai == [] and fake_ai.embed_call_list == []
    # The contact form keeps working while Simbha naps
    assert client.post("/api/contact", json={"name": "Asha", "email": "asha@example.com", "message": "Hello from the test."}).status_code == 201


def test_settings_errors_never_echo_values():
    import pytest
    from pydantic import ValidationError

    from app.settings import Settings

    with pytest.raises(ValidationError) as error_info:
        Settings(simbha_questions_per_day_limit="not-a-number")
    assert "input_value" not in str(error_info.value)


def test_site_wide_daily_cap_stops_everyone(client, fake_ai):
    with connection_pool.connection() as connection:
        connection.execute("INSERT INTO simbha_questions (sender_ip_hash) SELECT 'visitor-' || n FROM generate_series(1, 50) AS n")
    response = client.post("/api/simbha", json={"question": "Hi"})
    assert response.status_code == 429
    assert "for today" in response.json()["detail"]
    assert fake_ai == []


def test_per_minute_limit(client, fake_ai, monkeypatch):
    from app.settings import settings

    monkeypatch.setattr(settings, "simbha_questions_per_minute_limit", 2)
    status_code_list = [client.post("/api/simbha", json={"question": "Hi"}).status_code for _ in range(3)]
    assert status_code_list == [200, 200, 429]


def test_kill_switch_makes_no_calls(client, fake_ai, monkeypatch):
    from app.settings import settings

    monkeypatch.setattr(settings, "simbha_enabled", False)
    assert client.post("/api/simbha", json={"question": "Hi"}).status_code == 503
    assert fake_ai == [] and fake_ai.embed_call_list == []


def test_live_site_only_accepts_its_own_origin(client, fake_ai, monkeypatch):
    from app.settings import settings

    monkeypatch.setattr(settings, "vercel", True)
    monkeypatch.setattr(settings, "allowed_origins", ["https://example-portfolio.test"])
    assert client.post("/api/simbha", json={"question": "Hi"}, headers={"Origin": "https://evil.test"}).status_code == 403
    assert client.post("/api/simbha", json={"question": "Hi"}).status_code == 403
    assert client.post("/api/simbha", json={"question": "Hi"}, headers={"Origin": "http://testserver"}).status_code == 403
    # The site's own domain works without any configuration, and listed origins work too
    assert client.post("/api/simbha", json={"question": "Hi"}, headers={"Origin": "https://testserver"}).status_code == 200
    assert client.post("/api/simbha", json={"question": "Hi"}, headers={"Origin": "https://example-portfolio.test"}).status_code == 200
    assert len(fake_ai) == 2


def test_repeated_questions_reuse_the_cached_vector(client, fake_ai):
    store_chunk("About\nPranav builds things.")
    client.post("/api/simbha", json={"question": "What has he built?"})
    client.post("/api/simbha", json={"question": "  what has he BUILT "})
    assert len(fake_ai.embed_call_list) == 1
    assert len(fake_ai) == 2
