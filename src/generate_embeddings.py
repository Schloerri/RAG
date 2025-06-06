import os
import json
import shutil
from haystack.document_stores import FAISSDocumentStore
from haystack import Document
from haystack.nodes import EmbeddingRetriever

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEXT_DIR = os.path.join(BASE_DIR, "..", "Daten", "Textdaten")
META_PATH = os.path.join(BASE_DIR, "..", "Daten", "Metadaten", "metadata.json")
FAISS_DIR = os.path.join(BASE_DIR, "..", "faiss_index")
FAISS_INDEX_PATH = os.path.join(FAISS_DIR, "faiss.index")  
FAISS_DB_PATH = os.path.join(FAISS_DIR, 'faiss_db.sqlite')

with open(META_PATH, "r", encoding="utf-8") as f:
    metadata_index = json.load(f)

documents = []
for filename in os.listdir(TEXT_DIR):
    if filename.endswith(".txt"):
        filepath = os.path.join(TEXT_DIR, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read().strip()

        if content:
            base_meta = metadata_index.get(filename, {})
            base_meta["source"] = filename
            documents.append(Document(content=content, meta=base_meta))

document_store = FAISSDocumentStore(
    embedding_dim=384,
    faiss_index_factory_str="Flat",
    sql_url=f"sqlite:///{FAISS_DB_PATH}"
)

document_store.write_documents(documents)

retriever = EmbeddingRetriever(
    document_store=document_store,
    embedding_model="sentence-transformers/all-MiniLM-L6-v2"
)

document_store.update_embeddings(retriever)

if not os.path.exists(FAISS_DIR):
    os.makedirs(FAISS_DIR, exist_ok=True)

document_store.save(index_path=FAISS_INDEX_PATH)

print("Alle Texte mit Metadaten eingebettet und FAISS-Index gespeichert.")