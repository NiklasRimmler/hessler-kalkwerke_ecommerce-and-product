import type { ReactNode } from 'react';
import { baum } from '../lib/daten';
import type { Bindemittel, Produkt } from '../lib/types';
import { IconInfo, IconMail, IconTelefon, IconWarnung } from './Icons';

export function Kontakt({ betreff, titel = 'Persönliche Beratung', text }: { betreff?: string; titel?: string; text?: ReactNode }) {
  const mail = `mailto:${baum.kontakt.email}${betreff ? `?subject=${encodeURIComponent(betreff)}` : ''}`;
  return (
    <section className="karte overflow-hidden">
      <div className="bg-erde-900 px-5 py-4 text-kalk-50">
        <p className="kicker !text-sand-300">Wir beraten Sie gerne</p>
        <h3 className="mt-1 text-lg font-bold">{titel}</h3>
      </div>
      <div className="space-y-4 p-5">
        {text && <div className="text-[15px] leading-relaxed text-erde-700">{text}</div>}
        <div className="grid gap-2 sm:grid-cols-2">
          <a href={mail} className="btn-primaer">
            <IconMail className="h-5 w-5" /> E-Mail schreiben
          </a>
          <a href={`tel:+49${baum.kontakt.telefon.replace(/^0|\D/g, '')}`} className="btn-sekundaer">
            <IconTelefon className="h-5 w-5" /> {baum.kontakt.telefon}
          </a>
        </div>
        <p className="text-sm text-erde-500">
          Tipp: Schicken Sie uns Bilder Ihres Untergrunds per E-Mail an <span className="font-semibold text-erde-700">{baum.kontakt.email}</span> – wir schicken Ihnen
          gerne die passenden Aufbauten zu.
        </p>
      </div>
    </section>
  );
}

export function HinweisBox({ titel, hinweise, ton = 'info' }: { titel: string; hinweise: ReactNode[]; ton?: 'info' | 'warnung' }) {
  if (!hinweise.length) return null;
  const warnung = ton === 'warnung';
  return (
    <section className={`rounded-2xl border p-5 ${warnung ? 'border-akzent-100 bg-akzent-50' : 'border-himmel-600/20 bg-himmel-50'}`}>
      <h3 className={`flex items-center gap-2 font-bold ${warnung ? 'text-akzent-700' : 'text-himmel-600'}`}>
        {warnung ? <IconWarnung className="h-5 w-5" /> : <IconInfo className="h-5 w-5" />}
        {titel}
      </h3>
      <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-erde-900">
        {hinweise.map((h, i) => (
          <li key={i} className="flex gap-2.5">
            <span className={`mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full ${warnung ? 'bg-akzent-500' : 'bg-himmel-600'}`} />
            <span>{h}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const BINDEMITTEL: Record<Exclude<Bindemittel, null>, { label: string; cls: string }> = {
  naturkalk: { label: 'Naturkalk', cls: 'bg-moos-50 text-moos-500' },
  kalk: { label: 'Kalk', cls: 'bg-moos-50 text-moos-500' },
  'kalk-zement': { label: 'Kalk-Zement', cls: 'bg-sand-100 text-erde-700' },
  zementhaltig: { label: 'zementhaltig', cls: 'bg-sand-100 text-erde-700' },
  fremdprodukt: { label: 'Fremdprodukt', cls: 'bg-himmel-50 text-himmel-600' },
};

export function BindemittelBadge({ produkt }: { produkt: Produkt }) {
  if (!produkt.bindemittel) return null;
  const b = BINDEMITTEL[produkt.bindemittel];
  return <span className={`badge ${b.cls}`}>{b.label}</span>;
}

export function DatenblattBadge({ produkt }: { produkt: Produkt }) {
  return produkt.datenblatt_vorhanden ? (
    <span className="badge bg-moos-50 text-moos-500">Merkblatt hinterlegt</span>
  ) : (
    <span className="badge border border-dashed border-sand-300 text-erde-500">Datenblatt folgt</span>
  );
}

export function AnnahmeHinweis({ children }: { children: ReactNode }) {
  return (
    <p className="flex gap-2 rounded-lg border border-dashed border-akzent-100 bg-akzent-50/60 px-3 py-2 text-sm text-akzent-700">
      <span className="font-bold whitespace-nowrap">Annahme:</span>
      <span>{children}</span>
    </p>
  );
}

export function Abschnitt({ titel, kicker, children, aktion }: { titel: string; kicker?: string; children: ReactNode; aktion?: ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          {kicker && <p className="kicker">{kicker}</p>}
          <h2 className="mt-1 text-xl font-bold text-erde-900">{titel}</h2>
        </div>
        {aktion}
      </div>
      {children}
    </section>
  );
}
