import { useEffect } from 'react';
import { Layout, type Bereich } from './components/Layout';
import { useRoute } from './lib/route';
import { Chat } from './pages/Chat';
import { Faq } from './pages/Faq';
import { Finder } from './pages/Finder';
import { ProduktDetail, Produkte } from './pages/Produkte';
import { Rechner } from './pages/Rechner';
import { Start } from './pages/Start';

const TITEL: Record<Bereich, string> = {
  start: 'Naturkalk Produktfinder',
  finder: 'Produktfinder',
  rechner: 'Mengenrechner',
  faq: 'FAQ & Fragen',
  produkte: 'Produkte',
  chat: 'Chat',
};

export function App() {
  const route = useRoute();
  const [seite, unterseite] = route.pfad;
  const bereich: Bereich = (['finder', 'rechner', 'faq', 'produkte', 'chat'] as const).find((b) => b === seite) ?? 'start';

  useEffect(() => {
    document.title = `${TITEL[bereich]} – Hessler Kalkwerke (Demo)`;
  }, [bereich]);

  let inhalt;
  switch (bereich) {
    case 'finder':
      inhalt = <Finder route={route} />;
      break;
    case 'rechner':
      inhalt = <Rechner route={route} />;
      break;
    case 'faq':
      inhalt = <Faq route={route} />;
      break;
    case 'produkte':
      inhalt = unterseite ? <ProduktDetail id={unterseite} /> : <Produkte />;
      break;
    case 'chat':
      inhalt = <Chat />;
      break;
    default:
      inhalt = <Start />;
  }
  return <Layout aktiv={bereich}>{inhalt}</Layout>;
}
