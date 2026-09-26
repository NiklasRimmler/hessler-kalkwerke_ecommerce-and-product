import type { Aufbau, Produkt } from './types';

/**
 * Fachliche Ausschlussregeln aus den Quellen (siehe regeln.md, Abschnitt 4).
 * Liefert für einen Aufbau alle Regelverstöße als lesbare Texte (leer = ok).
 */
export function pruefeRegeln(aufbau: Aufbau, produkt: (id: string) => Produkt): string[] {
  const fehler: string[] = [];
  const hauptprodukte = aufbau.schichten.flatMap((s) => [s.produkt_id, ...s.alternativen, ...s.ersatz.map((e) => e.produkt_id)]);
  const bindemittel = (id: string) => produkt(id).bindemittel;
  const pflicht = aufbau.schichten.filter((s) => !s.optional && !s.bedingung);

  const nurZement = ['aussen-daemmplatten', 'aussen-wu-beton', 'aussen-kalk-zement-putz'].includes(aufbau.id) || aufbau.bereich === 'sockel';

  // R1 / R2: nicht saugfähig außen, KZ-Bestand außen, Sockel → nur zementhaltig
  if (nurZement) {
    for (const id of hauptprodukte) {
      const b = bindemittel(id);
      if (b === 'naturkalk' || b === 'kalk') fehler.push(`R1/R2: ${aufbau.id} enthält Naturkalk-Produkt ${id}`);
    }
  }
  // R3: außen & Sockel → Silikatanstrich Pflicht
  if (aufbau.bereich === 'aussen' || aufbau.bereich === 'sockel') {
    if (!pflicht.some((s) => s.produkt_id === 'silikatfarbe')) fehler.push(`R3: ${aufbau.id} ohne Silikatanstrich`);
    if (pflicht[pflicht.length - 1]?.produkt_id !== 'silikatfarbe') fehler.push(`R3: ${aufbau.id} – Silikatanstrich ist nicht die oberste Schicht`);
  }
  // R4: gipshaltige Untergründe → Grundierung HP 9500 / Sperrgrund Pflicht
  if (aufbau.untergruende.some((u) => /rigips|gips/i.test(u))) {
    const g = pflicht.find((s) => s.produkt_id === 'hp-9500');
    if (!g || !g.ersatz.some((e) => e.produkt_id === 'sperrgrund')) fehler.push(`R4: ${aufbau.id} ohne Grundierung HP 9500 / Sperrgrund`);
  }
  // R5: HP 9PM nur im nassen Keller
  if (aufbau.id !== 'keller-nass' && hauptprodukte.includes('hp-9pm')) fehler.push(`R5: HP 9PM außerhalb des nassen Kellers (${aufbau.id})`);
  // R6: Heraklith → Hinweis 1 Woche Trocknung
  if (aufbau.untergruende.some((u) => /heraklith/i.test(u)) && !aufbau.hinweise.some((h) => /1 Woche/.test(h)))
    fehler.push(`R6: ${aufbau.id} ohne Heraklith-Trocknungshinweis`);
  // Außen darf kein Innen-Anstrich (Kalkfarbe) vorkommen
  if (aufbau.bereich !== 'innen' && hauptprodukte.includes('kalkfarbe')) fehler.push(`${aufbau.id}: Kalkfarbe (innen) im Außen-/Sockelaufbau`);

  return fehler;
}
