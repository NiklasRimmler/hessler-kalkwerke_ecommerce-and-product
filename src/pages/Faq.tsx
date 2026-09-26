import { useMemo, useState } from 'react';
import { BindemittelBadge, Kontakt } from '../components/Bausteine';
import { IconChat, IconSuche } from '../components/Icons';
import { faq, produkt, produkte } from '../lib/daten';
import { href, type Route } from '../lib/route';
import { sucheFaq, sucheProdukte } from '../lib/suche';

const QUELLE: Record<string, string> = { merkblatt: 'Merkblatt HP 14', aufbauten: 'Aufbauempfehlungen' };

export function Faq({ route }: { route: Route }) {
  const [q, setQ] = useState(route.params.get('q') ?? '');
  const offenStart = route.params.get('f');
  const faqTreffer = useMemo(() => sucheFaq(faq, q), [q]);
  const produktTreffer = useMemo(() => sucheProdukte(produkte, q).slice(0, 6), [q]);

  const aendern = (wert: string) => {
    setQ(wert);
    window.history.replaceState(null, '', href('faq', { q: wert || undefined }));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <p className="kicker">FAQ & Fragen</p>
        <h1 className="ueberschrift">Häufige Fragen rund um Naturkalk</h1>
        <p className="text-erde-700">Alle Antworten stammen aus dem Merkblatt HP 14 und den Hessler-Aufbauempfehlungen.</p>
      </header>

      <div className="relative">
        <IconSuche className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-sand-500" />
        <input
          type="search"
          value={q}
          onChange={(e) => aendern(e.target.value)}
          placeholder="Stichwort, z. B. Gips, Temperatur, Styropor …"
          className="eingabe min-h-13 !rounded-full pl-12 text-[17px]"
          aria-label="FAQ und Produkte durchsuchen"
        />
      </div>

      {q && produktTreffer.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-bold tracking-wider text-erde-500 uppercase">Passende Produkte</h2>
          <div className="flex flex-wrap gap-2">
            {produktTreffer.map(({ eintrag: p }) => (
              <a key={p.id} href={`#/produkte/${p.id}`} className="karte flex items-center gap-2 px-3.5 py-2 text-sm font-semibold hover:border-akzent-500">
                {p.name} <BindemittelBadge produkt={p} />
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-2.5">
        {q && <h2 className="text-sm font-bold tracking-wider text-erde-500 uppercase">{faqTreffer.length} {faqTreffer.length === 1 ? 'Antwort' : 'Antworten'}</h2>}
        {faqTreffer.map(({ eintrag: f }) => (
          <details key={f.id} id={`faq-${f.id}`} className="karte group" open={offenStart === f.id || (!!q && faqTreffer.length <= 2)}>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-4 sm:p-5">
              <span className="text-[16px] font-bold text-erde-900">{f.frage}</span>
              <span className="mt-0.5 text-xl leading-none text-akzent-600 transition group-open:rotate-45">+</span>
            </summary>
            <div className="space-y-3 px-4 pb-5 sm:px-5">
              <p className="leading-relaxed text-erde-700">{f.antwort}</p>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-erde-500">Quelle:</span>
                {f.quelle.map((qq) => (
                  <span key={qq} className="badge bg-sand-100 text-erde-700">
                    {QUELLE[qq] ?? qq}
                  </span>
                ))}
                {f.produkte.map((id) => (
                  <a key={id} href={`#/produkte/${id}`} className="badge bg-kalk-100 text-akzent-600 hover:bg-akzent-50">
                    {produkt(id).kurzname}
                  </a>
                ))}
              </div>
            </div>
          </details>
        ))}
        {faqTreffer.length === 0 && (
          <p className="karte p-5 text-erde-700">
            Dazu haben wir keine FAQ gefunden. Stellen Sie Ihre Frage gerne im{' '}
            <a href="#/chat" className="font-semibold text-akzent-600 underline underline-offset-2">
              Chat
            </a>{' '}
            oder direkt an unsere Beratung.
          </p>
        )}
      </section>

      <a href="#/chat" className="karte flex items-center gap-4 p-4 hover:border-akzent-500 sm:p-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-akzent-50 text-akzent-600">
          <IconChat className="h-7 w-7" />
        </span>
        <span>
          <span className="block font-bold text-erde-900">Eigene Frage stellen</span>
          <span className="text-sm text-erde-500">Der Chat antwortet ausschließlich auf Basis der Hessler-Unterlagen (optional, in der Demo ggf. deaktiviert).</span>
        </span>
      </a>

      <Kontakt />
    </div>
  );
}
