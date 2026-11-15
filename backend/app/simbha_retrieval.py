# Finds the knowledge chunks closest in meaning to a visitor's question (cosine distance in pgvector).
# Question vectors are cached, so repeated questions (like the suggested ones) never call Voyage again,
# and no pool connection is held while Voyage is being called.
import re

from app.database import connection_pool, to_vector_literal
from app.simbha_embeddings import embed_texts

# Old cached question vectors are dropped so the cache stays a few KB on the free Neon plan
cache_days = 30


def question_cache_key(question: str) -> str:
    return re.sub(r"\s+", " ", question.strip().lower()).rstrip("?!. ")


def find_relevant_chunks(question: str, limit: int = 5) -> list[str]:
    cache_key = question_cache_key(question)
    with connection_pool.connection() as connection:
        cached_row = connection.execute(
            "SELECT embedding::text FROM simbha_query_embeddings WHERE question_key = %s", (cache_key,)
        ).fetchone()
    embedding_literal = cached_row[0] if cached_row else to_vector_literal(embed_texts([question], input_type="query")[0])

    with connection_pool.connection() as connection:
        if not cached_row:
            connection.execute(
                "INSERT INTO simbha_query_embeddings (question_key, embedding) VALUES (%s, %s::vector) ON CONFLICT DO NOTHING",
                (cache_key, embedding_literal),
            )
            connection.execute(f"DELETE FROM simbha_query_embeddings WHERE created_at < NOW() - INTERVAL '{cache_days} days'")
        row_list = connection.execute(
            "SELECT content FROM simbha_chunks ORDER BY embedding <=> %s::vector LIMIT %s",
            (embedding_literal, limit),
        ).fetchall()
    return [row[0] for row in row_list]
