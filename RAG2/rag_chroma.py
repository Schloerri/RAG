import os
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import ollama
import glob
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "scraping", "data")
META_PATH = os.path.join(BASE_DIR, "..", "scraping", "metadata", "metadata.json")
os.makedirs(DATA_DIR, exist_ok=True)

with open(META_PATH, "r", encoding="utf-8") as f:
    metadata_index = json.load(f)

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
            filename = os.path.basename(file)
            base_meta = metadata_index.get(filename, {})
            base_meta["source"] = filename
            texts.append(content)
            metas.append(base_meta)
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
    quellen = "\n".join([f"Quelle: {meta.get('source', 'Unbekannt')}" for meta in results["metadatas"][0]])

    prompt = f"""Beantworte die folgende Frage basierend auf dem bereitgestellten Kontext. Gib am Ende die genauen Quellen an.\n\nFrage:\n{frage}\n\nKontext:\n{kontext}\n\nAntwort:\n\nQuellen:\n{quellen}"""

    antwort = ollama.chat(model="mistral", messages=[{"role": "user", "content": prompt}])
    print(antwort['message']['content'])
    for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
        quelle = meta.get('source', 'Unbekannt')
        auszug = doc[:200].replace('\n', ' ')
        print(f"\nQuelle: {quelle}\nKontextauszug: {auszug}...") 