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

prompt = f"""
Beantworte die folgende Frage sachlich korrekt, ausführlich, direkt und inhaltlich passend, basierend ausschließlich auf dem angegebenen Kontext. Die Antwort soll klar und vollständig sein, aber ohne unnötige Ausschmückungen. Verwende nur Informationen, die explizit im Kontext vorhanden sind. Wenn keine ausreichenden Informationen im Kontext enthalten sind, erkläre dies offen.

Wichtig: Schreibe die Frage nicht um. Gib nach der Antwort nur den Dateinamen der genutzten Quelle(n) an, ohne Textausschnitte oder Zusammenfassungen.

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
