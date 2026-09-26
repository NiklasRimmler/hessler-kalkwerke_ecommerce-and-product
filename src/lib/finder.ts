import type { Antworten, Aufbau, Entscheidungsbaum, Knoten, Option, Produkt, Schicht, Ziel } from './types';

export interface PfadSchritt {
  knoten: Knoten;
  option: Option;
}

export interface PfadErgebnis {
  /** bereits beantwortete Fragen */
  schritte: PfadSchritt[];
  /** nächste offene Frage – null, wenn der Pfad an einem Ziel endet */
  knoten: Knoten | null;
  /** erreichtes Ziel (Aufbau oder Beratung) */
  ziel: Extract<Ziel, { typ: 'aufbau' | 'beratung' }> | null;
  /** true, wenn der Pfad ungültige Option-IDs enthielt (wurde abgeschnitten) */
  ungueltig: boolean;
}

/** Läuft den Entscheidungsbaum entlang der gewählten Option-IDs. */
export function loesePfad(baum: Entscheidungsbaum, pfad: string[]): PfadErgebnis {
  const knotenIndex = new Map(baum.knoten.map((k) => [k.id, k]));
  let knoten = knotenIndex.get(baum.start) ?? null;
  const schritte: PfadSchritt[] = [];
  for (const optionId of pfad) {
    if (!knoten) return { schritte, knoten: null, ziel: null, ungueltig: true };
    const option = knoten.optionen.find((o) => o.id === optionId);
    if (!option) return { schritte, knoten, ziel: null, ungueltig: true };
    schritte.push({ knoten, option });
    if (option.ziel.typ === 'knoten') {
      knoten = knotenIndex.get(option.ziel.id) ?? null;
      if (!knoten) return { schritte, knoten: null, ziel: null, ungueltig: true };
    } else {
      const rest = pfad.length > schritte.length;
      return { schritte, knoten: null, ziel: option.ziel, ungueltig: rest };
    }
  }
  return { schritte, knoten, ziel: null, ungueltig: false };
}

/** Alle vollständigen Pfade des Baums (für Tests und „Wo kommt das vor?“). */
export function allePfade(baum: Entscheidungsbaum): { pfad: string[]; labels: string[]; ziel: Ziel }[] {
  const knotenIndex = new Map(baum.knoten.map((k) => [k.id, k]));
  const out: { pfad: string[]; labels: string[]; ziel: Ziel }[] = [];
  const besucht = new Set<string>();
  function lauf(id: string, pfad: string[], labels: string[]) {
    if (besucht.has(id)) throw new Error(`Zyklus im Entscheidungsbaum bei ${id}`);
    besucht.add(id);
    const k = knotenIndex.get(id);
    if (!k) {
      out.push({ pfad, labels, ziel: { typ: 'knoten', id } });
      return;
    }
    for (const o of k.optionen) {
      if (o.ziel.typ === 'knoten') lauf(o.ziel.id, [...pfad, o.id], [...labels, o.label]);
      else out.push({ pfad: [...pfad, o.id], labels: [...labels, o.label], ziel: o.ziel });
    }
    besucht.delete(id);
  }
  lauf(baum.start, [], []);
  return out;
}

export function ersterPfadZuAufbau(baum: Entscheidungsbaum, aufbauId: string): string[] | null {
  const treffer = allePfade(baum).find((p) => p.ziel.typ === 'aufbau' && p.ziel.id === aufbauId);
  return treffer ? treffer.pfad : null;
}

export type SchichtStatus = 'aktiv' | 'bei-bedarf';

export interface AufgeloesteSchicht {
  schicht: Schicht;
  /** Nummer in der Verarbeitungsreihenfolge (1 = erste Lage auf dem Untergrund) */
  nr: number;
  status: SchichtStatus;
  /** Produkt nach Anwendung von Ersatzregeln (z. B. Sperrgrund statt Biogrund) */
  produktId: string;
  ersatzBegruendung: string | null;
}

function erfuellt(antworten: Antworten, frage: string, wert: boolean, standard = false): boolean {
  return (antworten[frage] ?? standard) === wert;
}

/**
 * Wendet die Antworten der Zusatzfragen auf einen Aufbau an.
 * - Pflichtschichten sind immer aktiv.
 * - Schichten mit Bedingung sind aktiv, wenn die Bedingung erfüllt ist, sonst „bei Bedarf“.
 * - Optionale Schichten ohne Bedingung bleiben „bei Bedarf“ (Entscheidung vor Ort / Rücksprache).
 */
export function loeseAufbau(aufbau: Aufbau, antworten: Antworten): AufgeloesteSchicht[] {
  return aufbau.schichten.map((schicht, i) => {
    let status: SchichtStatus;
    if (schicht.bedingung) status = erfuellt(antworten, schicht.bedingung.frage, schicht.bedingung.wert) ? 'aktiv' : 'bei-bedarf';
    else status = schicht.optional ? 'bei-bedarf' : 'aktiv';
    const ersatz = schicht.ersatz.find((e) => erfuellt(antworten, e.bedingung.frage, e.bedingung.wert));
    return {
      schicht,
      nr: i + 1,
      status,
      produktId: ersatz ? ersatz.produkt_id : schicht.produkt_id,
      ersatzBegruendung: ersatz ? ersatz.begruendung : null,
    };
  });
}

const KONTAKT_PRAEFIX = 'Für eine genaue Aufbauempfehlung';

/** Hinweise zum Ergebnis: Aufbau-Hinweise + Merkblatt-Hinweise für enthaltene Produkte. */
export function hinweiseFuer(aufbau: Aufbau, schichten: AufgeloesteSchicht[], produktFn: (id: string) => Produkt): string[] {
  const hinweise = aufbau.hinweise.filter((h) => !h.startsWith(KONTAKT_PRAEFIX));
  const ids = new Set(schichten.filter((s) => s.status === 'aktiv').map((s) => s.produktId));
  if (ids.has('hp-14')) {
    const hp14 = produktFn('hp-14');
    for (const h of hp14.hinweise) {
      if (/5 °C|frostfrei|Beimischung/.test(h)) hinweise.push(`HP 14: ${h}`);
    }
  }
  return [...new Set(hinweise)];
}

/** Alle Produkt-IDs, die ein Aufbau referenziert (inkl. Alternativen, Ersatz, Zubehör). */
export function produktIdsIn(aufbau: Aufbau): string[] {
  return [
    ...new Set(
      aufbau.schichten.flatMap((s) => [s.produkt_id, ...s.alternativen, ...s.zubehoer, ...s.ersatz.map((e) => e.produkt_id)]),
    ),
  ];
}
