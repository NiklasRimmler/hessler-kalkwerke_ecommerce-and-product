import { useMemo } from 'react';
import { AnnahmeHinweis, Kontakt } from '../components/Bausteine';
import { IconNeu, IconPfeil, IconZurueck, OptionIcon } from '../components/Icons';
import { baum, findeAufbau } from '../lib/daten';
import { loesePfad, type PfadSchritt } from '../lib/finder';
import { antwortenAusParams, antwortenParams, href, navigiere, type Route } from '../lib/route';
import type { Antworten, Aufbau, Knoten, Option } from '../lib/types';
import { Ergebnis } from './Ergebnis';

const SCHRITTE = ['Bereich', 'Untergrund', 'Material', 'Details', 'Empfehlung'];

export function finderHref(pfad: string[], antworten: Antworten = {}, ergebnis = false) {
  return href('finder', { p: pfad.join('.') || undefined, ...antwortenParams(antworten), ansicht: ergebnis ? 'ergebnis' : undefined });
}

export function Finder({ route }: { route: Route }) {
  const pfad = useMemo(() => (route.params.get('p') ?? '').split('.').filter(Boolean), [route]);
  const antworten = useMemo(() => antwortenAusParams(route.params), [route]);
  const zeigeErgebnis = route.params.get('ansicht') === 'ergebnis';
  const r = useMemo(() => loesePfad(baum, pfad), [pfad]);

  // Ungültige Deep-Links auf den letzten gültigen Stand kürzen
  const gueltigerPfad = r.schritte.map((s) => s.option.id);
  if (r.ungueltig) {
    queueMicrotask(() => navigiere(finderHref(gueltigerPfad)));
    return null;
  }

  const aufbau = r.ziel?.typ === 'aufbau' ? findeAufbau(r.ziel.id) : undefined;
  const brauchtDetails = !!aufbau && aufbau.zusatzfragen.length > 0 && !zeigeErgebnis;

  let schrittIndex = 0;
  if (r.knoten) schrittIndex = r.knoten.schritt - 1;
  else if (brauchtDetails) schrittIndex = 3;
  else if (r.ziel) schrittIndex = 4;

  const zurueck = () => {
    if (aufbau && zeigeErgebnis && aufbau.zusatzfragen.length) navigiere(finderHref(pfad, antworten, false));
    else navigiere(finderHref(pfad.slice(0, -1), antworten));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="kein-druck space-y-4">
        <Fortschritt index={schrittIndex} beratung={r.ziel?.typ === 'beratung'} />
        {pfad.length > 0 && (
          <div className="flex items-center justify-between gap-2">
            <button type="button" onClick={zurueck} className="btn-text -ml-3">
              <IconZurueck className="h-5 w-5" /> Zurück
            </button>
            <a href="#/finder" className="btn-text -mr-3">
              <IconNeu className="h-5 w-5" /> Neu starten
            </a>
          </div>
        )}
        {r.schritte.length > 0 && <Brotkrumen schritte={r.schritte} />}
      </div>

      {r.knoten && <Frage knoten={r.knoten} pfad={pfad} antworten={antworten} />}
      {r.ziel?.typ === 'beratung' && <Beratung schritte={r.schritte} grund={r.ziel.grund} hinweis={r.ziel.hinweis} />}
      {aufbau && brauchtDetails && <Details aufbau={aufbau} pfad={pfad} antworten={antworten} />}
      {aufbau && !brauchtDetails && <Ergebnis aufbau={aufbau} schritte={r.schritte} pfad={pfad} antworten={antworten} />}
    </div>
  );
}

function Fortschritt({ index, beratung }: { index: number; beratung: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold text-erde-500">
        <span>
          Schritt {Math.min(index + 1, SCHRITTE.length)} von {SCHRITTE.length}
        </span>
        <span className="text-erde-700">{beratung ? 'Beratung' : SCHRITTE[index]}</span>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={5} aria-valuenow={index + 1}>
        {SCHRITTE.map((s, i) => (
          <div key={s} className={`h-1.5 rounded-full ${i <= index ? 'bg-akzent-500' : 'bg-sand-200'}`} />
        ))}
      </div>
    </div>
  );
}

function Brotkrumen({ schritte }: { schritte: PfadSchritt[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-1.5 text-sm">
      {schritte.map((s, i) => (
        <li key={s.knoten.id} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-sand-500">›</span>}
          <a
            href={finderHref(schritte.slice(0, i).map((x) => x.option.id))}
            className="rounded-full bg-sand-100 px-2.5 py-0.5 font-medium text-erde-700 hover:bg-sand-200"
            title="Auswahl ändern"
          >
            {s.option.label}
          </a>
        </li>
      ))}
    </ol>
  );
}

function Frage({ knoten, pfad, antworten }: { knoten: Knoten; pfad: string[]; antworten: Antworten }) {
  const hauptoptionen = knoten.optionen.filter((o) => o.ziel.typ !== 'beratung' || o.ziel.grund === 'offen');
  const ausstiege = knoten.optionen.filter((o) => o.ziel.typ === 'beratung' && o.ziel.grund !== 'offen');
  const mitIcons = hauptoptionen.some((o) => o.icon);
  return (
    <section className="space-y-5">
      <div>
        <h1 className="ueberschrift">{knoten.frage}</h1>
        {knoten.hilfetext && <p className="mt-2 text-erde-700">{knoten.hilfetext}</p>}
      </div>
      <div className={`grid gap-3 ${mitIcons ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {hauptoptionen.map((o) => (
          <Kachel key={o.id} option={o} href={finderHref([...pfad, o.id], antworten)} gross={mitIcons} />
        ))}
      </div>
      {ausstiege.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {ausstiege.map((o) => (
            <a
              key={o.id}
              href={finderHref([...pfad, o.id], antworten)}
              className="flex min-h-14 items-center gap-3 rounded-2xl border border-dashed border-sand-300 px-4 py-3 font-semibold text-erde-700 hover:border-erde-500 hover:bg-white"
            >
              <OptionIcon name={o.icon} className="h-7 w-7 shrink-0 text-sand-500" />
              {o.label}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

function Kachel({ option, href: ziel, gross }: { option: Option; href: string; gross: boolean }) {
  const offen = option.ziel.typ === 'beratung';
  if (gross)
    return (
      <a
        href={ziel}
        className="group karte flex min-h-36 flex-col justify-between gap-3 p-4 transition hover:-translate-y-0.5 hover:border-akzent-500 hover:shadow-md sm:min-h-40 sm:p-5"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-kalk-100 text-erde-700 transition group-hover:bg-akzent-50 group-hover:text-akzent-600">
          <OptionIcon name={option.icon} className="h-9 w-9" />
        </span>
        <span className="flex items-end justify-between gap-2 text-[17px] leading-snug font-bold text-erde-900">
          {option.label}
          <IconPfeil className="h-5 w-5 shrink-0 text-sand-500 transition group-hover:translate-x-0.5 group-hover:text-akzent-500" />
        </span>
      </a>
    );
  return (
    <a href={ziel} className="group karte flex min-h-16 items-center justify-between gap-3 px-4 py-3.5 transition hover:border-akzent-500 hover:shadow-md">
      <span>
        <span className="block text-[16px] font-bold text-erde-900">{option.label}</span>
        {offen && <span className="text-sm text-erde-500">Persönliche Beratung</span>}
      </span>
      <IconPfeil className="h-5 w-5 shrink-0 text-sand-500 transition group-hover:translate-x-0.5 group-hover:text-akzent-500" />
    </a>
  );
}

function Details({ aufbau, pfad, antworten }: { aufbau: Aufbau; pfad: string[]; antworten: Antworten }) {
  const fragen = baum.zusatzfragen.filter((z) => aufbau.zusatzfragen.includes(z.id));
  const setze = (id: string, wert: boolean) => {
    const neu = { ...antworten, [id]: wert };
    window.history.replaceState(null, '', finderHref(pfad, neu));
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };
  return (
    <section className="space-y-5">
      <div>
        <h1 className="ueberschrift">Noch ein paar Details</h1>
        <p className="mt-2 text-erde-700">Damit wir den Aufbau für „{aufbau.titel}“ genau zusammenstellen können. Im Zweifel einfach „Nein“ lassen.</p>
      </div>
      <div className="space-y-3">
        {fragen.map((f) => {
          const wert = antworten[f.id] ?? f.standard;
          return (
            <fieldset key={f.id} className="karte p-4 sm:p-5">
              <legend className="sr-only">{f.frage}</legend>
              <p className="text-[16px] font-bold text-erde-900">{f.frage}</p>
              <p className="mt-1 text-sm text-erde-500">{f.hilfetext}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:w-64">
                {[true, false].map((w) => (
                  <label
                    key={String(w)}
                    className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border text-[15px] font-semibold transition ${
                      wert === w ? 'border-erde-900 bg-erde-900 text-kalk-50' : 'border-sand-300 bg-white text-erde-700 hover:border-erde-500'
                    }`}
                  >
                    <input type="radio" name={f.id} className="sr-only" checked={wert === w} onChange={() => setze(f.id, w)} />
                    {w ? 'Ja' : 'Nein'}
                  </label>
                ))}
              </div>
            </fieldset>
          );
        })}
      </div>
      <a href={finderHref(pfad, antworten, true)} className="btn-primaer w-full sm:w-auto">
        Empfehlung anzeigen <IconPfeil className="h-5 w-5" />
      </a>
    </section>
  );
}

function Beratung({ schritte, grund, hinweis }: { schritte: PfadSchritt[]; grund: 'sonstiges' | 'unsicher' | 'offen'; hinweis?: string }) {
  const b = baum.beratung[grund];
  const auswahl = schritte.map((s) => s.option.label).join(' › ');
  const annahmen = schritte.flatMap((s) => (s.option.annahme ? [s.option.annahme] : []));
  return (
    <section className="space-y-5">
      <div>
        <p className="kicker">Beratung</p>
        <h1 className="ueberschrift mt-1">{b.titel}</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-erde-700">{b.text}</p>
      </div>
      {hinweis && (
        <p className="rounded-xl border border-sand-200 bg-kalk-100 px-4 py-3 text-sm text-erde-700">
          <span className="font-semibold text-erde-900">Demo-Hinweis:</span> {hinweis} Dieser Fall ist in <code>regeln.md</code> als offener Punkt für Hessler vermerkt.
        </p>
      )}
      {annahmen.map((a) => (
        <AnnahmeHinweis key={a}>{a}</AnnahmeHinweis>
      ))}
      <Kontakt betreff={`Aufbauempfehlung: ${auswahl}`} text={<>Ihre Auswahl: <strong className="text-erde-900">{auswahl}</strong></>} />
    </section>
  );
}
