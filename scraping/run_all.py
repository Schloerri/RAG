import subprocess

THEMEN = [
    "Alchemie", "Hermetik", "Stein der Weisen", "Paracelsus", "Goldherstellung",
    "Transmutation", "Elixier des Lebens", "Philosophenstein", "Alkahest", "Prima Materia",
    "Chymie", "Spagyrik", "Alraune", "Tinkturen", "Aludel",
    "Aludelofen", "Alraunenwurzel", "Alchemistische Symbole", "Alchemistische Literatur", "Isaac Newton Alchemie",
    "Alchemistische Hochzeit", "Rosenkreuzer", "Alchemistische Labore", "Alchemistische Rezepte", "Alchemistische Metalle",
    "Alchemistische Farben", "Alchemistische Prozesse", "Alchemistische Geräte", "Alchemistische Manuskripte", "Moderne Alchemie",
    "Albedo (Alchemie)",
    "Johann Friedrich Böttger",
    "Citrinitas",
    "Nigredo",
    "Paracelsus",
    "Quecksilber",
    "Rubedo",
    "Salz (Alchemie)",
    "Schwefel (Alchemie)",
    "Alchemistische Symbole",
    "Alchemistische Literatur",
    "Alchemistische Hochzeit",
    "Rosenkreuzer",
    "Hermetische Philosophie",
    "Tabula Smaragdina",
    "Tria Principia",
    "Vier-Elemente-Lehre",
    "Quintessenz",
    "Opus Magnum",
    "Solve et Coagula",
    "Azoth",
    "Lapislazuli",
    "Caduceus",
    "Hermes Trismegistos",
    "Corpus Hermeticum",
    "Kybalion",
    "Gnosis",
    "Philosophenstein",
    "Paracelsus",
    "Zosimos von Panopolis",
    "Maria die Jüdin",
    "Geber (Alchemist)",
    "Artephius",
    "Fulcanelli",
    "Isaac Newton",
    "Basil Valentine",
    "Agrippa von Nettesheim",
    "John Dee",
    "Nicolas Flamel"
]

for thema in THEMEN:
    print(f"Starte Scraping für: {thema}")
    subprocess.run([
        "scrapy", "crawl", "alchemie", "-a", f"thema={thema}", "-a", "max_pages=2"
    ]) 