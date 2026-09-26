import type { Produkt } from './types';

export const RECHNER_STANDARD = {
  verschnittProzent: 10,
};

export interface FlaechenEingabe {
  modus: 'flaeche' | 'wand';
  flaecheM2: number;
  laengeM: number;
  hoeheM: number;
  abzugM2: number;
}

export function nettoFlaeche(e: FlaechenEingabe): number {
  const f = e.modus === 'flaeche' ? e.flaecheM2 : e.laengeM * e.hoeheM - e.abzugM2;
  return Number.isFinite(f) && f > 0 ? runde(f, 2) : 0;
}

export interface PositionEingabe {
  key: string;
  produkt: Produkt;
  schichtdickeMm: number | null;
}

export type PositionErgebnis =
  | {
      key: string;
      produkt: Produkt;
      status: 'berechnet';
      schichtdickeMm: number;
      kg: number;
      saecke: number;
      wasserLiter: number | null;
      lagen: number;
      trocknungTage: number | null;
      warnungen: string[];
    }
  | {
      key: string;
      produkt: Produkt;
      status: 'verbrauch-folgt' | 'dicke-fehlt';
      schichtdickeMm: number | null;
      warnungen: string[];
    };

export interface MaterialZeile {
  produkt: Produkt;
  kg: number | null;
  saecke: number | null;
  paletten: { voll: number; restSaecke: number } | null;
  wasserLiter: number | null;
  verbrauchFolgt: boolean;
}

export function runde(x: number, stellen = 2): number {
  const f = 10 ** stellen;
  return Math.round(x * f) / f;
}

/** Aufrunden mit Toleranz gegen Gleitkomma-Artefakte (4,4000000001 → 5, aber 4,0000000001 → 4). */
export function aufrunden(x: number): number {
  return Math.ceil(runde(x, 6));
}

export function saeckeFuer(kg: number, sackKg: number): number {
  return kg > 0 ? aufrunden(kg / sackKg) : 0;
}

export function paletten(saecke: number, proPalette: number | null): { voll: number; restSaecke: number } | null {
  if (!proPalette || saecke < proPalette) return null;
  return { voll: Math.floor(saecke / proPalette), restSaecke: saecke % proPalette };
}

/** Materialbedarf einer Schicht: Fläche × Dicke × Verbrauch × (1 + Verschnitt). */
export function berechnePosition(p: PositionEingabe, flaecheM2: number, verschnittProzent: number): PositionErgebnis {
  const { produkt, schichtdickeMm } = p;
  const warnungen: string[] = [];
  if (produkt.verbrauch_kg_m2_mm == null || produkt.sackgroesse_kg == null)
    return { key: p.key, produkt, status: 'verbrauch-folgt', schichtdickeMm, warnungen };
  if (schichtdickeMm == null || !(schichtdickeMm > 0)) return { key: p.key, produkt, status: 'dicke-fehlt', schichtdickeMm, warnungen };

  const min = produkt.min_schichtdicke_mm;
  const max = produkt.max_schichtdicke_mm;
  if (min != null && schichtdickeMm < min) warnungen.push(`Unter der Mindestauftragsstärke von ${min} mm.`);
  const lagen = max != null ? Math.max(1, aufrunden(schichtdickeMm / max)) : 1;
  if (lagen > 1) warnungen.push(`Max. ${max} mm pro Lage – in ${lagen} Lagen auftragen.`);

  const kg = runde(flaecheM2 * schichtdickeMm * produkt.verbrauch_kg_m2_mm * (1 + verschnittProzent / 100), 2);
  const saecke = saeckeFuer(kg, produkt.sackgroesse_kg);
  return {
    key: p.key,
    produkt,
    status: 'berechnet',
    schichtdickeMm,
    kg,
    saecke,
    wasserLiter: produkt.wasser_l_pro_sack != null ? runde(saecke * produkt.wasser_l_pro_sack, 1) : null,
    lagen,
    trocknungTage: produkt.trocknung_tage_pro_mm != null ? runde(schichtdickeMm * produkt.trocknung_tage_pro_mm, 1) : null,
    warnungen,
  };
}

/** Fasst Positionen je Produkt zur Materialliste zusammen (Säcke aus Gesamt-kg, nicht je Schicht aufgerundet). */
export function materialliste(positionen: PositionErgebnis[]): MaterialZeile[] {
  const map = new Map<string, MaterialZeile>();
  for (const pos of positionen) {
    const vorhanden = map.get(pos.produkt.id);
    const zeile: MaterialZeile = vorhanden ?? { produkt: pos.produkt, kg: null, saecke: null, paletten: null, wasserLiter: null, verbrauchFolgt: false };
    if (pos.status === 'berechnet') zeile.kg = runde((zeile.kg ?? 0) + pos.kg, 2);
    else zeile.verbrauchFolgt = true;
    map.set(pos.produkt.id, zeile);
  }
  for (const z of map.values()) {
    const sack = z.produkt.sackgroesse_kg;
    if (z.kg != null && sack) {
      z.saecke = saeckeFuer(z.kg, sack);
      z.paletten = paletten(z.saecke, z.produkt.sack_pro_palette);
      z.wasserLiter = z.produkt.wasser_l_pro_sack != null ? runde(z.saecke * z.produkt.wasser_l_pro_sack, 1) : null;
    }
  }
  return [...map.values()];
}

/** Vorschlag für die Schichtdicke: Wert aus dem Aufbau, sonst Mindeststärke des Produkts. */
export function vorschlagDicke(schichtdickeAusAufbau: number | null, produkt: Produkt): number | null {
  return schichtdickeAusAufbau ?? produkt.min_schichtdicke_mm ?? null;
}

export const fmt = (x: number, stellen = 1) => x.toLocaleString('de-DE', { maximumFractionDigits: stellen });
