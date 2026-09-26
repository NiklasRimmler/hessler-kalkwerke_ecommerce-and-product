import { useState } from 'react';
import { AnnahmeHinweis, BindemittelBadge, HinweisBox, Kontakt } from '../components/Bausteine';
import { IconDrucken, IconHaken, IconRechner, IconTeilen } from '../components/Icons';
import { BEREICH_LABEL, baum, produkt } from '../lib/daten';
import { hinweiseFuer, loeseAufbau, type AufgeloesteSchicht, type PfadSchritt } from '../lib/finder';
import { absoluteUrl, antwortenParams, href } from '../lib/route';
import type { Antworten, Aufbau, Kategorie } from '../lib/types';
import { finderHref } from './Finder';

const KATEGORIE_STIL: Record<Kategorie, string> = {
  Vorbehandlung: 'bg-sand-300',
  Grundierung: 'bg-himmel-50',
  'Haftputz/Spachtel': 'bg-sand-100 textur-putz',
  Grundputz: 'bg-sand-200 textur-putz',
  Oberputz: 'bg-kalk-100',
  Anstrich: 'bg-akzent-100',
  Zubehör: 'bg-moos-50',
};

export function Ergebnis({ aufbau, schritte, pfad, antworten }: { aufbau: Aufbau; schritte: PfadSchritt[]; pfad: string[]; antworten: Antworten }) {
  const schichten = loeseAufbau(aufbau, antworten);
  const hinweise = hinweiseFuer(aufbau, schichten, produkt);
  const annahmen = [...new Set([...schritte.flatMap((s) => (s.option.annahme ? [s.option.annahme] : [])), ...aufbau.annahmen])];
  const untergrund = schritte[schritte.length - 1]?.option.label ?? aufbau.untergruende[0];
  const fragen = baum.zusatzfragen.filter((z) => aufbau.zusatzfragen.includes(z.id));
  const rechnerHref = href('rechner', { a: aufbau.id, ...antwortenParams(antworten) });

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <p className="kicker">Ihre Aufbauempfehlung · {BEREICH_LABEL[aufbau.bereich]}</p>
        <h1 className="ueberschrift">{aufbau.bereich === 'keller' ? aufbau.titel : `Aufbau für ${untergrund}`}</h1>
        {aufbau.bereich !== 'keller' && untergrund !== aufbau.titel && <p className="text-erde-700">Aufbau „{aufbau.titel}“ laut Hessler-Aufbauempfehlung.</p>}
        {fragen.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            {fragen.map((f) => (
              <span key={f.id} className={`badge ${antworten[f.id] ? 'bg-erde-900 text-kalk-50' : 'bg-sand-100 text-erde-700'}`}>
                {kurzFrage(f.id)}: {antworten[f.id] ? 'ja' : 'nein'}
              </span>
            ))}
            <a href={finderHref(pfad, antworten, false)} className="kein-druck ml-1 font-semibold text-akzent-600 underline-offset-2 hover:underline">
              ändern
            </a>
          </div>
        )}
      </header>

      <div className="kein-druck flex flex-col gap-2 sm:flex-row">
        <a href={rechnerHref} className="btn-primaer">
          <IconRechner className="h-5 w-5" /> Mengen berechnen
        </a>
        <TeilenButton />
        <button type="button" className="btn-sekundaer" onClick={() => window.print()}>
          <IconDrucken className="h-5 w-5" /> Drucken
        </button>
      </div>

      <section aria-labelledby="schichten-titel" className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 id="schichten-titel" className="text-xl font-bold">
            Schichtaufbau
          </h2>
          <p className="text-sm text-erde-500">oben = letzte Schicht</p>
        </div>
        <ol className="space-y-2.5">
          {[...schichten].reverse().map((s) => (
            <SchichtKarte key={s.nr} s={s} />
          ))}
          <li className="flex overflow-hidden rounded-2xl border border-sand-300">
            <div className="textur-untergrund w-4 shrink-0 sm:w-6" />
            <div className="flex-1 bg-sand-100 px-4 py-3">
              <p className="text-xs font-bold tracking-wider text-erde-500 uppercase">Untergrund</p>
              <p className="font-bold text-erde-900">{untergrund}</p>
            </div>
          </li>
        </ol>
      </section>

      <HinweisBox titel="Wichtige Hinweise" hinweise={hinweise} ton="warnung" />

      {annahmen.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-bold tracking-wider text-erde-500 uppercase">Demo-Annahmen</h2>
          {annahmen.map((a) => (
            <AnnahmeHinweis key={a}>{a}</AnnahmeHinweis>
          ))}
        </section>
      )}

      <details className="karte group p-5">
        <summary className="cursor-pointer list-none font-bold text-erde-900 marker:hidden">
          <span className="flex items-center justify-between">
            Originaltext der Aufbauempfehlung
            <span className="text-akzent-600 transition group-open:rotate-45">+</span>
          </span>
        </summary>
        <p className="mt-3 leading-relaxed text-erde-700">{aufbau.beschreibungstext}</p>
        <p className="mt-3 text-xs text-erde-500">Quelle: KD_Aufbauempfehlungen_Online, Abschnitt {aufbau.quelle_abschnitt}</p>
      </details>

      <Kontakt
        betreff={`Aufbauempfehlung ${aufbau.titel}`}
        titel="Genau auf Ihr Projekt abgestimmt"
        text="Für eine genaue Aufbauempfehlung, optimal auf Ihr Projekt abgestimmt, wenden Sie sich gerne direkt an uns."
      />
    </article>
  );
}

function kurzFrage(id: string): string {
  return (
    { schaloel: 'Schalölreste', durchschlag: 'Durchschlagende Stoffe', rissrisiko: 'Rissrisiko', holzstaender: 'Holzständerbau', farbanstrich: 'Farbanstrich' }[id] ?? id
  );
}

function SchichtKarte({ s }: { s: AufgeloesteSchicht }) {
  const p = produkt(s.produktId);
  const aktiv = s.status === 'aktiv';
  const pflicht = !s.schicht.optional && !s.schicht.bedingung;
  const gewebe = s.schicht.zubehoer.includes('armierungsgewebe') || s.produktId === 'armierungsgewebe';
  return (
    <li className={`flex overflow-hidden rounded-2xl border ${aktiv ? 'border-sand-200 bg-white shadow-[0_1px_2px_rgba(51,37,26,0.04)]' : 'border-dashed border-sand-300 bg-kalk-50'}`}>
      <div className={`relative w-4 shrink-0 sm:w-6 ${KATEGORIE_STIL[p.kategorie]} ${gewebe ? 'textur-gewebe' : ''} ${aktiv ? '' : 'opacity-40'}`} aria-hidden="true" />
      <div className={`flex-1 space-y-2 p-4 ${aktiv ? '' : 'opacity-75'}`}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-wider text-erde-500 uppercase">
              {s.nr}. {s.schicht.funktion}
            </p>
            <a href={`#/produkte/${p.id}`} className="mt-0.5 block text-[17px] leading-snug font-bold text-erde-900 hover:text-akzent-600">
              {p.name}
            </a>
            {s.schicht.technik && <p className="text-sm text-erde-500">{s.schicht.technik}</p>}
          </div>
          <div className="flex flex-wrap gap-1">
            {pflicht ? (
              <span className="badge bg-erde-900 text-kalk-50">Pflicht</span>
            ) : aktiv ? (
              <span className="badge bg-akzent-500 text-white">
                <IconHaken className="h-3.5 w-3.5" /> gewählt
              </span>
            ) : (
              <span className="badge border border-sand-300 bg-white text-erde-700">{s.schicht.optional_label ?? 'bei Bedarf'}</span>
            )}
            <BindemittelBadge produkt={p} />
          </div>
        </div>

        {s.ersatzBegruendung && (
          <p className="rounded-lg bg-akzent-50 px-3 py-2 text-sm text-akzent-700">
            <strong>Statt {produkt(s.schicht.produkt_id).kurzname}:</strong> {s.ersatzBegruendung}
          </p>
        )}
        <p className="text-[15px] leading-relaxed text-erde-700">{s.schicht.begruendung}</p>

        {(s.schicht.alternativen.length > 0 || s.schicht.zubehoer.length > 0 || (!s.ersatzBegruendung && s.schicht.ersatz.length > 0)) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {s.schicht.alternativen.length > 0 && (
              <p>
                <span className="text-erde-500">Alternativ: </span>
                {s.schicht.alternativen.map((id, i) => (
                  <span key={id}>
                    {i > 0 && ', '}
                    <a href={`#/produkte/${id}`} className="font-semibold text-erde-900 underline decoration-sand-300 underline-offset-2 hover:text-akzent-600">
                      {produkt(id).name}
                    </a>
                  </span>
                ))}
              </p>
            )}
            {!s.ersatzBegruendung &&
              s.schicht.ersatz.map((e) => (
                <p key={e.produkt_id}>
                  <span className="text-erde-500">Bei durchschlagenden Stoffen: </span>
                  <a href={`#/produkte/${e.produkt_id}`} className="font-semibold text-erde-900 underline decoration-sand-300 underline-offset-2 hover:text-akzent-600">
                    {produkt(e.produkt_id).name}
                  </a>
                </p>
              ))}
            {s.schicht.zubehoer.map((id) => (
              <p key={id}>
                <span className="text-erde-500">mit </span>
                <a href={`#/produkte/${id}`} className="font-semibold text-erde-900 underline decoration-sand-300 underline-offset-2 hover:text-akzent-600">
                  {produkt(id).name}
                </a>
              </p>
            ))}
          </div>
        )}
        {s.schicht.hinweis && <p className="text-sm font-semibold text-erde-900">→ {s.schicht.hinweis}</p>}
        {s.schicht.annahme && <AnnahmeHinweis>{s.schicht.annahme}</AnnahmeHinweis>}
      </div>
    </li>
  );
}

function TeilenButton() {
  const [kopiert, setKopiert] = useState(false);
  const teilen = async () => {
    const url = absoluteUrl(window.location.hash);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Meine Naturkalk-Aufbauempfehlung', url });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2500);
    } catch {
      window.prompt('Link kopieren:', url);
    }
  };
  return (
    <button type="button" className="btn-sekundaer" onClick={teilen}>
      {kopiert ? <IconHaken className="h-5 w-5" /> : <IconTeilen className="h-5 w-5" />}
      {kopiert ? 'Link kopiert' : 'Empfehlung teilen'}
    </button>
  );
}
