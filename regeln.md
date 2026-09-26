# Regeln & Aufbauten – Hessler Naturkalk Produktfinder (Demo)

Diese Datei fasst **für Menschen lesbar** zusammen, welche Regeln der Produktfinder anwendet.
Die maschinenlesbaren Daten liegen in `data/`:

| Datei | Inhalt |
|---|---|
| `data/entscheidungsbaum.json` | Fragen, Auswahloptionen, Verweise auf Folgefrage / Aufbau / Beratung, Zusatzfragen |
| `data/aufbauten.json` | 33 Aufbauempfehlungen mit Schichten (unten → oben), Begründungen, Hinweisen |
| `data/produkte.json` | 21 Produkte (HP 14 vollständig aus dem Merkblatt, übrige nur mit Angaben aus dem Aufbaudokument) |
| `data/faq.json` | 15 FAQ, ausschließlich aus den Quellen |

**Quellen (einzige Wahrheit):**
`quellen/KD_Aufbauempfehlungen_Online.docx` (Aufbauempfehlungen) und `quellen/HP 14 Kalkhaftputz.pdf` (Technisches Merkblatt, Stand September 2022).
Alles, was dort nicht steht, ist in den Daten `null` bzw. in der Oberfläche als „Angabe folgt“ / „Datenblatt folgt“ gekennzeichnet.

Legende: ⚠️ = Annahme (siehe unten) · _kursiv_ = „bei Bedarf“ / „bei Wunsch“ laut Dokument

---

## 1. Entscheidungsbaum: Pfad → Aufbau

Zusätzlich führt auf jeder Untergrund-Ebene **„Sonstiges“** und **„Ich bin mir nicht sicher“** zur Beratung
(Kontakt: info@hessler-kalkwerk.de · 06222/9275-0 · „Bilder per E-Mail schicken“).

| Pfad | Ergebnis |
|---|---|
| Innenbereich → Mauerwerk → Natursteinmauerwerk | `innen-naturstein-vollziegel` |
| Innenbereich → Mauerwerk → Vollziegel / Backsteine | `innen-naturstein-vollziegel` |
| Innenbereich → Mauerwerk → Hochlochziegel / Poroton | `innen-modernes-mauerwerk` |
| Innenbereich → Mauerwerk → KS-Steine / Ytong | `innen-modernes-mauerwerk` |
| Innenbereich → Mauerwerk → Bims-Beton-Steine | **Beratung (Lücke)** |
| Innenbereich → Mauerwerk → Hanf-Kalk-Steine | `innen-hanf-kalk` |
| Innenbereich → Mauerwerk → Lehmsteine | `innen-lehmsteine` |
| Innenbereich → Plattensysteme → Rigipsplatte | `innen-plattensysteme` |
| Innenbereich → Plattensysteme → Fermacell | `innen-plattensysteme` ⚠️ |
| Innenbereich → Plattensysteme → Holzweichfaserplatte | `innen-holzweichfaser` |
| Innenbereich → Plattensysteme → Heraklithplatte | `innen-heraklith` |
| Innenbereich → Plattensysteme → Lehmbauplatte | **Beratung (Lücke)** |
| Innenbereich → Plattensysteme → Blähglasplatte (VeroBoard Rapid) | **Beratung (Lücke)** |
| Innenbereich → Plattensysteme → Stroh- / Schilfplatte | **Beratung (Lücke)** |
| Innenbereich → Plattensysteme → Steinwolle / Styrodur / Styropor | `innen-daemmplatten` |
| Innenbereich → Beton → Geschalter Beton | `innen-geschalter-beton` |
| Innenbereich → Beton → Fertigbetonteile | `innen-beton-fertigteile` |
| Innenbereich → Beton → Stampfbeton | `innen-stampfbeton` |
| Innenbereich → Beton → WU-Beton / Bitumen | `innen-wu-beton` |
| Innenbereich → Altbestand (Putze) → Kalkputz | `innen-bestandsputze` ⚠️ |
| Innenbereich → Altbestand (Putze) → Kalk-Zement-Putz | `innen-bestandsputze` ⚠️ |
| Innenbereich → Altbestand (Putze) → Lehmputz | `innen-bestandsputze` ⚠️ |
| Innenbereich → Altbestand (Putze) → Gipsputz | `innen-bestandsputze` ⚠️ |
| Innenbereich → Strohballenhaus | `innen-strohballen` |
| Außenbereich → Mauerwerk → Natursteinmauerwerk | `aussen-naturstein-vollziegel` |
| Außenbereich → Mauerwerk → Vollziegel / Backsteine | `aussen-naturstein-vollziegel` |
| Außenbereich → Mauerwerk → Hochlochziegel / Poroton | `aussen-modernes-mauerwerk` |
| Außenbereich → Mauerwerk → KS-Steine / Ytong | `aussen-modernes-mauerwerk` |
| Außenbereich → Mauerwerk → Bims-Beton-Steine | **Beratung (Lücke)** |
| Außenbereich → Mauerwerk → Hanf-Kalk-Steine | `aussen-hanf-kalk` |
| Außenbereich → Mauerwerk → Lehmsteine | `aussen-lehmsteine` |
| Außenbereich → Plattensysteme → Holzweichfaserplatte | `aussen-holzweichfaser` |
| Außenbereich → Plattensysteme → Heraklithplatte | `aussen-heraklith` |
| Außenbereich → Plattensysteme → Stroh- / Schilfplatte | `aussen-stroh-schilfplatten` |
| Außenbereich → Plattensysteme → Steinwolle / Styrodur / Styropor | `aussen-daemmplatten` |
| Außenbereich → Beton → Geschalter Beton | `aussen-geschalter-beton` |
| Außenbereich → Beton → Fertigbetonteile | `aussen-beton-fertigteile` |
| Außenbereich → Beton → Stampfbeton | `aussen-stampfbeton` |
| Außenbereich → Beton → WU-Beton / Bitumen | `aussen-wu-beton` |
| Außenbereich → Altbestand (Putze) → Reiner Naturkalkputz | `aussen-naturkalkputz` |
| Außenbereich → Altbestand (Putze) → Kalk-Zement-Putz | `aussen-kalk-zement-putz` |
| Außenbereich → Altbestand (Putze) → Lehmputz | `aussen-lehmputz` |
| Außenbereich → Strohballenhaus | `aussen-strohballen` |
| Sockelbereich → Mauerwerk → Natursteinmauerwerk | `sockel-naturstein-vollziegel` |
| Sockelbereich → Mauerwerk → Vollziegel / Backsteine | `sockel-naturstein-vollziegel` |
| Sockelbereich → Mauerwerk → Hochlochziegel / Poroton | `sockel-modernes-mauerwerk-styrodur` |
| Sockelbereich → Mauerwerk → KS-Steine / Ytong | `sockel-modernes-mauerwerk-styrodur` |
| Sockelbereich → Mauerwerk → Bims-Beton-Steine | **Beratung (Lücke)** |
| Sockelbereich → Mauerwerk → Hanf-Kalk-Steine | **Beratung (Lücke)** |
| Sockelbereich → Plattensysteme → Styrodur / Styropor | `sockel-modernes-mauerwerk-styrodur` |
| Nasser Natursteinkeller | `keller-nass` (keine Untergrundfrage) |

**Bilanz:** 71 Endpunkte → 44 führen zu einem Aufbau, 27 zur Beratung (8 Lücken + 19 × „Sonstiges“ / „Ich bin mir nicht sicher“). Alle 33 Aufbauten sind erreichbar, kein toter Pfad.

## 2. Schichtaufbauten (von unten nach oben)

| Aufbau | Schichten |
|---|---|
| `innen-naturstein-vollziegel` | HP 9VM → HP 9 → _HP 14 + Gewebe (bei Bedarf)_ → HP 90 → _Kalkfarbe (bei Wunsch)_ |
| `innen-modernes-mauerwerk` | HP 14 Zahnspachtelung → HP 9L ⚠️ (alt. HP 9U, HP 9SL) → _HP 14 + Gewebe (bei Bedarf)_ → HP 90 → _Kalkfarbe (bei Wunsch)_ |
| `innen-hanf-kalk` | HP 9U → _Gewebe im oberen Drittel (bei Bedarf)_ → _HP 14 Egalisierung (bei Bedarf)_ → HP 90 → _Kalkfarbe (bei Wunsch)_ |
| `innen-lehmsteine` | HP 9VM Schlämme → HP 9L ⚠️ (alt. HP 9U, HP 9SL) → _HP 14 + Gewebe (bei Bedarf)_ → HP 90 → _Kalkfarbe (bei Wunsch)_ |
| `innen-plattensysteme` | HP 9500 / Sperrgrund → HP 14 + Gewebe → HP 90 → _Kalkfarbe (bei Wunsch)_ |
| `innen-holzweichfaser` | HP 14 + Gewebe (keine Grundierung) → HP 90 → _Kalkfarbe (bei Wunsch)_ |
| `innen-heraklith` | HP 14 Zahnspachtelung (ca. 1 Woche trocknen) → HP 14 + Gewebe → HP 90 → _Kalkfarbe (bei Wunsch)_ |
| `innen-daemmplatten` | HP 6 Zahnspachtelung → HP 14 + Gewebe → HP 90 → _Kalkfarbe (bei Wunsch)_ |
| `innen-geschalter-beton` | _Schalungsölentferner (bei Ölresten)_ → HP 9500 / Sperrgrund → HP 14 Egalisierung → _Gewebe (bei Wunsch)_ → HP 90 → _Kalkfarbe (bei Wunsch)_ |
| `innen-beton-fertigteile` | HP 9500 / Sperrgrund → HP 14 + Gewebe → HP 90 → _Kalkfarbe (bei Wunsch)_ |
| `innen-stampfbeton` | HP 9VM → HP 9 → _HP 14 + Gewebe (bei Bedarf)_ → HP 90 → _Kalkfarbe (bei Wunsch)_ |
| `innen-wu-beton` | HP 6 Zahnspachtelung → HP 14 + Gewebe → HP 90 → _Kalkfarbe (bei Wunsch)_ |
| `innen-bestandsputze` | HP 9500 / Sperrgrund → _HP 14 + Gewebe (bei Bedarf)_ → HP 90 → _Kalkfarbe (bei Wunsch)_ |
| `innen-strohballen` | HP 9VM → _Schilfrohr-Putzträgerplatte (bei Holzständerbauweise)_ → HP 9L ⚠️ (alt. HP 9U, HP 9SL) → HP 14 + Gewebe → HP 90 → _Kalkfarbe (bei Wunsch)_ |
| `aussen-naturstein-vollziegel` | HP 9VM → HP 9 → HP 14 + Gewebe → HP 90 (1,0 mm) → Silikatfarbe |
| `aussen-modernes-mauerwerk` | HP 14 Zahnspachtelung → HP 9L (alt. HP 9U, HP 9SL) → HP 14 + Gewebe → HP 90 (1,0 mm) → Silikatfarbe |
| `aussen-hanf-kalk` | HP 9U mit Gewebe im oberen Drittel → HP 90 (1,0 mm) → Silikatfarbe |
| `aussen-lehmsteine` | HP 9VM Schlämme → HP 9L (alt. HP 9U, HP 9SL) → HP 14 + Gewebe → HP 90 (1,0 mm) → Silikatfarbe |
| `aussen-holzweichfaser` | HP 14 Zahnspachtelung → HP 9L (alt. HP 9U, HP 9SL) → HP 14 + Gewebe → HP 90 (1,0 mm) → Silikatfarbe |
| `aussen-stroh-schilfplatten` | HP 14 Zahnspachtelung → HP 9L (alt. HP 9U, HP 9SL) → HP 14 + Gewebe → HP 90 (1,0 mm) → Silikatfarbe |
| `aussen-heraklith` | HP 14 Zahnspachtelung (ca. 1 Woche trocknen) → HP 9L (alt. HP 9U, HP 9SL) → HP 14 + Gewebe → HP 90 (1,0 mm) → Silikatfarbe |
| `aussen-daemmplatten` | HP 6 Zahnspachtelung → HP 1L → HP 6 + Gewebe → _zementh. Oberputz (auf Wunsch, nicht im Programm)_ → Silikatfarbe |
| `aussen-geschalter-beton` | HP 14 Zahnspachtelung → HP 9 → HP 14 + Gewebe → HP 90 (1,0 mm) → Silikatfarbe |
| `aussen-beton-fertigteile` | HP 14 Zahnspachtelung → HP 9 → HP 14 + Gewebe → HP 90 (1,0 mm) → Silikatfarbe |
| `aussen-stampfbeton` | HP 9VM → HP 9 → HP 14 + Gewebe → HP 90 (1,0 mm) → Silikatfarbe |
| `aussen-wu-beton` | HP 6 Zahnspachtelung → HP 1 → HP 6 + Gewebe → _zementh. Oberputz (auf Wunsch, nicht im Programm)_ → Silikatfarbe |
| `aussen-naturkalkputz` | _HP 14 + Gewebe (bei Bedarf)_ → HP 90 (1,0 mm) → Silikatfarbe |
| `aussen-kalk-zement-putz` | _HP 6 + Gewebe (bei Bedarf)_ → _zementh. Oberputz (auf Wunsch, nicht im Programm)_ → Silikatfarbe |
| `aussen-lehmputz` | HP 9VM Schlämme → HP 9L (alt. HP 9U, HP 9SL) → HP 14 + Gewebe → HP 90 (1,0 mm) → Silikatfarbe |
| `aussen-strohballen` | HP 9VM → _Schilfrohr-Putzträgerplatte (bei Holzständerbauweise)_ → HP 9L ⚠️ (alt. HP 9U, HP 9SL) → HP 14 + Gewebe → HP 90 (1,0 mm) → Silikatfarbe |
| `sockel-naturstein-vollziegel` | _HP 10 halbdeckend (bei Bedarf)_ → HP 1 → HP 6 + Gewebe → _zementh. Oberputz (auf Wunsch)_ → Silikatfarbe |
| `sockel-modernes-mauerwerk-styrodur` | HP 6 Zahnspachtelung → HP 1L → HP 6 + Gewebe → _zementh. Oberputz (auf Wunsch)_ → Silikatfarbe |
| `keller-nass` | _HP 9VM (je nach Mauerwerk)_ → HP 9PM → _HP 9100PM Sumpfkalkfarbe (bei Wunsch)_ |

„HP 9“ steht für „Naturkalk-Grundputz frei aus dem Sortiment wählbar, z. B. HP 9“; „HP 90“ für „Oberputz nach Optik, z. B. HP 90“ – so wird es in der Oberfläche auch angezeigt.

## 3. Zusatzfragen (nur wenn der Aufbau sie betrifft)

| Frage | Wirkung | betrifft |
|---|---|---|
| Schalölreste vorhanden? | + Schalungsölentferner als erste Schicht | `innen-geschalter-beton` |
| Gefahr durchschlagender Stoffe (z. B. Kleisterrückstände)? | Sperrgrund **statt** HP 9500 Biogrund | innen: Plattensysteme, geschalter Beton, Fertigteile, Bestandsputze |
| Erhöhtes Rissrisiko / Materialwechsel? | „bei Bedarf“-Gewebe-/Egalisierungslage wird aktiv | alle Aufbauten mit „bei Bedarf“-Gewebe (innen Mauerwerk/Stampfbeton/Bestand, innen Hanf-Kalk, innen geschalter Beton, außen Naturkalk- und KZ-Bestandsputz) |
| Holzständerbauweise? | + Schilfrohr-Putzträgerplatte | Strohballenhaus innen/außen |
| Farbanstrich gewünscht? | + Kalkfarbe (innen) bzw. HP 9100PM (Keller) | alle Innen-Aufbauten, Keller. **Außen/Sockel wird nicht gefragt – Silikatanstrich ist dort immer Bestandteil.** |

Standardantwort jeweils „Nein“. Nicht aktive „bei Bedarf“-Schichten bleiben im Ergebnis sichtbar (ausgegraut), damit der Kunde weiß, dass es sie gibt.

## 4. Fachliche Regeln & Ausschlussfälle (werden per Test geprüft)

| # | Regel | Quelle |
|---|---|---|
| R1 | **Außen** auf nicht saugfähigen Untergründen (Steinwolle/Styrodur/Styropor, WU-Beton/Bitumen) und auf bestehendem **Kalk-Zement-Putz**: nur zementhaltige Produkte (HP 6, HP 1 / HP 1L) – **kein Naturkalk-Grundputz, kein HP 14, kein HP 90**. | Aufbaudokument 2b) h, l, n |
| R2 | **Sockel**: immer zementär (HP 10 bei Bedarf, HP 1 / HP 1L, HP 6) – kein Naturkalk-Produkt. | 3b) |
| R3 | **Außen und Sockel**: immer Silikatanstrich als Witterungsschutz (Pflichtschicht). HP 14 ist nicht hydrophobiert. | 2b), 3b), Merkblatt |
| R4 | **Gipshaltige Untergründe** (Rigips, Gipsputz): Grundierung HP 9500 Biogrund bzw. Sperrgrund ist Pflicht. | Merkblatt „Untergrund“, 1b) e, m |
| R5 | **HP 9PM** nur für dauerhaft feuchte / nasse Mauerwerke → kommt ausschließlich in `keller-nass` vor. | 4) |
| R6 | **Heraklith**: HP-14-Zahnspachtelung ca. 1 Woche trocknen lassen, dann weiter. | 1b) g, 2b) g |
| R7 | **Dickschicht > 10 mm** auf Platten, Beton, Bestandsputzen → Hinweis „bitte Kontakt aufnehmen“. | 1b) e–j, l, m; 2b) m, n |
| R8 | **Verarbeitung nur > 5 °C**, reine Kalkmörtel 4 Wochen frostfrei; **HP 14 ohne Beimischungen**. Wird bei jedem Aufbau mit HP 14 angezeigt. | Merkblatt |
| R9 | **Nasser Keller**: Luftfeuchtigkeit muss dauerhaft reguliert sein (Lüften / taupunktgesteuerte Lüftung). | 4) |
| R10 | **Innen** auf Styropor / WU-Beton ist dagegen Naturkalk erlaubt: HP 6 als Haftbrücke, danach HP 14 und Naturkalk-Oberputz. | 1b) h, l |

## 5. Mengenrechner – Kennwerte

| Wert | HP 14 | Quelle |
|---|---|---|
| Sackgröße | 25 kg | Merkblatt |
| Wasser | ca. 6 l / Sack | Merkblatt |
| Nassmörtel | ca. 19 l / Sack | Merkblatt |
| Ergiebigkeit | ca. 5 m² / Sack bei 5 mm → **1,0 kg/(m²·mm)** (zentral konfigurierbar, „Richtwert, abhängig vom Untergrund“) | Merkblatt |
| Schichtdicke | min. 3 mm / max. 5 mm pro Lage → > 5 mm = mehrere Lagen, < 3 mm = Warnung | Merkblatt |
| Gewebespachtelung | ca. 5 mm | Merkblatt |
| Zahnspachtelung | mind. 6er Zahntraufel (Schichtdicke nicht angegeben → Vorschlag 3 mm ⚠️, editierbar) | Merkblatt |
| Trocknung | ca. 1 Tag / mm | Merkblatt |
| Palette | 42 Sack ≈ 1.050 kg (ab 42 Sack Paletten anzeigen) | Merkblatt |

Beispiel: 20 m² × 5 mm × 1,0 kg/(m²·mm) × 1,10 Verschnitt = 110 kg → **5 Sack** à 25 kg (4,4 aufgerundet).

**Alle anderen Produkte:** `verbrauch_kg_m2_mm: null` → „Verbrauchswert folgt – Demo“. Es werden keine Fantasiewerte berechnet.

---

## 6. Annahmen (von mir getroffen, bitte bestätigen)

1. **Fermacell** (innen) → Aufbau „Plattensysteme“ (dort wird nur Rigips genannt).
2. **Innen-Altbestand** Kalkputz, Kalk-Zement-Putz, Lehmputz, Gipsputz → alle auf „Bestandsputze“ (1b) m) gemappt.
3. **Leichtgrundputz ohne Produktnamen** (innen Modernes Mauerwerk, innen Lehmsteine, Strohballenhaus innen/außen) → **HP 9L** (außen explizit genannt).
4. **Oberputz**: In den Aufzählungen ist der Oberputz immer Bestandteil des Aufbaus, im Fließtext heißt es teils „auf Wunsch“. Modelliert als feste Schicht (Naturkalk). Nur der **zementhaltige** Oberputz (nicht im Programm) ist als „auf Wunsch“ markiert.
5. **Zahnspachtelung HP 14 im Mengenrechner**: Vorschlagswert 3 mm (= Mindeststärke laut Merkblatt), vom Nutzer änderbar.
6. **Armierungsgewebe** wird als Zubehör zu jeder Gewebespachtelung gelistet (ohne Mengenangabe).
7. **Bindemittel-Zuordnung**: HP 6 und HP 10 als „zementhaltig“ (Dokument: „zementhaltige Zahnspachtelung“ / „zementhaltiger Vorspritzmörtel“); HP 9500 Biogrund, Sperrgrund, Schalungsölentferner: Bindemittel unbekannt (`null`).
8. **Hersteller**: Sperrgrund, Schalungsölentferner, Schilfrohrplatte, Gewebe – im Dokument ohne Hersteller → `null`.

## 7. Offene Punkte für Hessler

### Auswahloptionen ohne Aufbau (→ Demo leitet auf Beratung)
- [ ] **Innen & Außen: Bims-Beton-Steine**
- [ ] **Innen Plattensysteme: Lehmbauplatte**
- [ ] **Innen Plattensysteme: Blähglasplatte (VeroBoard Rapid)**
- [ ] **Innen Plattensysteme: Stroh- / Schilfplatte** (außen gibt es einen Aufbau 2b) f – gilt der auch innen?)
- [ ] **Sockel: Bims-Beton-Steine, Hanf-Kalk-Steine**

### Zuordnungen / Inhalte zu bestätigen
- [ ] Fermacell = Aufbau „Plattensysteme“? (Annahme 1)
- [ ] Innen-Bestandsputze: gilt 1b) m für Kalk-, Kalk-Zement-, Lehm- **und** Gipsputz? (Annahme 2)
- [ ] Leichtgrundputz ohne Namen = HP 9L? (Annahme 3)
- [ ] Oberputz Pflicht oder „auf Wunsch“? (Annahme 4)
- [ ] **HP 9U auf modernem Mauerwerk**: Laut 1b) c / 2b) c wird bei modernen Mauerwerken mit HP 9500 Biogrund vorgrundiert. Beim Aufbau „Modernes Mauerwerk“ ist HP 9U aber als Alternative zum Leichtgrundputz **nach der HP-14-Zahnspachtelung** genannt. Ersetzt der Biogrund in diesem Fall die Zahnspachtelung?
- [ ] **Außen geschalter Beton**: Das Merkblatt verlangt einen schalölfreien Putzgrund, der Außenaufbau nennt aber keinen Schalungsölentferner (innen schon). Soll die Schalöl-Frage auch außen gestellt werden? (Demo: nur Hinweis.)
- [ ] **Innen Heraklith** hat keinen Grundputz, außen schon (HP 9L). Bewusst so?
- [ ] **Nasser Keller**: Wann genau ist HP 9VM nötig („je nach Mauerwerk“)? Keine Untergrundfrage vorgesehen.
- [ ] **Kalkfarbe innen**: welches konkrete Produkt?
- [ ] **HP 90 innen**: welche Körnung(en)? (Außen ist 1,0 mm genannt.)
- [ ] **Sperrgrund / Schalungsölentferner / Gewebe / Schilfrohrplatte**: Hessler-Produkt oder Fremdprodukt? Artikelbezeichnung?

### Technische Daten fehlen (Datenblatt folgt)
- [ ] Verbrauch, Sackgröße, Wasser, Schichtdicken und Trocknung für **alle Produkte außer HP 14**: HP 9VM, HP 9, HP 9L, HP 9U, HP 9SL, HP 9PM, HP 90, HP 9500, Sperrgrund, HP 6, HP 1, HP 1L, HP 10, HP 9100PM, Kalkfarbe.
- [ ] **Widerspruch im HP-14-Merkblatt**: 19 l Nassmörtel/Sack reichen rechnerisch nur für ≈ 3,8 m² bei 5 mm, das Merkblatt nennt ca. 5 m²/Sack. Demo rechnet mit der Merkblattangabe (5 m²/Sack ≙ 1,0 kg/(m²·mm)), zentral änderbar in `data/produkte.json`.

### Im Dokument korrigierte Schreibfehler
| Dokument | korrigiert |
|---|---|
| Ripisplatte | Rigipsplatte |
| Herklithplatte | Heraklithplatte |
| Storhballenhaus | Strohballenhaus |
| Leichtrundputz | Leichtgrundputz |
| Schilfpatten | Schilfplatten |
| ca. 1 Wochen | ca. 1 Woche |
| „wir z. B. die Produkte von der Firma Beeck“ | „wie z. B. die Produkte der Firma Beeck“ |
| 2b) o Lehmputz: „…als Schlämme in den **Lehmstein** eingebürstet“ | „…in den **Lehmputz** eingebürstet“ (vermutlich Kopierfehler aus 2b) d) |
