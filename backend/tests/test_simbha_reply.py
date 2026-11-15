# Checks the Claude branch against a fake client: it streams text, asks for no thinking, and handles refusals and cut-offs
import anthropic
import pytest

from app import simbha_reply
from app.settings import settings


class FakeStream:
    def __init__(self, piece_list, stop_reason):
        self.text_stream = iter(piece_list)
        self.stop_reason = stop_reason

    def __enter__(self):
        return self

    def __exit__(self, *exc_info):
        return False

    def get_final_message(self):
        return type("FakeMessage", (), {"stop_reason": self.stop_reason})()


@pytest.fixture
def fake_claude(monkeypatch):
    request_list = []
    reply = {"piece_list": ["Mrrp. ", "He ships."], "stop_reason": "end_turn"}

    class FakeMessages:
        def stream(self, **request):
            request_list.append(request)
            return FakeStream(reply["piece_list"], reply["stop_reason"])

    class FakeAnthropic:
        def __init__(self, api_key):
            self.messages = FakeMessages()

    monkeypatch.setattr(anthropic, "Anthropic", FakeAnthropic)
    monkeypatch.setattr(settings, "simbha_llm_provider", "anthropic")
    monkeypatch.setattr(settings, "vercel", True)
    monkeypatch.setattr(settings, "vercel_env", "production")
    return request_list, reply


def test_claude_reply_streams_without_thinking(fake_claude):
    request_list, _ = fake_claude
    assert "".join(simbha_reply.stream_reply("persona", [{"role": "user", "content": "Hi"}])) == "Mrrp. He ships."
    request = request_list[0]
    assert request["model"] == "claude-haiku-5-5"
    assert request["thinking"] == {"type": "disabled"}
    assert request["output_config"] == {"effort": "low"}
    assert "temperature" not in request


def test_claude_refusal_and_cut_off_end_in_character(fake_claude):
    _, reply = fake_claude
    reply.update(piece_list=[], stop_reason="refusal")
    assert "".join(simbha_reply.stream_reply("persona", [])) == simbha_reply.refusal_line
    reply.update(piece_list=["He likes"], stop_reason="max_tokens")
    assert "".join(simbha_reply.stream_reply("persona", [])) == "He likes" + simbha_reply.cut_off_line


def test_claude_is_refused_outside_production_even_when_called_directly(fake_claude, monkeypatch):
    request_list, _ = fake_claude
    monkeypatch.setattr(settings, "vercel_env", "preview")
    with pytest.raises(RuntimeError):
        "".join(simbha_reply.stream_reply("persona", []))
    assert request_list == []
