Nutzung
generate_embeddings.py ausführen, um FAISS-Index zu erzeugen
rag_qa_ollama.py starten um eine Frage zu stellen

Jedes Mal wenn neue Embeddings erstellt werden müssen, muss
1. der Inhalt vom gesamten faiss_index Ordner gelöscht werden
2. generate_embeddings.py ausgeführt werden
3. die faiss.json, die erstellt wird in faiss_index.json umbenennen (wird noch angepasst)

Anforderungen
Python 3.8+
Haystack
sentence-transformers
FAISS