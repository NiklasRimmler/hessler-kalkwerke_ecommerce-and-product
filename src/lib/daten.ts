import produkteJson from '../../data/produkte.json';
import aufbautenJson from '../../data/aufbauten.json';
import baumJson from '../../data/entscheidungsbaum.json';
import faqJson from '../../data/faq.json';
import type { Aufbau, Entscheidungsbaum, FaqEintrag, Produkt } from './types';

// Die Inhalte liegen als JSON in data/ und werden hier nur typisiert.
export const produkte = produkteJson.produkte as unknown as Produkt[];
export const aufbauten = aufbautenJson.aufbauten as unknown as Aufbau[];
export const baum = baumJson as unknown as Entscheidungsbaum;
export const faq = faqJson.faq as unknown as FaqEintrag[];

const produktIndex = new Map(produkte.map((p) => [p.id, p]));
const aufbauIndex = new Map(aufbauten.map((a) => [a.id, a]));

export function produkt(id: string): Produkt {
  const p = produktIndex.get(id);
  if (!p) throw new Error(`Unbekanntes Produkt: ${id}`);
  return p;
}

export function findeProdukt(id: string): Produkt | undefined {
  return produktIndex.get(id);
}

export function findeAufbau(id: string): Aufbau | undefined {
  return aufbauIndex.get(id);
}

export const BEREICH_LABEL: Record<Aufbau['bereich'], string> = {
  innen: 'Innenbereich',
  aussen: 'Außenbereich',
  sockel: 'Sockelbereich',
  keller: 'Nasser Natursteinkeller',
};

export const DISCLAIMER =
  'Diese Angaben beruhen auf den Erfahrungen der Hessler Kalkwerke und berücksichtigen nicht den jeweiligen Einzelfall. Darum können aus ihnen keine Schadensersatzansprüche hergeleitet werden. Alle Angaben ohne Gewähr. Irrtümer, Schreibfehler und Änderungen vorbehalten.';
