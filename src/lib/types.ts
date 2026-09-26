export type Kategorie =
  | 'Vorbehandlung'
  | 'Grundierung'
  | 'Haftputz/Spachtel'
  | 'Grundputz'
  | 'Oberputz'
  | 'Anstrich'
  | 'Zubehör';

export type Bindemittel = 'naturkalk' | 'kalk' | 'kalk-zement' | 'zementhaltig' | 'fremdprodukt' | null;

export interface Ergiebigkeit {
  m2_pro_sack: number;
  bei_schichtdicke_mm: number;
  text: string;
}

export interface Produkt {
  id: string;
  name: string;
  kurzname: string;
  kategorie: Kategorie;
  bindemittel: Bindemittel;
  hersteller: string | null;
  innen: boolean | null;
  aussen: boolean | null;
  beschreibung: string;
  verbrauch_kg_m2_mm: number | null;
  verbrauch_hinweis?: string;
  sackgroesse_kg: number | null;
  wasser_l_pro_sack: number | null;
  nassmoertel_l_pro_sack?: number | null;
  ergiebigkeit?: Ergiebigkeit;
  min_schichtdicke_mm: number | null;
  max_schichtdicke_mm: number | null;
  schichtdicke_hinweis?: string;
  gewebespachtelung_schichtdicke_mm?: number;
  zahnspachtelung?: string;
  trocknung_tage_pro_mm: number | null;
  trocknung_text: string | null;
  sack_pro_palette: number | null;
  palettengewicht_kg?: number;
  hinweise: string[];
  datenblatt_vorhanden: boolean;
  quelle: string;
  // nur HP 14 (Merkblatt)
  zusammensetzung?: string;
  koernung_mm?: number;
  koernung_aussen_mm?: number;
  moertelgruppe?: string;
  diffusionswiderstand_mu?: number;
  anwendung?: string;
  untergrund?: string;
  verarbeitung?: string;
  lagerung?: string;
  qualitaetsueberwachung?: string;
  sicherheitshinweise?: string;
}

export interface Bedingung {
  frage: string;
  wert: boolean;
}

export interface Ersatz {
  bedingung: Bedingung;
  produkt_id: string;
  begruendung: string;
}

export interface Schicht {
  funktion: string;
  technik: string | null;
  produkt_id: string;
  alternativen: string[];
  optional: boolean;
  optional_label: string | null;
  bedingung: Bedingung | null;
  ersatz: Ersatz[];
  zubehoer: string[];
  schichtdicke_mm: number | null;
  begruendung: string;
  hinweis: string | null;
  annahme: string | null;
}

export type Bereich = 'innen' | 'aussen' | 'sockel' | 'keller';

export interface Aufbau {
  id: string;
  titel: string;
  bereich: Bereich;
  untergruende: string[];
  quelle_abschnitt: string;
  schichten: Schicht[];
  beschreibungstext: string;
  hinweise: string[];
  annahmen: string[];
  zusatzfragen: string[];
}

export type BeratungsGrund = 'sonstiges' | 'unsicher' | 'offen';

export type Ziel =
  | { typ: 'knoten'; id: string }
  | { typ: 'aufbau'; id: string }
  | { typ: 'beratung'; grund: BeratungsGrund; hinweis?: string };

export interface Option {
  id: string;
  label: string;
  ziel: Ziel;
  icon?: string;
  annahme?: string;
}

export interface Knoten {
  id: string;
  schritt: number;
  bereich?: Bereich;
  frage: string;
  hilfetext?: string;
  optionen: Option[];
}

export interface Zusatzfrage {
  id: string;
  frage: string;
  hilfetext: string;
  standard: boolean;
}

export interface Entscheidungsbaum {
  start: string;
  knoten: Knoten[];
  zusatzfragen: Zusatzfrage[];
  beratung: Record<BeratungsGrund, { titel: string; text: string }>;
  kontakt: { email: string; telefon: string; text: string };
}

export interface FaqEintrag {
  id: string;
  frage: string;
  antwort: string;
  quelle: string[];
  produkte: string[];
  tags: string[];
}

export type Antworten = Record<string, boolean>;
