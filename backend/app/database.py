# Postgres connection pool plus the tables the app needs (contact messages, Simbha's knowledge chunks and question log),
# created on startup if they are missing
from psycopg_pool import ConnectionPool

from app.settings import settings

# voyage-4-lite is asked for vectors of exactly this size, so the column type always matches
embedding_dimension = 1024

contact_messages_table_sql = """
CREATE TABLE IF NOT EXISTS contact_messages (
    id BIGSERIAL PRIMARY KEY,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    message TEXT NOT NULL,
    sender_ip_hash TEXT NOT NULL,
    is_email_sent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS contact_messages_sender_ip_hash_created_at_index
    ON contact_messages (sender_ip_hash, created_at);
"""

simbha_tables_sql = f"""
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS simbha_chunks (
    id BIGSERIAL PRIMARY KEY,
    source_file TEXT NOT NULL,
    heading TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector({embedding_dimension}) NOT NULL
);
CREATE TABLE IF NOT EXISTS simbha_questions (
    id BIGSERIAL PRIMARY KEY,
    sender_ip_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS simbha_questions_sender_ip_hash_created_at_index
    ON simbha_questions (sender_ip_hash, created_at);
CREATE INDEX IF NOT EXISTS simbha_questions_created_at_index
    ON simbha_questions (created_at);
CREATE TABLE IF NOT EXISTS simbha_query_embeddings (
    question_key TEXT PRIMARY KEY,
    embedding vector({embedding_dimension}) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
"""

connection_pool = ConnectionPool(settings.database_url, min_size=1, max_size=4, open=False)


def open_database():
    connection_pool.open(wait=True)
    with connection_pool.connection() as connection:
        connection.execute(contact_messages_table_sql)
        connection.execute(simbha_tables_sql)


def to_vector_literal(embedding: list[float]) -> str:
    # pgvector reads '[0.1,0.2,...]' text, so no extra adapter package is needed
    return "[" + ",".join(f"{value:.7f}" for value in embedding) + "]"
