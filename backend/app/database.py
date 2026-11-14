# Postgres connection pool and the contact_messages table, created on startup if it is missing
from psycopg_pool import ConnectionPool

from app.settings import settings

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

connection_pool = ConnectionPool(settings.database_url, min_size=1, max_size=4, open=False)


def open_database():
    connection_pool.open(wait=True)
    with connection_pool.connection() as connection:
        connection.execute(contact_messages_table_sql)
