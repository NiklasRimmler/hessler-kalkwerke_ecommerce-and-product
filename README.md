# Hessler Naturkalk Produktfinder – Demo

Klickbare Demo-Webapp für die Hessler Kalkwerke: **Produktfinder** für Putzaufbauten, **Mengenrechner**, **FAQ** mit Stichwortsuche, **Produktseiten** und ein optionaler **Chat**.
Mobile first, Deutsch (Sie-Form). Einzige inhaltliche Grundlage sind die beiden Dateien in `quellen/`.

## Start

```bash
npm install
npm run dev        # http://localhost:5173
```

| Befehl | Zweck |
|---|---|
| `npm run dev` | Entwicklungsserver (inkl. `/api/chat`) |
| `npm test` | Vitest: Entscheidungsbaum, Ausschlussregeln, Mengenrechner, Datenkonsistenz, Chat-Endpunkt |
| `npm run build` | Typecheck + statischer Build nach `dist/` |
| `npm run preview` | Build lokal ansehen |

### Deployment

- **Vercel:** Repo importieren – `vercel.json` ist vorbereitet. `api/chat.ts` wird automatisch zur Serverless-Funktion.
- **Netlify:** Repo importieren – `netlify.toml` ist vorbereitet, die Funktion liegt in `netlify/functions/chat.mts` (Pfad `/api/chat`).
- **Beliebiges statisches Hosting:** Inhalt von `dist/` hochladen. Der Chat ist dann automatisch deaktiviert, alles andere funktioniert.
- **netcup Webhosting (Plesk/Apache):** `npm run build`, dann den Inhalt von `dist/` (inkl. `.htaccess`) per FTP/SFTP oder Plesk-Dateimanager hochladen – in eine Subdomain (z. B. `hessler-demo.niklasrimmler.com`) oder einen Unterordner (z. B. `niklasrimmler.com/hessler-demo/`); die Pfade im Build sind relativ.
  Die `.htaccess` setzt `noindex` und sinnvolles Caching. Passwortschutz für den Kunden am einfachsten in Plesk unter „Passwortgeschützte Verzeichnisse“.

Die App nutzt Hash-Routing (`#/finder?p=…`). Deep-Links funktionieren deshalb ohne Server-Rewrites.

### Chat (optional)

Den Chat schalten Sie mit `ANTHROPIC_API_KEY` in `.env` (lokal, siehe `.env.example`) oder als Umgebungsvariable beim Hoster frei.
Der Key wird **nur serverseitig** gelesen (`server/chat.ts`) und gelangt nie ins Frontend.
Ohne Key zeigt der Chat-Tab „in der Demo deaktiviert“.

Als Kontext bekommt der Chat ausschließlich die Daten aus `data/` und die Quelltexte. Der System-Prompt verlangt: nur aus diesen Daten antworten, bei Unsicherheit an die Beratung verweisen, keine Haftungszusagen.
Modell: `claude-opus-5` (per `CHAT_MODEL` änderbar). Der System-Prompt wird gecacht; bei einer Ablehnung durch die Sicherheitsfilter greift der serverseitige Fallback.

## Datenpflege (ohne Programmierkenntnisse)

Alle Inhalte liegen getrennt vom Code in `data/`:

| Datei | Inhalt |
|---|---|
| `produkte.json` | Produktstammdaten. Unbekannte Werte stehen auf `null` und erscheinen in der Oberfläche als „Angabe folgt“ bzw. „Datenblatt folgt“. |
| `entscheidungsbaum.json` | Fragen und Optionen. `ziel` verweist entweder auf eine Folgefrage (`knoten`), einen Aufbau (`aufbau`) oder die Beratung (`beratung`). Außerdem enthalten: Zusatzfragen, Beratungstexte, Kontakt. |
| `aufbauten.json` | Aufbauten mit Schichten von unten nach oben. Je Schicht: Produkt, Alternativen, `optional` („bei Bedarf“), `bedingung` (Zusatzfrage), `ersatz` (z. B. Sperrgrund statt Biogrund), Begründung. |
| `faq.json` | Fragen und Antworten mit Quelle und Suchbegriffen |
| `quelltexte.json` | Rohtexte der Quellen (Kontext für den Chat) |
| `../regeln.md` | Lesbare Übersicht aller Regeln, Annahmen und offenen Punkte |

**Verbrauchswerte ergänzen:** Tragen Sie in `produkte.json` beim jeweiligen Produkt `verbrauch_kg_m2_mm`, `sackgroesse_kg`, `wasser_l_pro_sack`, `min_/max_schichtdicke_mm`, `trocknung_tage_pro_mm` und `sack_pro_palette` ein.
Der Mengenrechner rechnet dann automatisch mit.
Achtung: Der Test „nur HP 14 hat Verbrauchswerte“ in `tests/daten.test.ts` schützt davor, versehentlich Fantasiewerte einzutragen. Wenn echte Datenblattwerte vorliegen, muss er angepasst werden.

**HP-14-Richtwert:** In `produkte.json` steht `hp-14.verbrauch_kg_m2_mm` (derzeit 1,0). Das ist die zentrale Stellschraube für den Widerspruch im Merkblatt (19 l Nassmörtel ↔ 5 m² pro Sack).

Nach jeder Änderung `npm test` ausführen. Die Tests prüfen unter anderem:
- Jeder Pfad endet in einem Aufbau oder in der Beratung.
- Alle Produkt-IDs existieren.
- Die Ausschlussregeln werden eingehalten.

## Aufbau des Codes

```
src/lib/        reine Logik (Finder, Regeln, Mengenrechner, Suche, Routing) – getestet
src/pages/      Start, Finder + Ergebnis, Rechner, FAQ, Produkte, Chat
src/components/ Layout, Icons, wiederverwendbare Bausteine
server/chat.ts  Chat-Handler (Web-Standard Request/Response), genutzt von Vite-Dev, Vercel und Netlify
tests/          Vitest
```

## Offene Punkte

Vollständige Liste in [`regeln.md`](./regeln.md), Abschnitt 7. Kurzfassung:

- **Kein Aufbau im Dokument** (die Demo leitet auf Beratung um):
  - Bims-Beton-Steine (innen, außen, Sockel)
  - innen: Lehmbauplatte, Blähglasplatte, Stroh-/Schilfplatte
  - Sockel: Hanf-Kalk-Steine
- **Annahmen, die bestätigt werden müssen:**
  - Fermacell → Aufbau „Plattensysteme“
  - Innen-Bestandsputze → gemeinsamer Aufbau „Bestandsputze“
  - Leichtgrundputz ohne Produktnamen → HP 9L
  - Oberputz ist eine feste Schicht
  - Zahnspachtelung im Mengenrechner mit 3 mm vorbelegt
- **Datenblätter fehlen** für alle Produkte außer HP 14.
- **Widerspruch im HP-14-Merkblatt:** 19 l Nassmörtel pro Sack vs. ca. 5 m² pro Sack bei 5 mm.
- **Gestaltung:** Die Hessler-Website war aus der Build-Umgebung nicht erreichbar. Farben und Anmutung sind deshalb aus dem Merkblatt abgeleitet (Terrakotta-Akzent, Sand-/Kalktöne, Erdbraun). Es wird kein Logo verwendet.
