# Rebuilds Simbha's knowledge: splits backend/knowledge/*.md into chunks, embeds them and replaces the simbha_chunks rows.
# Run by hand after editing the knowledge files:
#   uv run python -m app.simbha_index
# It indexes the database in SIMBHA_INDEX_DATABASE_URL when that is set (e.g. the live Neon database),
# otherwise the local one from .env. The URL is read from the environment so it never appears in a command.
import os
import re
from dataclasses import dataclass
from pathlib import Path

import psycopg

from app.database import simbha_tables_sql, to_vector_literal
from app.settings import settings
from app.simbha_embeddings import embed_texts

knowledge_folder = Path(__file__).resolve().parent.parent / "knowledge"
# Roughly 450 tokens: big enough to keep a topic together, small enough that 5 chunks stay cheap to send
max_chunk_characters = 1800


@dataclass
class KnowledgeChunk:
    source_file: str
    heading: str
    content: str


def split_markdown_into_chunks(markdown: str, source_file: str) -> list[KnowledgeChunk]:
    chunk_list = []
    heading = Path(source_file).stem.replace("-", " ").title()
    section_lines: list[str] = []

    def close_section():
        section_text = "\n".join(section_lines).strip()
        if section_text:
            for part in split_long_text(section_text):
                chunk_list.append(KnowledgeChunk(source_file, heading, f"{heading}\n{part}"))
        section_lines.clear()

    for line in markdown.splitlines():
        heading_match = re.match(r"^#{1,6}\s+(.*)", line)
        if heading_match:
            close_section()
            heading = heading_match.group(1).strip()
        else:
            section_lines.append(line)
    close_section()
    return chunk_list


def split_long_text(text: str) -> list[str]:
    # Keeps whole paragraphs together; only a single giant paragraph gets cut mid-way
    part_list, current_part = [], ""
    for paragraph in re.split(r"\n\s*\n", text):
        paragraph = paragraph.strip()
        while len(paragraph) > max_chunk_characters:
            part_list.append(paragraph[:max_chunk_characters])
            paragraph = paragraph[max_chunk_characters:]
        if current_part and len(current_part) + len(paragraph) + 2 > max_chunk_characters:
            part_list.append(current_part)
            current_part = paragraph
        else:
            current_part = f"{current_part}\n\n{paragraph}" if current_part else paragraph
    if current_part:
        part_list.append(current_part)
    return part_list


def read_knowledge_chunks() -> list[KnowledgeChunk]:
    chunk_list = []
    for markdown_file in sorted(knowledge_folder.glob("*.md")):
        chunk_list.extend(split_markdown_into_chunks(markdown_file.read_text(encoding="utf-8"), markdown_file.name))
    return chunk_list


def rebuild_index(database_url: str) -> int:
    chunk_list = read_knowledge_chunks()
    if not chunk_list:
        raise SystemExit(f"No markdown files found in {knowledge_folder}")
    embedding_list = embed_texts([chunk.content for chunk in chunk_list], input_type="document")
    with psycopg.connect(database_url) as connection:
        connection.execute(simbha_tables_sql)
        with connection.transaction():
            connection.execute("DELETE FROM simbha_chunks")
            for chunk, embedding in zip(chunk_list, embedding_list):
                connection.execute(
                    "INSERT INTO simbha_chunks (source_file, heading, content, embedding) VALUES (%s, %s, %s, %s::vector)",
                    (chunk.source_file, chunk.heading, chunk.content, to_vector_literal(embedding)),
                )
    return len(chunk_list)


if __name__ == "__main__":
    index_database_url = os.environ.get("SIMBHA_INDEX_DATABASE_URL")
    chunk_count = rebuild_index(index_database_url or settings.database_url)
    target = "the database in SIMBHA_INDEX_DATABASE_URL" if index_database_url else "the database in .env"
    print(f"Indexed {chunk_count} chunks from {knowledge_folder.name}/ into {target}")
