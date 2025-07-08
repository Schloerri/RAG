import os
import requests
import json
from haystack.document_stores import FAISSDocumentStore
from haystack.nodes import EmbeddingRetriever

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FAISS_DIR = os.path.join(BASE_DIR, "..", "faiss_index")  
FAISS_INDEX_PATH = os.path.join(FAISS_DIR, "faiss.index")  
FAISS_CONFIG_PATH = os.path.join(FAISS_DIR, "faiss_index.json") 

document_store = FAISSDocumentStore(
    faiss_index_path=FAISS_INDEX_PATH,
    faiss_config_path=FAISS_CONFIG_PATH
)

retriever = EmbeddingRetriever(
    document_store=document_store,
    embedding_model="sentence-transformers/all-MiniLM-L6-v2"
)

query = input("Was möchtest du über Alchemie wissen? ➤ ")

retrieved_docs = retriever.retrieve(query=query, top_k=3)

context = "\n\n".join([doc.content for doc in retrieved_docs])

sources = "\n".join([f"Quelle: {doc.meta.get('source', 'Unbekannt')} - Inhalt: {doc.content[:200]}..." for doc in retrieved_docs])

prompt = f""Beantworte die folgende Frage basierend auf dem Kontext unten. Stelle sicher, dass deine Antwort ausführlich und relevant zur Frage ist. Wenn der Kontext die Antwort nicht enthält, gib zu, dass du es nicht weißt

Frage:
{query}

Kontext:
{context}

Antwort:
"""


prompt += sources


response = requests.post(
    "http://localhost:11434/api/chat",
    json={
        "model": "mistral",
        "messages": [{"role": "user", "content": prompt}],
        "stream": False
    },
    stream=True
)

buffer = ""

for line in response.iter_lines():
    if line:
        buffer += line.decode("utf-8")

        try:
            data = json.loads(buffer)
            if 'message' in data:
                print(data['message'].get("content", ""), end="", flush=True)
            elif 'response' in data:
                print(data['response'].get("content", ""), end="", flush=True)
            buffer = ""  
        except json.JSONDecodeError:
            continue
