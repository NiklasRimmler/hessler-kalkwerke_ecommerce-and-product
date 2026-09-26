import { IconAussen, IconBuch, IconInnen, IconKeller, IconPfeil, IconRechner, IconSockel } from '../components/Icons';
import { finderHref } from './Finder';

const BEREICHE = [
  { id: 'innen', label: 'Innen', Icon: IconInnen },
  { id: 'aussen', label: 'Außen', Icon: IconAussen },
  { id: 'sockel', label: 'Sockel', Icon: IconSockel },
  { id: 'keller', label: 'Nasser Keller', Icon: IconKeller },
];

export function Start() {
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl bg-erde-900 text-kalk-50">
        {/* Schichtschnitt als ruhiges Motiv */}
        <div className="absolute inset-y-0 right-0 hidden w-2/5 sm:block" aria-hidden="true">
          <div className="flex h-full flex-col">
            <div className="flex-[1] bg-akzent-500" />
            <div className="textur-putz flex-[2] bg-kalk-100" />
            <div className="textur-gewebe flex-[1] bg-sand-100" />
            <div className="textur-putz flex-[4] bg-sand-200" />
            <div className="flex-[1] bg-sand-300" />
            <div className="textur-untergrund flex-[3]" />
          </div>
        </div>
        <div className="relative space-y-5 p-6 sm:max-w-[60%] sm:p-10">
          <p className="text-xs font-bold tracking-[0.16em] text-sand-300 uppercase">Das Hessler Kalksystem · Demo</p>
          <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-4xl">Welcher Naturkalk-Aufbau passt zu Ihrer Wand?</h1>
          <p className="text-[17px] leading-relaxed text-sand-200">
            In drei Schritten zur Aufbauempfehlung – mit Begründung zu jeder Schicht, Verarbeitungshinweisen und Materialliste.
          </p>
          <a href="#/finder" className="btn-primaer text-base">
            Produktfinder starten <IconPfeil className="h-5 w-5" />
          </a>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Direkt einsteigen: Wo soll verputzt werden?</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BEREICHE.map(({ id, label, Icon }) => (
            <a key={id} href={finderHref([id])} className="group karte flex items-center gap-3 p-4 transition hover:border-akzent-500 hover:shadow-md">
              <Icon className="h-9 w-9 shrink-0 text-erde-700 group-hover:text-akzent-600" />
              <span className="font-bold">{label}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Feature
          href="#/finder"
          titel="Produktfinder"
          text="Bereich, Untergrund, Details – und Sie erhalten den kompletten Schichtaufbau nach Hessler-Aufbauempfehlung, inklusive Alternativen."
          Icon={IconInnen}
        />
        <Feature
          href="#/rechner?a=hp-14"
          titel="Mengenrechner"
          text="Fläche eingeben, Schichtdicke prüfen: Material in kg, Säcke, Wasserbedarf und Trocknungszeit – als druckbare Materialliste."
          Icon={IconRechner}
        />
        <Feature href="#/faq" titel="FAQ & Fragen" text="Mindesttemperatur, Gipsuntergründe, Außeneinsatz von HP 14 und mehr – mit Stichwortsuche." Icon={IconBuch} />
      </section>
    </div>
  );
}

function Feature({ href, titel, text, Icon }: { href: string; titel: string; text: string; Icon: typeof IconInnen }) {
  return (
    <a href={href} className="group karte flex flex-col gap-3 p-5 transition hover:border-akzent-500 hover:shadow-md">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-kalk-100 text-erde-700 group-hover:bg-akzent-50 group-hover:text-akzent-600">
        <Icon className="h-7 w-7" />
      </span>
      <span className="text-lg font-bold">{titel}</span>
      <span className="text-[15px] leading-relaxed text-erde-700">{text}</span>
      <span className="mt-auto flex items-center gap-1 pt-1 text-sm font-bold text-akzent-600">
        Öffnen <IconPfeil className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </a>
  );
}
