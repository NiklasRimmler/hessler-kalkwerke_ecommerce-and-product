import { useMemo, useState } from 'react';
import { BindemittelBadge, HinweisBox } from '../components/Bausteine';
import { IconDrucken, IconWarnung } from '../components/Icons';
import { BEREICH_LABEL, aufbauten, findeAufbau, produkt } from '../lib/daten';
import { ersterPfadZuAufbau, loeseAufbau } from '../lib/finder';
import {
  RECHNER_STANDARD,
  berechnePosition,
  fmt,
  materialliste,
  nettoFlaeche,
  vorschlagDicke,
  type FlaechenEingabe,
  type PositionEingabe,
  type PositionErgebnis,
} from '../lib/rechner';
import { antwortenAusParams, antwortenParams, href, navigiere, type Route } from '../lib/route';
import { baum } from '../lib/daten';
import type { Antworten, Aufbau, Produkt } from '../lib/types';
import { finderHref } from './Finder';

const EINZEL_HP14 = 'hp-14';
const MOERTEL = new Set(['Haftputz/Spachtel', 'Grundputz', 'Oberputz']);
const istMoertel = (p: Produkt) => MOERTEL.has(p.kategorie) || p.id === 'hp-9vm' || p.id === 'hp-10';

interface Zeile {
  key: string;
  nr: number;
  titel: string;
  produkt: Produkt;
  standardAktiv: boolean;
  optionalLabel: string | null;
  dickeVorschlag: number | null;
  mitDicke: boolean;
  hinweis: string | null;
  /** abweichende Trocknung laut Aufbauempfehlung (Heraklith: ca. 1 Woche) */
  trocknungWoche?: boolean;
  zubehoerVon?: string;
}

function zeilenFuer(aufbau: Aufbau | null, antworten: Antworten): Zeile[] {
  if (!aufbau) {
    const hp14 = produkt('hp-14');
    return [{ key: 'hp14', nr: 1, titel: 'Einzelprodukt', produkt: hp14, standardAktiv: true, optionalLabel: null, dickeVorschlag: 5, mitDicke: true, hinweis: null }];
  }
  return loeseAufbau(aufbau, antworten).flatMap((s) => {
    const p = produkt(s.produktId);
    const haupt: Zeile = {
      key: `s${s.nr}`,
      nr: s.nr,
      titel: s.schicht.funktion,
      produkt: p,
      standardAktiv: s.status === 'aktiv',
      optionalLabel: s.status === 'aktiv' ? null : (s.schicht.optional_label ?? 'bei Bedarf'),
      dickeVorschlag: istMoertel(p) ? vorschlagDicke(s.schicht.schichtdicke_mm, p) : null,
      mitDicke: istMoertel(p) && p.verbrauch_kg_m2_mm != null,
      hinweis: s.schicht.hinweis,
      trocknungWoche: /1 Woche/.test(s.schicht.hinweis ?? ''),
    };
    const zubehoer: Zeile[] = s.schicht.zubehoer.map((id) => ({
      key: `s${s.nr}-${id}`,
      nr: s.nr,
      titel: 'Zubehör',
      produkt: produkt(id),
      standardAktiv: s.status === 'aktiv',
      optionalLabel: haupt.optionalLabel,
      dickeVorschlag: null,
      mitDicke: false,
      hinweis: null,
      zubehoerVon: haupt.key,
    }));
    return [haupt, ...zubehoer];
  });
}

export function Rechner({ route }: { route: Route }) {
  const aufbauId = route.params.get('a') ?? '';
  const aufbau = findeAufbau(aufbauId) ?? null;
  const antworten = useMemo(() => antwortenAusParams(route.params), [route]);

  const waehle = (id: string) => navigiere(href('rechner', { a: id || undefined, ...(id && id === aufbauId ? antwortenParams(antworten) : {}) }));

  return (
    <div className="space-y-6">
      <header className="kein-druck space-y-2">
        <p className="kicker">Mengenrechner</p>
        <h1 className="ueberschrift">Wie viel Material brauchen Sie?</h1>
        <p className="max-w-2xl text-erde-700">
          Fläche eingeben, Schichtdicken prüfen – der Rechner ermittelt Material, Säcke, Wasser und Trocknungszeit. Echte Werte gibt es in dieser Demo für HP 14 (laut Merkblatt);
          für alle anderen Produkte folgt der Verbrauchswert.
        </p>
      </header>

      <div className="kein-druck karte p-4 sm:p-5">
        <label htmlFor="aufbau" className="text-sm font-bold text-erde-900">
          Aufbau
        </label>
        <select id="aufbau" className="eingabe mt-1.5" value={aufbau ? aufbau.id : aufbauId === EINZEL_HP14 ? EINZEL_HP14 : ''} onChange={(e) => waehle(e.target.value)}>
          <option value="">– Bitte wählen –</option>
          <option value={EINZEL_HP14}>Nur HP 14 Naturkalk-Haftputz (Einzelprodukt)</option>
          {(['innen', 'aussen', 'sockel', 'keller'] as const).map((b) => (
            <optgroup key={b} label={BEREICH_LABEL[b]}>
              {aufbauten
                .filter((a) => a.bereich === b)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.titel}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        {!aufbau && aufbauId !== EINZEL_HP14 && (
          <p className="mt-3 text-sm text-erde-500">
            Tipp: Ermitteln Sie den passenden Aufbau zuerst im{' '}
            <a href="#/finder" className="font-semibold text-akzent-600 underline underline-offset-2">
              Produktfinder
            </a>{' '}
            – von dort wird er direkt übernommen.
          </p>
        )}
        {aufbau && (
          <p className="mt-3 text-sm text-erde-500">
            {aufbau.zusatzfragen.length > 0 && (
              <>
                Berücksichtigte Angaben:{' '}
                {baum.zusatzfragen
                  .filter((z) => aufbau.zusatzfragen.includes(z.id) && antworten[z.id])
                  .map((z) => z.frage.replace(/\?$/, ''))
                  .join(' · ') || 'keine Besonderheiten'}
                {' · '}
              </>
            )}
            <a href={finderHref(ersterPfadZuAufbau(baum, aufbau.id) ?? [], antworten, true)} className="font-semibold text-akzent-600 underline underline-offset-2">
              Zur Empfehlung
            </a>
          </p>
        )}
      </div>

      {(aufbau || aufbauId === EINZEL_HP14) && <Berechnung key={`${aufbauId}|${JSON.stringify(antworten)}`} aufbau={aufbau} antworten={antworten} />}
    </div>
  );
}

function Zahl({ id, label, wert, setWert, einheit, schritt = 0.1 }: { id: string; label: string; wert: string; setWert: (v: string) => void; einheit: string; schritt?: number }) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-bold text-erde-900">{label}</span>
      <span className="relative mt-1.5 block">
        <input id={id} type="number" inputMode="decimal" min={0} step={schritt} className="eingabe pr-12" value={wert} onChange={(e) => setWert(e.target.value)} />
        <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-erde-500">{einheit}</span>
      </span>
    </label>
  );
}

const zahl = (s: string) => {
  const n = parseFloat(s.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

function Berechnung({ aufbau, antworten }: { aufbau: Aufbau | null; antworten: Antworten }) {
  const zeilen = useMemo(() => zeilenFuer(aufbau, antworten), [aufbau, antworten]);
  const [modus, setModus] = useState<FlaechenEingabe['modus']>('flaeche');
  const [flaeche, setFlaeche] = useState('20');
  const [laenge, setLaenge] = useState('5');
  const [hoehe, setHoehe] = useState('2,5');
  const [abzug, setAbzug] = useState('2');
  const [verschnitt, setVerschnitt] = useState(String(RECHNER_STANDARD.verschnittProzent));
  const [aktiv, setAktiv] = useState<Record<string, boolean>>(() => Object.fromEntries(zeilen.map((z) => [z.key, z.standardAktiv])));
  const [dicken, setDicken] = useState<Record<string, string>>(() => Object.fromEntries(zeilen.map((z) => [z.key, z.dickeVorschlag != null ? String(z.dickeVorschlag) : ''])));

  const netto = nettoFlaeche({ modus, flaecheM2: zahl(flaeche), laengeM: zahl(laenge), hoeheM: zahl(hoehe), abzugM2: zahl(abzug) });
  const vs = Math.max(0, zahl(verschnitt));

  const istAktiv = (z: Zeile) => (z.zubehoerVon ? aktiv[z.zubehoerVon] : aktiv[z.key]);
  const ergebnisse = new Map<string, PositionErgebnis>();
  for (const z of zeilen) {
    if (!istAktiv(z)) continue;
    const eingabe: PositionEingabe = { key: z.key, produkt: z.produkt, schichtdickeMm: z.mitDicke && dicken[z.key] !== '' ? zahl(dicken[z.key]) : null };
    ergebnisse.set(z.key, berechnePosition(eingabe, netto, vs));
  }
  const liste = materialliste([...ergebnisse.values()]);
  const woche = new Set(zeilen.filter((z) => z.trocknungWoche).map((z) => z.key));
  const gesamtTrocknung = [...ergebnisse.values()].reduce(
    (sum, e) => sum + (e.status === 'berechnet' && e.trocknungTage ? (woche.has(e.key) ? Math.max(7, e.trocknungTage) : e.trocknungTage) : 0),
    0,
  );

  return (
    <>
      <section className="kein-druck karte space-y-4 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Fläche</h2>
          <div className="inline-flex rounded-full bg-sand-100 p-1 text-sm font-semibold" role="radiogroup" aria-label="Eingabeart">
            {(
              [
                ['flaeche', 'm² direkt'],
                ['wand', 'Wandmaße'],
              ] as const
            ).map(([m, l]) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={modus === m}
                onClick={() => setModus(m)}
                className={`rounded-full px-3.5 py-1.5 ${modus === m ? 'bg-white text-erde-900 shadow-sm' : 'text-erde-500'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        {modus === 'flaeche' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Zahl id="flaeche" label="Zu verputzende Fläche" wert={flaeche} setWert={setFlaeche} einheit="m²" schritt={1} />
            <Zahl id="verschnitt" label="Verschnittzuschlag" wert={verschnitt} setWert={setVerschnitt} einheit="%" schritt={1} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Zahl id="laenge" label="Wandlänge" wert={laenge} setWert={setLaenge} einheit="m" />
            <Zahl id="hoehe" label="Wandhöhe" wert={hoehe} setWert={setHoehe} einheit="m" />
            <Zahl id="abzug" label="Fenster/Türen" wert={abzug} setWert={setAbzug} einheit="m²" />
            <Zahl id="verschnitt2" label="Verschnitt" wert={verschnitt} setWert={setVerschnitt} einheit="%" schritt={1} />
          </div>
        )}
        <p className="rounded-xl bg-kalk-100 px-4 py-2.5 text-[15px]">
          Berechnete Fläche: <strong>{fmt(netto, 2)} m²</strong> · Verschnitt {fmt(vs, 1)} %
        </p>
      </section>

      <section className="space-y-3">
        <div className="kein-druck">
          <h2 className="text-xl font-bold">Schichten</h2>
          <p className="text-sm text-erde-500">Reihenfolge von der ersten Lage auf dem Untergrund bis zum Anstrich. „Bei Bedarf“-Schichten können Sie zuschalten.</p>
        </div>
        <ol className="kein-druck space-y-2.5">
          {zeilen
            .filter((z) => !z.zubehoerVon)
            .map((z) => {
              const an = !!aktiv[z.key];
              const e = ergebnisse.get(z.key);
              const zub = zeilen.filter((x) => x.zubehoerVon === z.key);
              return (
                <li key={z.key} className={`karte p-4 ${an ? '' : 'border-dashed bg-kalk-50'}`}>
                  <div className="flex items-start gap-3">
                    <input
                      id={`an-${z.key}`}
                      type="checkbox"
                      className="mt-1 h-5 w-5 shrink-0 accent-akzent-500"
                      checked={an}
                      onChange={(ev) => setAktiv((a) => ({ ...a, [z.key]: ev.target.checked }))}
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                      <label htmlFor={`an-${z.key}`} className="block cursor-pointer">
                        <span className="block text-xs font-bold tracking-wider text-erde-500 uppercase">
                          {z.nr}. {z.titel}
                          {z.optionalLabel && <span className="ml-1.5 normal-case">({z.optionalLabel})</span>}
                        </span>
                        <span className="flex flex-wrap items-center gap-2 text-[16px] font-bold text-erde-900">
                          {z.produkt.name} <BindemittelBadge produkt={z.produkt} />
                        </span>
                        {zub.length > 0 && <span className="block text-sm text-erde-500">mit {zub.map((x) => x.produkt.name).join(', ')}</span>}
                      </label>
                      {an && (
                        <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
                          {z.mitDicke && (
                            <label className="block w-36">
                              <span className="text-sm font-semibold text-erde-700">Schichtdicke</span>
                              <span className="relative mt-1 block">
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  min={0}
                                  step={0.5}
                                  className="eingabe pr-11"
                                  value={dicken[z.key]}
                                  placeholder="–"
                                  onChange={(ev) => setDicken((d) => ({ ...d, [z.key]: ev.target.value }))}
                                />
                                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-erde-500">mm</span>
                              </span>
                            </label>
                          )}
                          {e && <PositionAnzeige e={e} woche={z.trocknungWoche} />}
                        </div>
                      )}
                      {an && z.hinweis && <p className="text-sm font-semibold text-erde-900">→ {z.hinweis}</p>}
                      {an && e?.warnungen.map((w) => (
                        <p key={w} className="flex items-center gap-1.5 text-sm font-semibold text-akzent-700">
                          <IconWarnung className="h-4 w-4 shrink-0" /> {w}
                        </p>
                      ))}
                    </div>
                  </div>
                </li>
              );
            })}
        </ol>
      </section>

      <section className="karte overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-sand-200 bg-kalk-100 px-4 py-3 sm:px-5">
          <div>
            <p className="kicker">Materialliste</p>
            <h2 className="text-lg font-bold">
              {aufbau ? aufbau.titel : 'HP 14 Naturkalk-Haftputz'}
              {aufbau && <span className="font-normal text-erde-500"> · {BEREICH_LABEL[aufbau.bereich]}</span>}
            </h2>
            <p className="text-sm text-erde-500">
              {fmt(netto, 2)} m² · {fmt(vs, 1)} % Verschnitt · Stand {new Date().toLocaleDateString('de-DE')}
            </p>
          </div>
          <button type="button" onClick={() => window.print()} className="kein-druck btn-sekundaer shrink-0">
            <IconDrucken className="h-5 w-5" /> <span className="hidden sm:inline">Drucken / PDF</span>
          </button>
        </div>
        <ul className="divide-y divide-sand-200">
          {liste.map((z) => (
            <li key={z.produkt.id} className="grid grid-cols-[1fr_auto] items-start gap-x-4 gap-y-1 px-4 py-3.5 sm:px-5">
              <div className="min-w-0">
                <p className="font-bold text-erde-900">{z.produkt.name}</p>
                {z.produkt.sackgroesse_kg && <p className="text-sm text-erde-500">Sack à {z.produkt.sackgroesse_kg} kg</p>}
                {z.kg != null && z.produkt.verbrauch_hinweis && (
                  <p className="mt-0.5 text-xs font-semibold text-himmel-600" title={z.produkt.verbrauch_hinweis}>
                    Richtwert, abhängig vom Untergrund
                  </p>
                )}
                {z.verbrauchFolgt && z.kg != null && <p className="text-xs text-erde-500">zzgl. Schichten ohne Mengenangabe</p>}
              </div>
              {z.kg != null ? (
                <div className="text-right tabular-nums">
                  <p className="text-lg leading-tight font-bold text-erde-900">
                    {z.saecke} {z.saecke === 1 ? 'Sack' : 'Säcke'}
                  </p>
                  {z.paletten && (
                    <p className="text-sm font-semibold text-akzent-700">
                      = {z.paletten.voll} Palette{z.paletten.voll > 1 ? 'n' : ''}
                      {z.paletten.restSaecke > 0 && ` + ${z.paletten.restSaecke} Sack`}
                    </p>
                  )}
                  <p className="text-sm text-erde-700">
                    {fmt(z.kg, 1)} kg{z.wasserLiter != null && ` · ca. ${fmt(z.wasserLiter, 0)} l Wasser`}
                  </p>
                </div>
              ) : (
                <p className="max-w-32 text-right text-sm text-erde-500 italic">Verbrauchswert folgt – Demo</p>
              )}
            </li>
          ))}
          {liste.length === 0 && <li className="px-5 py-6 text-center text-erde-500">Keine Schicht ausgewählt.</li>}
        </ul>
        {gesamtTrocknung > 0 && (
          <p className="border-t border-sand-200 px-4 py-3 text-sm text-erde-700 sm:px-5">
            Trocknungszeiten (HP 14: ca. 1 Tag pro mm, abhängig von Temperatur und Luftfeuchte) summieren sich auf mindestens <strong>ca. {fmt(gesamtTrocknung, 0)} Tage</strong> –
            zzgl. Trocknungszeiten der Produkte ohne Datenblatt.
          </p>
        )}
      </section>

      <HinweisBox
        titel="So wird gerechnet"
        hinweise={[
          'Material = Fläche × Schichtdicke × Verbrauch × (1 + Verschnitt). Säcke werden je Produkt aufgerundet.',
          'HP 14: Verbrauch ≈ 1,0 kg/(m²·mm), abgeleitet aus der Merkblattangabe „ca. 5 m²/Sack bei ca. 5 mm“. Richtwert, abhängig vom Untergrund. (Hinweis: 19 l Nassmörtel je Sack ergäben rechnerisch nur ≈ 3,8 m² bei 5 mm.)',
          'HP 14: 3–5 mm pro Lage, Gewebespachtelung ca. 5 mm, Zahnspachtelung mit mind. 6er Zahntraufel (Vorschlag 3 mm – bitte anpassen). 42 Sack je Palette (ca. 1.050 kg).',
          'Für alle anderen Produkte liegen in der Demo noch keine Datenblätter vor – deshalb „Verbrauchswert folgt“ statt geschätzter Werte.',
        ]}
      />
    </>
  );
}

function PositionAnzeige({ e, woche }: { e: PositionErgebnis; woche?: boolean }) {
  if (e.status !== 'berechnet')
    return <p className="text-sm text-erde-500 italic">{e.status === 'verbrauch-folgt' ? 'Verbrauchswert folgt – Demo' : 'Bitte Schichtdicke angeben'}</p>;
  return (
    <dl className="grid grid-cols-3 gap-x-5 gap-y-1 text-sm">
      <div>
        <dt className="text-erde-500">Material</dt>
        <dd className="font-bold text-erde-900 tabular-nums">{fmt(e.kg, 1)} kg</dd>
      </div>
      <div>
        <dt className="text-erde-500">Wasser</dt>
        <dd className="font-bold text-erde-900 tabular-nums">{e.wasserLiter != null ? `ca. ${fmt(e.wasserLiter, 0)} l` : '–'}</dd>
      </div>
      <div>
        <dt className="text-erde-500">Trocknung</dt>
        <dd className="font-bold text-erde-900 tabular-nums">{woche ? 'ca. 1 Woche' : e.trocknungTage != null ? `ca. ${fmt(e.trocknungTage, 1)} Tage` : '–'}</dd>
      </div>
    </dl>
  );
}
