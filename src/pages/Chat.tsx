import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Kontakt } from '../components/Bausteine';
import { IconChat, IconPfeil } from '../components/Icons';

interface Nachricht {
  role: 'user' | 'assistant';
  content: string;
}

const BEISPIELE = ['Kann ich HP 14 außen verwenden?', 'Wie verputze ich Rigipsplatten?', 'Wie lange muss HP 14 trocknen?'];

export function Chat() {
  const [status, setStatus] = useState<'pruefe' | 'aktiv' | 'aus'>('pruefe');
  const [verlauf, setVerlauf] = useState<Nachricht[]>([]);
  const [eingabe, setEingabe] = useState('');
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const endeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let abbruch = false;
    fetch('api/chat')
      .then((r) => (r.ok ? r.json() : { enabled: false }))
      .then((d: { enabled?: boolean }) => !abbruch && setStatus(d.enabled ? 'aktiv' : 'aus'))
      .catch(() => !abbruch && setStatus('aus'));
    return () => {
      abbruch = true;
    };
  }, []);

  useEffect(() => endeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), [verlauf, laedt]);

  const senden = async (text: string) => {
    const frage = text.trim();
    if (!frage || laedt) return;
    const neu: Nachricht[] = [...verlauf, { role: 'user', content: frage }];
    setVerlauf(neu);
    setEingabe('');
    setFehler(null);
    setLaedt(true);
    try {
      const r = await fetch('api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: neu }) });
      const d = (await r.json()) as { antwort?: string; error?: string };
      if (!r.ok || !d.antwort) throw new Error(d.error ?? 'Der Chat ist gerade nicht erreichbar.');
      setVerlauf([...neu, { role: 'assistant', content: d.antwort }]);
    } catch (e) {
      setFehler(e instanceof Error ? e.message : 'Der Chat ist gerade nicht erreichbar.');
    } finally {
      setLaedt(false);
    }
  };

  const absenden = (e: FormEvent) => {
    e.preventDefault();
    void senden(eingabe);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <p className="kicker">Chat · optional</p>
        <h1 className="ueberschrift">Fragen Sie den Naturkalk-Assistenten</h1>
        <p className="text-erde-700">
          Der Assistent antwortet ausschließlich auf Basis der Hessler-Unterlagen dieser Demo. Bei Unsicherheit verweist er an die persönliche Beratung. Keine Gewähr für die
          Antworten.
        </p>
      </header>

      {status === 'pruefe' && <p className="karte p-5 text-erde-500">Verbindung wird geprüft …</p>}

      {status === 'aus' && (
        <section className="karte space-y-3 p-5 text-center sm:p-8">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sand-100 text-erde-500">
            <IconChat className="h-8 w-8" />
          </span>
          <h2 className="text-lg font-bold">Der Chat ist in der Demo deaktiviert</h2>
          <p className="mx-auto max-w-md text-erde-700">
            Für den Chat wird serverseitig ein API-Schlüssel benötigt. Alle anderen Funktionen stehen vollständig zur Verfügung – viele Antworten finden Sie bereits in den FAQ.
          </p>
          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            <a href="#/faq" className="btn-primaer">
              Zu den FAQ
            </a>
            <a href="#/finder" className="btn-sekundaer">
              Produktfinder starten
            </a>
          </div>
        </section>
      )}

      {status === 'aktiv' && (
        <section className="karte flex flex-col overflow-hidden">
          <div className="max-h-[60vh] min-h-64 space-y-3 overflow-y-auto p-4 sm:p-5" aria-live="polite">
            {verlauf.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-erde-500">Zum Beispiel:</p>
                <div className="flex flex-wrap gap-2">
                  {BEISPIELE.map((b) => (
                    <button key={b} type="button" onClick={() => void senden(b)} className="rounded-full border border-sand-300 px-3.5 py-2 text-sm font-semibold hover:border-akzent-500">
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {verlauf.map((n, i) => (
              <div key={i} className={`flex ${n.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed whitespace-pre-line ${
                    n.role === 'user' ? 'rounded-br-md bg-erde-900 text-kalk-50' : 'rounded-bl-md bg-kalk-100 text-erde-900'
                  }`}
                >
                  {n.content}
                </p>
              </div>
            ))}
            {laedt && <p className="w-fit animate-pulse rounded-2xl rounded-bl-md bg-kalk-100 px-4 py-2.5 text-erde-500">Antwort wird formuliert …</p>}
            {fehler && <p className="rounded-xl bg-akzent-50 px-4 py-2.5 text-sm text-akzent-700">{fehler}</p>}
            <div ref={endeRef} />
          </div>
          <form onSubmit={absenden} className="flex gap-2 border-t border-sand-200 bg-kalk-50 p-3">
            <input
              value={eingabe}
              onChange={(e) => setEingabe(e.target.value)}
              maxLength={2000}
              placeholder="Ihre Frage …"
              className="eingabe !rounded-full"
              aria-label="Ihre Frage"
            />
            <button type="submit" className="btn-primaer !px-4" disabled={laedt || !eingabe.trim()} aria-label="Senden">
              <IconPfeil className="h-5 w-5" />
            </button>
          </form>
        </section>
      )}

      <Kontakt />
    </div>
  );
}
