import { describe, expect, it } from 'vitest';
import { aufbauten, baum, faq, findeProdukt, produkt, produkte } from '../src/lib/daten';
import { allePfade, loeseAufbau, loesePfad, produktIdsIn } from '../src/lib/finder';
import { pruefeRegeln } from '../src/lib/regeln';

const aufbau = (id: string) => {
  const a = aufbauten.find((x) => x.id === id);
  if (!a) throw new Error(id);
  return a;
};

describe('Entscheidungsbaum', () => {
  const pfade = allePfade(baum);

  it('jeder Pfad endet in genau einem Aufbau oder in der Beratung (kein toter Pfad)', () => {
    expect(pfade.length).toBeGreaterThan(0);
    for (const p of pfade) {
      expect(['aufbau', 'beratung'], `toter Pfad: ${p.labels.join(' → ')}`).toContain(p.ziel.typ);
      if (p.ziel.typ === 'aufbau') expect(aufbauten.map((a) => a.id)).toContain(p.ziel.id);
    }
  });

  it('jeder Pfad lässt sich per URL-Pfad eindeutig wieder auflösen', () => {
    for (const p of pfade) {
      const r = loesePfad(baum, p.pfad);
      expect(r.ungueltig).toBe(false);
      expect(r.knoten).toBeNull();
      expect(r.ziel).toEqual(p.ziel);
    }
  });

  it('jeder Aufbau ist über mindestens einen Pfad erreichbar', () => {
    const erreichbar = new Set(pfade.flatMap((p) => (p.ziel.typ === 'aufbau' ? [p.ziel.id] : [])));
    for (const a of aufbauten) expect(erreichbar.has(a.id), a.id).toBe(true);
  });

  it('Option-IDs sind je Knoten eindeutig und alle Knoten erreichbar', () => {
    const erreichteKnoten = new Set([baum.start]);
    for (const k of baum.knoten) {
      const ids = k.optionen.map((o) => o.id);
      expect(new Set(ids).size, k.id).toBe(ids.length);
      for (const o of k.optionen) if (o.ziel.typ === 'knoten') erreichteKnoten.add(o.ziel.id);
    }
    for (const k of baum.knoten) expect(erreichteKnoten.has(k.id), k.id).toBe(true);
  });

  it('„Sonstiges“ und „Ich bin mir nicht sicher“ führen in die Beratung', () => {
    const r = loesePfad(baum, ['innen', 'mauerwerk', 'unsicher']);
    expect(r.ziel).toEqual({ typ: 'beratung', grund: 'unsicher' });
    expect(loesePfad(baum, ['aussen', 'beton', 'sonstiges']).ziel).toEqual({ typ: 'beratung', grund: 'sonstiges' });
  });

  it('Lücken im Quelldokument führen in die Beratung', () => {
    const luecken = [
      ['innen', 'mauerwerk', 'bims-beton'],
      ['aussen', 'mauerwerk', 'bims-beton'],
      ['innen', 'platten', 'lehmbauplatte'],
      ['innen', 'platten', 'blaehglas'],
      ['innen', 'platten', 'stroh-schilf'],
      ['sockel', 'mauerwerk', 'bims-beton'],
      ['sockel', 'mauerwerk', 'hanf-kalk'],
    ];
    for (const l of luecken) expect(loesePfad(baum, l).ziel?.typ, l.join('/')).toBe('beratung');
  });

  it('ungültige Pfade werden erkannt', () => {
    expect(loesePfad(baum, ['innen', 'gibtsnicht']).ungueltig).toBe(true);
    expect(loesePfad(baum, ['keller', 'zuviel']).ungueltig).toBe(true);
  });

  it('Zusatzfragen der Aufbauten sind im Baum definiert', () => {
    const ids = new Set(baum.zusatzfragen.map((z) => z.id));
    for (const a of aufbauten) for (const z of a.zusatzfragen) expect(ids.has(z), `${a.id}: ${z}`).toBe(true);
  });
});

describe('Datenkonsistenz', () => {
  it('alle produkt_ids in aufbauten.json existieren in produkte.json', () => {
    const fehlend = aufbauten.flatMap((a) => produktIdsIn(a).filter((id) => !findeProdukt(id)).map((id) => `${a.id}: ${id}`));
    expect(fehlend).toEqual([]);
  });

  it('Produkt-IDs sind eindeutig und FAQ-Verweise gültig', () => {
    expect(new Set(produkte.map((p) => p.id)).size).toBe(produkte.length);
    for (const f of faq) for (const id of f.produkte) expect(findeProdukt(id), `${f.id}: ${id}`).toBeDefined();
  });

  it('nur HP 14 hat Verbrauchswerte – keine erfundenen Werte für andere Produkte', () => {
    for (const p of produkte) {
      if (p.id === 'hp-14') continue;
      expect(p.verbrauch_kg_m2_mm, p.id).toBeNull();
      expect(p.sackgroesse_kg, p.id).toBeNull();
      expect(p.datenblatt_vorhanden, p.id).toBe(false);
    }
  });

  it('HP 14 entspricht dem Merkblatt', () => {
    const hp14 = produkt('hp-14');
    expect(hp14).toMatchObject({
      sackgroesse_kg: 25,
      wasser_l_pro_sack: 6,
      nassmoertel_l_pro_sack: 19,
      verbrauch_kg_m2_mm: 1,
      min_schichtdicke_mm: 3,
      max_schichtdicke_mm: 5,
      trocknung_tage_pro_mm: 1,
      sack_pro_palette: 42,
      palettengewicht_kg: 1050,
    });
    // 5 m²/Sack bei 5 mm ⇔ 25 kg / (5 m² · 5 mm) = 1,0 kg/(m²·mm)
    expect(25 / (hp14.ergiebigkeit!.m2_pro_sack * hp14.ergiebigkeit!.bei_schichtdicke_mm)).toBe(hp14.verbrauch_kg_m2_mm);
  });
});

describe('Ausschlussregeln', () => {
  it('kein Aufbau verletzt eine Regel aus regeln.md', () => {
    expect(aufbauten.flatMap((a) => pruefeRegeln(a, produkt))).toEqual([]);
  });

  it('Außen + Styropor enthält kein HP 9 und keinen Naturkalk-Grundputz', () => {
    const r = loesePfad(baum, ['aussen', 'platten', 'daemmplatten']);
    expect(r.ziel).toEqual({ typ: 'aufbau', id: 'aussen-daemmplatten' });
    const a = aufbau('aussen-daemmplatten');
    const ids = produktIdsIn(a);
    expect(ids).not.toContain('hp-9');
    expect(ids).not.toContain('hp-9l');
    expect(ids).not.toContain('hp-14');
    expect(ids).toEqual(expect.arrayContaining(['hp-6', 'hp-1l', 'silikatfarbe']));
  });

  it('Außen WU-Beton und bestehender Kalk-Zement-Putz: nur zementhaltig', () => {
    for (const id of ['aussen-wu-beton', 'aussen-kalk-zement-putz']) {
      for (const pid of produktIdsIn(aufbau(id))) expect(['naturkalk', 'kalk'], `${id}: ${pid}`).not.toContain(produkt(pid).bindemittel);
    }
  });

  it('Sockel ist immer zementär', () => {
    for (const a of aufbauten.filter((x) => x.bereich === 'sockel')) {
      for (const pid of produktIdsIn(a)) expect(produkt(pid).bindemittel, `${a.id}: ${pid}`).not.toBe('naturkalk');
    }
  });

  it('Außen und Sockel enden immer mit Silikatanstrich (Pflicht)', () => {
    for (const a of aufbauten.filter((x) => x.bereich === 'aussen' || x.bereich === 'sockel')) {
      const letzte = a.schichten[a.schichten.length - 1];
      expect(letzte.produkt_id, a.id).toBe('silikatfarbe');
      expect(letzte.optional, a.id).toBe(false);
    }
  });

  it('HP 9PM kommt nur im nassen Keller vor', () => {
    for (const a of aufbauten) if (a.id !== 'keller-nass') expect(produktIdsIn(a), a.id).not.toContain('hp-9pm');
  });

  it('Gipshaltige Untergründe (Rigips, Gipsputz) werden grundiert', () => {
    for (const pfad of [['innen', 'platten', 'rigips'], ['innen', 'altbestand', 'gipsputz']]) {
      const z = loesePfad(baum, pfad).ziel;
      expect(z?.typ).toBe('aufbau');
      const a = aufbau((z as { id: string }).id);
      const aktiv = loeseAufbau(a, {}).filter((s) => s.status === 'aktiv');
      expect(aktiv[0].produktId).toBe('hp-9500');
    }
  });
});

describe('Zusatzfragen', () => {
  it('Durchschlag → Sperrgrund statt HP 9500 Biogrund', () => {
    const a = aufbau('innen-plattensysteme');
    expect(loeseAufbau(a, {})[0].produktId).toBe('hp-9500');
    const mit = loeseAufbau(a, { durchschlag: true })[0];
    expect(mit.produktId).toBe('sperrgrund');
    expect(mit.ersatzBegruendung).toMatch(/Kleister/);
  });

  it('Schalöl → Schalungsölentferner wird aktiv (geschalter Beton innen)', () => {
    const a = aufbau('innen-geschalter-beton');
    expect(loeseAufbau(a, {})[0].status).toBe('bei-bedarf');
    expect(loeseAufbau(a, { schaloel: true })[0]).toMatchObject({ status: 'aktiv', produktId: 'schalungsoelentferner' });
  });

  it('Rissrisiko aktiviert die „bei Bedarf“-Gewebespachtelung', () => {
    const a = aufbau('innen-naturstein-vollziegel');
    const gewebe = (antw: Record<string, boolean>) => loeseAufbau(a, antw).find((s) => s.schicht.technik === 'Gewebespachtelung')!;
    expect(gewebe({}).status).toBe('bei-bedarf');
    expect(gewebe({ rissrisiko: true }).status).toBe('aktiv');
  });

  it('Holzständerbauweise → Schilfrohr-Putzträgerplatte', () => {
    const a = aufbau('aussen-strohballen');
    const platte = (antw: Record<string, boolean>) => loeseAufbau(a, antw).find((s) => s.produktId === 'schilfrohr-putztraegerplatte')!;
    expect(platte({}).status).toBe('bei-bedarf');
    expect(platte({ holzstaender: true }).status).toBe('aktiv');
  });

  it('Farbanstrich innen optional, außen immer', () => {
    const innen = loeseAufbau(aufbau('innen-holzweichfaser'), {});
    expect(innen.find((s) => s.produktId === 'kalkfarbe')!.status).toBe('bei-bedarf');
    expect(loeseAufbau(aufbau('innen-holzweichfaser'), { farbanstrich: true }).find((s) => s.produktId === 'kalkfarbe')!.status).toBe('aktiv');
    expect(aufbau('aussen-holzweichfaser').zusatzfragen).not.toContain('farbanstrich');
    expect(loeseAufbau(aufbau('aussen-holzweichfaser'), {}).find((s) => s.produktId === 'silikatfarbe')!.status).toBe('aktiv');
  });
});
