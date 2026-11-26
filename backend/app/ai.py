from __future__ import annotations

import math
from functools import lru_cache

import httpx
from huggingface_hub import InferenceClient
from langchain_openai import ChatOpenAI

from .config import settings
from .db import issue_clusters, guidance_resources

# ---------------------------------------------------------------------------
# Chat / tool-calling and embeddings both run through Hugging Face Inference
# Providers (OpenAI-compatible router). The chat model is pinned to a
# Groq-hosted model (LPU hardware, ~0.5-0.9s/call) to keep agent turns well
# under a 2s budget - the shared/free HF router auto-picks a provider that
# can be an order of magnitude slower. No heuristic fallbacks (MVP): if the
# model genuinely fails the request errors out. max_retries/timeout are kept
# tight so failures surface fast instead of hanging the user's request.
# ---------------------------------------------------------------------------


@lru_cache
def get_chat() -> ChatOpenAI:
    if settings.gemini_api_key:
        return ChatOpenAI(
            model=settings.gemini_chat_model,
            base_url=settings.gemini_base_url,
            api_key=settings.gemini_api_key,
            temperature=0.2,
            max_retries=1,
            timeout=40,
        )
    return ChatOpenAI(
        model=settings.chat_model,
        base_url=settings.hf_base_url,
        api_key=settings.hf_token,
        temperature=0.2,
        max_retries=1,
        timeout=20,
    )


@lru_cache
def _embed_client() -> InferenceClient:
    return InferenceClient(token=settings.hf_token)


def _gemini_embed(text: str, task: str) -> list[float]:
    """Gemini embedding cut to embedding_dim and unit-normalised for cosine search."""
    r = httpx.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/{settings.gemini_embedding_model}:embedContent",
        headers={"x-goog-api-key": settings.gemini_api_key},
        json={
            "content": {"parts": [{"text": text[:8000]}]},
            "taskType": task,
            "outputDimensionality": settings.embedding_dim,
        },
        timeout=30,
    )
    r.raise_for_status()
    vec = r.json()["embedding"]["values"]
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


def embed_passage(text: str) -> list[float]:
    """Embed a stored document. e5 models require a 'passage:' prefix."""
    if settings.gemini_api_key:
        return _gemini_embed(text, "RETRIEVAL_DOCUMENT")
    vec = _embed_client().feature_extraction(
        f"passage: {text[:8000]}", model=settings.embedding_model
    )
    return vec.tolist()


def embed_query(text: str) -> list[float]:
    """Embed a search query. e5 models require a 'query:' prefix."""
    if settings.gemini_api_key:
        return _gemini_embed(text, "RETRIEVAL_QUERY")
    vec = _embed_client().feature_extraction(
        f"query: {text[:8000]}", model=settings.embedding_model
    )
    return vec.tolist()


# ---------------------------------------------------------------------------
# Atlas $vectorSearch (no in-memory fallback).
# ---------------------------------------------------------------------------


def search_clusters(
    embedding: list[float],
    category: str | None = None,
    location_id: str | None = None,
    limit: int = 5,
) -> list[dict]:
    stage: dict = {
        "index": settings.atlas_vector_index,
        "path": "embedding",
        "queryVector": embedding,
        "numCandidates": 100,
        "limit": limit,
    }
    filters: dict = {}
    if category:
        filters["category"] = category
    if location_id:
        from bson import ObjectId

        filters["location_ids"] = ObjectId(location_id)
    if filters:
        stage["filter"] = filters
    pipeline = [
        {"$vectorSearch": stage},
        {"$project": {"title": 1, "category": 1, "score": {"$meta": "vectorSearchScore"}}},
    ]
    results = list(issue_clusters().aggregate(pipeline))
    return [
        {"cluster_id": str(r["_id"]), "title": r.get("title", ""), "score": r.get("score", 0.0)}
        for r in results
    ]


def search_guidance_vectors(embedding: list[float], category: str | None = None, limit: int = 6) -> list[dict]:
    stage: dict = {
        "index": settings.guidance_vector_index,
        "path": "embedding",
        "queryVector": embedding,
        "numCandidates": 100,
        "limit": limit,
    }
    if category:
        stage["filter"] = {"category": category}
    pipeline = [
        {"$vectorSearch": stage},
        {
            "$project": {
                "type": 1,
                "name": 1,
                "category": 1,
                "description": 1,
                "url": 1,
                "location_scope": 1,
                "score": {"$meta": "vectorSearchScore"},
            }
        },
    ]
    return list(guidance_resources().aggregate(pipeline))
