# Checks that knowledge files are split by heading into right-sized chunks and stored with their vectors
from app import simbha_index
from app.database import connection_pool
from app.settings import settings
from app.simbha_index import max_chunk_characters, split_markdown_into_chunks


def test_chunks_follow_headings_and_keep_them():
    markdown = "Intro line.\n\n# Projects\njobscout finds jobs.\n\n## Skin Care AI\nAnswers skin questions."
    chunk_list = split_markdown_into_chunks(markdown, "my-work.md")
    assert [chunk.heading for chunk in chunk_list] == ["My Work", "Projects", "Skin Care AI"]
    assert chunk_list[2].content == "Skin Care AI\nAnswers skin questions."
    assert all(chunk.source_file == "my-work.md" for chunk in chunk_list)


def test_long_sections_are_split_under_the_size_limit():
    paragraph = "word " * 200
    chunk_list = split_markdown_into_chunks("# Long\n" + "\n\n".join([paragraph] * 6), "long.md")
    assert len(chunk_list) > 1
    assert all(len(chunk.content) <= max_chunk_characters + len("Long\n") for chunk in chunk_list)


def test_rebuild_replaces_all_chunks(client, tmp_path, monkeypatch):
    (tmp_path / "about.md").write_text("# About\nPranav lives with Simbha.", encoding="utf-8")
    monkeypatch.setattr(simbha_index, "knowledge_folder", tmp_path)
    assert simbha_index.rebuild_index(settings.database_url) == 1
    assert simbha_index.rebuild_index(settings.database_url) == 1
    with connection_pool.connection() as connection:
        assert connection.execute("SELECT heading FROM simbha_chunks").fetchall() == [("About",)]
