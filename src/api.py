import os
import json
import requests
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from haystack.document_stores import FAISSDocumentStore
from haystack.nodes import EmbeddingRetriever

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)

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

@app.route("/api/rag", methods=["POST"])
def handle_query():
    data = request.get_json()
    query = data.get("query")
    logging.info(f"Query empfangen: {query}")

    if not query:
        return jsonify({"error": "Keine Abfrage übergeben"}), 400

    retrieved_docs = retriever.retrieve(query=query, top_k=3)
    logging.info(f"Anzahl gefundener Dokumente: {len(retrieved_docs)}")

    if len(retrieved_docs) == 0:
        return jsonify({"answer": "Leider wurden keine passenden Informationen gefunden."})

    context = "\n\n".join([doc.content for doc in retrieved_docs])
    sources = "\n".join([f"Quelle: {doc.meta.get('source', 'Unbekannt')}" for doc in retrieved_docs])

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

    logging.info(f"Prompt:\n{prompt}")

    try:
        response = requests.post(
            "http://localhost:11434/api/chat",
            json={
                "model": "mistral",
                "messages": [{"role": "user", "content": prompt}],
                "stream": False
            },
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        content = result.get("message", {}).get("content", "") or result.get("response", {}).get("content", "")

        logging.info(f"Antwort vom Chat-API: {content}")

        if not content:
            content = "Die Chat-API hat keine Antwort geliefert."

        return jsonify({"answer": content})

    except Exception as e:
        logging.error(f"Fehler bei der Chat-API Anfrage: {e}")
        return jsonify({"error": f"Fehler bei der Chat-API Anfrage: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
