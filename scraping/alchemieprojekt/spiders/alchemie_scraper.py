import scrapy
import os
from parsel import Selector

# Themenliste
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

class AlchemieSpider(scrapy.Spider):
    name = "alchemie"
    custom_settings = { 'FEEDS': {} }

    def __init__(self, thema=None, max_pages=2, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.thema = thema
        self.max_pages = int(max_pages)
        self.visited = set()
        self.results = []
        if not os.path.exists('data'):
            os.makedirs('data')
        if self.thema:
            self.start_urls = [f'https://de.wikipedia.org/wiki/{self.thema.replace(" ", "_")}']
        else:
            self.start_urls = []

    def parse(self, response):
        title = response.css('h1::text').get()
        # Vollständigen, formatierten Text der Absätze extrahieren, aber ohne HTML-Tags
        paragraphs = response.css('div#mw-content-text p')
        text = "\n\n".join([Selector(text=p.get()).xpath('string(.)').get().strip() for p in paragraphs])
        self.results.append({
            'url': response.url,
            'titel': title,
            'text': text.strip()
        })
        if len(self.visited) >= self.max_pages:
            self.save_results()
            return
        for link in response.css('div#mw-content-text a::attr(href)').getall():
            if (
                link.startswith('/wiki/') and
                not any(x in link for x in ['Kategorie', 'Datei', 'Diskussion', 'Spezial']) and
                link not in self.visited
            ):
                self.visited.add(link)
                yield response.follow(link, self.parse)

    def save_results(self):
        if self.thema and self.results:
            txt_filename = f'{self.thema.replace(" ", "_").lower()}.txt'
            txt_path = os.path.join('data', txt_filename)
            with open(txt_path, 'w', encoding='utf-8') as f:
                f.write(self.results[0]['text'])
