from groq import Groq
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from dotenv import load_dotenv
import os

load_dotenv()


GROQ_API_KEY = os.environ.get("groq_api_key")



client = Groq(api_key=GROQ_API_KEY)

# embedding_model = SentenceTransformer(
#     "sentence-transformers/all-MiniLM-L6-v2"
# )

embedding_model = SentenceTransformer(
    "BAAI/bge-m3"
)



documents = [
    {
        "id": 1,
        "text": "Password reset issues can be solved by using the forgot password page."
    },
    {
        "id": 2,
        "text": "VPN connection problems are usually caused by expired credentials."
    },
    {
        "id": 3,
        "text": "Blue screen errors may happen because of outdated graphics drivers."
    },
    {
        "id": 4,
        "text": "Email login issues can be fixed by clearing browser cache and cookies."
    },
    {
        "id": 5,
        "text": "SI jzar ay pogi at mabait"
    },
    {
        "id": 6,
        "text": "Maraming salapi ang isang jzar"
    }
]


doc_texts = [doc["text"] for doc in documents]

doc_embeddings = embedding_model.encode(doc_texts)


def retrieve_top_k(query, k=2):
    query_embedding = embedding_model.encode([query])

    similarities = cosine_similarity(
        query_embedding,
        doc_embeddings
    )[0]

    top_indices = np.argsort(similarities)[::-1][:k]

    results = []

    for idx in top_indices:
        results.append({
            "text": documents[idx]["text"],
            "score": similarities[idx]
        })

    return results

user_query = input("Enter Query: ")

retrieved_docs = retrieve_top_k(user_query)

print("\n=== TOP MATCHES ===")

context = ""

for doc in retrieved_docs:
    print(f"\nScore: {doc['score']:.4f}")
    print(doc["text"])

    context += doc["text"] + "\n"


prompt = f"""
You are an IT help desk assistant.

Answer ONLY using the provided context, with additionl sentence from you.

Context:
{context}

User Question:
{user_query}
"""

response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {
            "role": "user",
            "content": prompt
        }
    ],
    temperature=0.3
)

print("\nRESPONSE\n")

print(response.choices[0].message.content)









