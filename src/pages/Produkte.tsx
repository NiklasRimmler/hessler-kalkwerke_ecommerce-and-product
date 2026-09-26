import type { ReactNode } from 'react';
import { BindemittelBadge, DatenblattBadge, HinweisBox, Kontakt } from '../components/Bausteine';
import { IconZurueck } from '../components/Icons';
import { BEREICH_LABEL, aufbauten, baum, findeProdukt, produkte } from '../lib/daten';
import { ersterPfadZuAufbau, produktIdsIn } from '../lib/finder';
import { fmt } from '../lib/rechner';
import type { Kategorie, Produkt } from '../lib/types';
import { finderHref } from './Finder';

const KATEGORIEN: Kategorie[] = ['Vorbehandlung', 'Grundierung', 'Haftputz/Spachtel', 'Grundputz', 'Oberputz', 'Anstrich', 'Zubehör'];

export function Produkte() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="kicker">Produkte</p>
        <h1 className="ueberschrift">Produkte in den Aufbauempfehlungen</h1>
        <p className="max-w-2xl text-erde-700">
          Kurzprofile aller Produkte, die in den Hessler-Aufbauten vorkommen. HP 14 ist vollständig aus dem technischen Merkblatt übernommen – für die übrigen Produkte folgt das
          Datenblatt.
        </p>
      </header>
      {KATEGORIEN.map((k) => {
        const liste = produkte.filter((p) => p.kategorie === k);
        if (!liste.length) return null;
        return (
          <section key={k} className="space-y-3">
            <h2 className="flex items-center gap-3 text-lg font-bold">
              {k}
              <span className="punktlinie flex-1" />
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {liste.map((p) => (
                <a key={p.id} href={`#/produkte/${p.id}`} className="karte flex flex-col gap-2 p-4 transition hover:border-akzent-500 hover:shadow-md">
                  <span className="text-[16px] leading-snug font-bold text-erde-900">{p.name}</span>
                  <span className="line-clamp-2 text-sm text-erde-700">{p.beschreibung}</span>
                  <span className="mt-auto flex flex-wrap gap-1.5 pt-1">
                    <BindemittelBadge produkt={p} />
                    <DatenblattBadge produkt={p} />
                  </span>
                </a>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Feld({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-dotted border-sand-300 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
      <dt className="font-bold text-erde-900">{label}</dt>
      <dd className="leading-relaxed text-erde-700">{children}</dd>
    </div>
  );
}

const FOLGT = <span className="text-erde-500 italic">Angabe folgt</span>;

export function ProduktDetail({ id }: { id: string }) {
  const p = findeProdukt(id);
  if (!p)
    return (
      <div className="space-y-4">
        <p>Produkt nicht gefunden.</p>
        <a href="#/produkte" className="btn-sekundaer">
          Alle Produkte
        </a>
      </div>
    );
  const vorkommen = aufbauten.filter((a) => produktIdsIn(a).includes(p.id));

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <a href="#/produkte" className="btn-text -ml-3">
        <IconZurueck className="h-5 w-5" /> Alle Produkte
      </a>
      <header className="space-y-3">
        <p className="kicker">{p.kategorie}</p>
        <h1 className="ueberschrift text-erde-700">{p.name}</h1>
        <div className="flex flex-wrap gap-1.5">
          <BindemittelBadge produkt={p} />
          <DatenblattBadge produkt={p} />
          {p.innen && <span className="badge bg-sand-100 text-erde-700">innen</span>}
          {p.aussen && <span className="badge bg-sand-100 text-erde-700">außen</span>}
        </div>
        <div className="punktlinie" />
        <p className="text-[17px] leading-relaxed text-erde-900">{p.beschreibung}</p>
      </header>

      {p.datenblatt_vorhanden ? <Merkblatt p={p} /> : <KurzprofilOhneDatenblatt p={p} />}

      {vorkommen.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">Kommt in diesen Aufbauempfehlungen vor</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {vorkommen.map((a) => (
              <li key={a.id}>
                <a
                  href={finderHref(ersterPfadZuAufbau(baum, a.id) ?? [], {}, true)}
                  className="karte flex h-full flex-col px-4 py-3 text-sm hover:border-akzent-500"
                >
                  <span className="text-xs font-bold tracking-wider text-erde-500 uppercase">{BEREICH_LABEL[a.bereich]}</span>
                  <span className="font-semibold text-erde-900">{a.titel}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-erde-500">Quelle: {p.quelle}</p>
      <Kontakt betreff={`Frage zu ${p.name}`} titel={`Fragen zu ${p.kurzname}?`} />
    </article>
  );
}

function Merkblatt({ p }: { p: Produkt }) {
  return (
    <>
      <section className="karte p-4 sm:p-5">
        <h2 className="text-lg font-bold">Technisches Merkblatt</h2>
        <dl className="mt-2">
          {p.zusammensetzung && (
            <Feld label="Zusammensetzung">
              {p.zusammensetzung} Korn: {p.koernung_mm} mm. {p.moertelgruppe && `Mörtelgruppe ${p.moertelgruppe}.`} Diffusionswiderstandszahl µ = {p.diffusionswiderstand_mu}.
            </Feld>
          )}
          {p.anwendung && <Feld label="Anwendungsbereich">{p.anwendung}</Feld>}
          {p.untergrund && <Feld label="Untergrund">{p.untergrund}</Feld>}
          {p.verarbeitung && <Feld label="Verarbeitung">{p.verarbeitung}</Feld>}
          {p.trocknung_text && <Feld label="Trocknung">{p.trocknung_text}</Feld>}
          {p.lagerung && <Feld label="Lagerung">{p.lagerung}</Feld>}
          {p.qualitaetsueberwachung && <Feld label="Qualität">{p.qualitaetsueberwachung}</Feld>}
          {p.sicherheitshinweise && <Feld label="Sicherheit">{p.sicherheitshinweise}</Feld>}
        </dl>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kennzahl wert={`${p.sackgroesse_kg} kg`} label="Sackgröße" />
        <Kennzahl wert={`ca. ${p.wasser_l_pro_sack} l`} label="Wasser je Sack" />
        <Kennzahl wert={`${p.min_schichtdicke_mm}–${p.max_schichtdicke_mm} mm`} label="pro Lage" />
        <Kennzahl wert={p.ergiebigkeit ? `ca. ${p.ergiebigkeit.m2_pro_sack} m²` : '–'} label={p.ergiebigkeit ? `je Sack bei ${p.ergiebigkeit.bei_schichtdicke_mm} mm` : 'Ergiebigkeit'} />
        <Kennzahl wert={`ca. ${p.nassmoertel_l_pro_sack} l`} label="Nassmörtel je Sack" />
        <Kennzahl wert={`${p.trocknung_tage_pro_mm} Tag/mm`} label="Trocknung" />
        <Kennzahl wert={`${p.sack_pro_palette} Sack`} label={`je Palette (ca. ${fmt(p.palettengewicht_kg ?? 0, 0)} kg)`} />
        <Kennzahl wert={`≈ ${fmt(p.verbrauch_kg_m2_mm ?? 0, 1)} kg`} label="je m² und mm (Richtwert)" />
      </section>

      <HinweisBox titel="Besondere Hinweise" hinweise={p.hinweise} ton="warnung" />
      <a href="#/rechner?a=hp-14" className="btn-primaer">
        Menge für HP 14 berechnen
      </a>
    </>
  );
}

function Kennzahl({ wert, label }: { wert: string; label: string }) {
  return (
    <div className="rounded-2xl bg-kalk-100 p-3.5">
      <p className="text-lg font-bold text-erde-900 tabular-nums">{wert}</p>
      <p className="text-xs text-erde-500">{label}</p>
    </div>
  );
}

function KurzprofilOhneDatenblatt({ p }: { p: Produkt }) {
  return (
    <>
      {p.hinweise.length > 0 && <HinweisBox titel="Hinweise aus der Aufbauempfehlung" hinweise={p.hinweise} />}
      <section className="rounded-2xl border border-dashed border-sand-300 p-4 sm:p-5">
        <h2 className="font-bold">Technische Daten</h2>
        <p className="mt-1 text-sm text-erde-500">Datenblatt folgt – in der Demo sind nur die Angaben aus der Aufbauempfehlung hinterlegt.</p>
        <dl className="mt-2">
          <Feld label="Hersteller">{p.hersteller ?? FOLGT}</Feld>
          <Feld label="Verbrauch">{FOLGT}</Feld>
          <Feld label="Gebinde">{FOLGT}</Feld>
          <Feld label="Schichtdicke">{FOLGT}</Feld>
          <Feld label="Trocknung">{FOLGT}</Feld>
        </dl>
      </section>
    </>
  );
}
