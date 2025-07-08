import os
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import ollama
import glob

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "RAG", "Daten", "Textdaten")
os.makedirs(DATA_DIR, exist_ok=True)

chroma_client = chromadb.Client(Settings(persist_directory=os.path.join(BASE_DIR, "chroma_db")))
collection = chroma_client.get_or_create_collection("rag_collection")

embedder = SentenceTransformer("all-MiniLM-L6-v2")

texts = []
metas = []
ids = []
for i, file in enumerate(glob.glob(os.path.join(DATA_DIR, "*.txt"))):
    with open(file, "r", encoding="utf-8") as f:
        content = f.read().strip()
        if content:
            texts.append(content)
            metas.append({"source": os.path.basename(file)})
            ids.append(str(i))

if texts:
    embeddings = embedder.encode(texts).tolist()
    collection.upsert(ids=ids, embeddings=embeddings, documents=texts, metadatas=metas)

while True:
    frage = input("Was möchtest du wissen? (oder 'exit' zum Beenden) ➤ ")
    if frage.strip().lower() in ["exit", "quit", "q"]:
        break
    frage_emb = embedder.encode([frage]).tolist()[0]
    results = collection.query(query_embeddings=[frage_emb], n_results=3, include=["documents", "metadatas"])

    kontext = "\n\n".join(results["documents"][0])
    quellen = "\n".join([f"Quelle: {meta['source']}" for meta in results["metadatas"][0]])

    prompt = f"""Beantworte die folgende Frage basierend auf dem bereitgestellten Kontext. Gib am Ende die genauen Quellen an.\n\nFrage:\n{frage}\n\nKontext:\n{kontext}\n\nAntwort:\n\nQuellen:\n{quellen}"""

    antwort = ollama.chat(model="mistral", messages=[{"role": "user", "content": prompt}])
    print(antwort['message']['content']) 