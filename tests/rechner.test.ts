import { describe, expect, it } from 'vitest';
import { produkt } from '../src/lib/daten';
import { berechnePosition, materialliste, nettoFlaeche, paletten, saeckeFuer } from '../src/lib/rechner';

const hp14 = produkt('hp-14');

describe('Mengenrechner HP 14', () => {
  it('20 m², 5 mm, 10 % Verschnitt → 110 kg → 5 Säcke à 25 kg', () => {
    const r = berechnePosition({ key: 'a', produkt: hp14, schichtdickeMm: 5 }, 20, 10);
    expect(r.status).toBe('berechnet');
    if (r.status !== 'berechnet') return;
    expect(r.kg).toBe(110);
    expect(r.saecke).toBe(5);
    expect(r.wasserLiter).toBe(30); // 5 Sack × 6 l
    expect(r.trocknungTage).toBe(5); // 1 Tag / mm
    expect(r.lagen).toBe(1);
    expect(r.warnungen).toEqual([]);
  });

  it('Merkblatt-Ergiebigkeit: 5 m² bei 5 mm ohne Verschnitt = genau 1 Sack', () => {
    const r = berechnePosition({ key: 'a', produkt: hp14, schichtdickeMm: 5 }, 5, 0);
    expect(r.status === 'berechnet' && r.saecke).toBe(1);
  });

  it('> 5 mm → mehrere Lagen', () => {
    const r = berechnePosition({ key: 'a', produkt: hp14, schichtdickeMm: 8 }, 10, 10);
    expect(r.status === 'berechnet' && r.lagen).toBe(2);
    expect(r.warnungen.join()).toMatch(/2 Lagen/);
  });

  it('< 3 mm → Warnung', () => {
    const r = berechnePosition({ key: 'a', produkt: hp14, schichtdickeMm: 2 }, 10, 10);
    expect(r.warnungen.join()).toMatch(/Mindestauftragsstärke von 3 mm/);
  });

  it('ab 42 Sack werden Paletten ausgewiesen', () => {
    expect(paletten(41, 42)).toBeNull();
    expect(paletten(42, 42)).toEqual({ voll: 1, restSaecke: 0 });
    expect(paletten(100, 42)).toEqual({ voll: 2, restSaecke: 16 });
  });

  it('Gleitkomma-Artefakte führen nicht zu einem zusätzlichen Sack', () => {
    expect(saeckeFuer(100.0000000001, 25)).toBe(4);
    expect(saeckeFuer(100.01, 25)).toBe(5);
  });

  it('Materialliste summiert kg je Produkt und rundet erst dann auf Säcke', () => {
    // Zahnspachtelung 3 mm + Gewebespachtelung 5 mm auf 10 m², 10 % → 33 + 55 = 88 kg → 4 Säcke (nicht 2 + 3)
    const positionen = [
      berechnePosition({ key: 'zahn', produkt: hp14, schichtdickeMm: 3 }, 10, 10),
      berechnePosition({ key: 'gewebe', produkt: hp14, schichtdickeMm: 5 }, 10, 10),
    ];
    const [zeile] = materialliste(positionen);
    expect(zeile.kg).toBe(88);
    expect(zeile.saecke).toBe(4);
    expect(zeile.wasserLiter).toBe(24);
  });
});

describe('Mengenrechner – Produkte ohne Datenblatt', () => {
  it('liefert „Verbrauchswert folgt“ statt eines Fantasiewerts', () => {
    const r = berechnePosition({ key: 'a', produkt: produkt('hp-9'), schichtdickeMm: 15 }, 20, 10);
    expect(r.status).toBe('verbrauch-folgt');
    expect(materialliste([r])[0]).toMatchObject({ kg: null, saecke: null, verbrauchFolgt: true });
  });
});

describe('Fläche', () => {
  it('Wand: Länge × Höhe abzüglich Fenster/Türen', () => {
    expect(nettoFlaeche({ modus: 'wand', flaecheM2: 0, laengeM: 5, hoeheM: 2.5, abzugM2: 2.5 })).toBe(10);
    expect(nettoFlaeche({ modus: 'wand', flaecheM2: 0, laengeM: 1, hoeheM: 1, abzugM2: 5 })).toBe(0);
    expect(nettoFlaeche({ modus: 'flaeche', flaecheM2: 20, laengeM: 0, hoeheM: 0, abzugM2: 0 })).toBe(20);
  });
});
