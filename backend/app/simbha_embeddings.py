# Turns text into vectors with Voyage AI: documents when indexing, questions when a visitor asks something.
# Calls Voyage's REST endpoint directly with httpx; the voyageai SDK pulls in LangChain, too heavy for a serverless function.
import httpx

from app.database import embedding_dimension
from app.settings import settings

voyage_embeddings_url = "https://api.voyageai.com/v1/embeddings"
# Voyage accepts up to 1,000 texts per request; the knowledge base is far smaller, but batch anyway
batch_size = 128


def embed_texts(texts: list[str], input_type: str) -> list[list[float]]:
    embedding_list = []
    for start in range(0, len(texts), batch_size):
        response = httpx.post(
            voyage_embeddings_url,
            headers={"Authorization": f"Bearer {settings.voyage_api_key.get_secret_value()}"},
            json={
                "input": texts[start : start + batch_size],
                "model": settings.voyage_model,
                "input_type": input_type,
                "output_dimension": embedding_dimension,
            },
            timeout=20,
        )
        response.raise_for_status()
        embedding_list.extend(item["embedding"] for item in sorted(response.json()["data"], key=lambda item: item["index"]))
    return embedding_list
