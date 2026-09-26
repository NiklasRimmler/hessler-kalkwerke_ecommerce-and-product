import type { ReactNode } from 'react';
import { DISCLAIMER, baum } from '../lib/daten';
import { IconBuch, IconChat, IconFinder, IconMail, IconRechner, IconSack, IconTelefon } from './Icons';

export type Bereich = 'start' | 'finder' | 'rechner' | 'faq' | 'produkte' | 'chat';

const NAV: { id: Exclude<Bereich, 'start'>; label: string; kurz: string; href: string; Icon: typeof IconFinder }[] = [
  { id: 'finder', label: 'Produktfinder', kurz: 'Finder', href: '#/finder', Icon: IconFinder },
  { id: 'rechner', label: 'Mengenrechner', kurz: 'Menge', href: '#/rechner', Icon: IconRechner },
  { id: 'faq', label: 'FAQ & Fragen', kurz: 'FAQ', href: '#/faq', Icon: IconBuch },
  { id: 'produkte', label: 'Produkte', kurz: 'Produkte', href: '#/produkte', Icon: IconSack },
  { id: 'chat', label: 'Chat', kurz: 'Chat', href: '#/chat', Icon: IconChat },
];

export function Layout({ aktiv, children }: { aktiv: Bereich; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="kein-druck sticky top-0 z-30 border-b border-sand-200 bg-kalk-50/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
          <a href="#/" className="group flex items-center gap-3" aria-label="Startseite">
            <span className="flex h-9 flex-col justify-center gap-[3px] rounded-md bg-erde-900 px-2" aria-hidden="true">
              <span className="block h-[5px] w-5 rounded-[1px] bg-kalk-50" />
              <span className="block h-[5px] w-5 rounded-[1px] bg-sand-300" />
              <span className="block h-[5px] w-5 rounded-[1px] bg-akzent-500" />
            </span>
            <span className="leading-tight">
              <span className="block text-[17px] font-bold tracking-tight text-erde-900">Hessler Kalkwerke</span>
              <span className="block text-[11px] font-semibold tracking-[0.16em] text-akzent-600 uppercase">Naturkalk · Demo</span>
            </span>
          </a>
          <nav className="hidden md:block" aria-label="Hauptnavigation">
            <ul className="flex items-center gap-1">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a
                    href={n.href}
                    aria-current={aktiv === n.id ? 'page' : undefined}
                    className={`rounded-full px-3.5 py-2 text-[15px] font-semibold transition-colors ${
                      aktiv === n.id ? 'bg-erde-900 text-kalk-50' : 'text-erde-700 hover:bg-sand-100'
                    }`}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-16">{children}</main>

      <Footer />

      <nav
        className="kein-druck fixed inset-x-0 bottom-0 z-30 border-t border-sand-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="Hauptnavigation"
      >
        <ul className="grid grid-cols-5">
          {NAV.map((n) => (
            <li key={n.id}>
              <a
                href={n.href}
                aria-current={aktiv === n.id ? 'page' : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${aktiv === n.id ? 'text-akzent-600' : 'text-erde-500'}`}
              >
                <n.Icon className="h-6 w-6" />
                {n.kurz}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-sand-200 bg-kalk-100 pb-24 md:pb-0">
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 text-sm text-erde-700 md:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <p className="font-semibold text-erde-900">Hessler Kalkwerke – Demo</p>
          <p className="max-w-2xl leading-relaxed">{DISCLAIMER}</p>
          <p className="text-xs text-erde-500">
            Klickbare Demo auf Basis der Aufbauempfehlungen und des Merkblatts HP 14 (Stand September 2022). Keine offizielle Seite der Hessler Kalkwerke GmbH.
          </p>
        </div>
        <div className="kein-druck space-y-1.5">
          <a className="flex items-center gap-2 font-semibold text-erde-900 hover:text-akzent-600" href={`mailto:${baum.kontakt.email}`}>
            <IconMail className="h-4 w-4" /> {baum.kontakt.email}
          </a>
          <a className="flex items-center gap-2 font-semibold text-erde-900 hover:text-akzent-600" href={`tel:+49${baum.kontakt.telefon.replace(/^0|\D/g, '')}`}>
            <IconTelefon className="h-4 w-4" /> {baum.kontakt.telefon}
          </a>
        </div>
      </div>
    </footer>
  );
}
