import type { FaqEintrag, Produkt } from './types';

export function normalisiere(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function punkte(text: string, begriffe: string[]): number {
  const t = normalisiere(text);
  let score = 0;
  for (const b of begriffe) {
    if (!t.includes(b)) return 0; // alle Begriffe müssen vorkommen
    score += t.split(b).length - 1;
  }
  return score;
}

export interface Treffer<T> {
  eintrag: T;
  score: number;
}

/** Einfache Stichwortsuche: alle Suchbegriffe müssen vorkommen, Frage/Name zählt doppelt. */
export function sucheFaq(faq: FaqEintrag[], query: string): Treffer<FaqEintrag>[] {
  const begriffe = normalisiere(query).split(' ').filter((b) => b.length > 1);
  if (!begriffe.length) return faq.map((eintrag) => ({ eintrag, score: 0 }));
  return faq
    .map((eintrag) => ({
      eintrag,
      score: punkte(`${eintrag.frage} ${eintrag.frage} ${eintrag.antwort} ${eintrag.tags.join(' ')}`, begriffe),
    }))
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function sucheProdukte(produkte: Produkt[], query: string): Treffer<Produkt>[] {
  const begriffe = normalisiere(query).split(' ').filter((b) => b.length > 1);
  if (!begriffe.length) return [];
  return produkte
    .map((eintrag) => ({
      eintrag,
      score: punkte(
        [eintrag.name, eintrag.name, eintrag.kategorie, eintrag.beschreibung, eintrag.anwendung, eintrag.untergrund, ...eintrag.hinweise]
          .filter(Boolean)
          .join(' '),
        begriffe,
      ),
    }))
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score);
}
