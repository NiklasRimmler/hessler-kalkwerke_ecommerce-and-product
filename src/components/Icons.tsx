import type { ReactNode, SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: P & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export const IconInnen = (p: P) => (
  <Svg {...p}>
    <path d="M6 22 24 8l18 14" />
    <path d="M10 19v21h28V19" />
    <path d="M15 40v-9a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9" />
    <path d="M13 34h22" />
  </Svg>
);

export const IconAussen = (p: P) => (
  <Svg {...p}>
    <circle cx="38" cy="10" r="4" />
    <path d="M4 24 20 11l16 13" />
    <path d="M8 21v19h24V21" />
    <path d="M17 40v-9h6v9" />
    <path d="M40 40V24M36 29l4-5 4 5" />
    <path d="M2 40h44" />
  </Svg>
);

export const IconSockel = (p: P) => (
  <Svg {...p}>
    <path d="M8 6h32v26H8z" />
    <path d="M6 32h36v8H6z" fill="currentColor" fillOpacity={0.18} />
    <path d="M14 36h4M24 36h4M34 36h2" />
    <path d="M2 42h44" />
  </Svg>
);

export const IconKeller = (p: P) => (
  <Svg {...p}>
    <path d="M4 14h40" />
    <path d="M8 14v28h32V14" />
    <path d="M8 24h8v6h8v6h8" />
    <path d="M32 20c0 0 4 4.5 4 7a4 4 0 0 1-8 0c0-2.5 4-7 4-7z" />
  </Svg>
);

export const IconMauerwerk = (p: P) => (
  <Svg {...p}>
    <rect x="6" y="8" width="36" height="32" rx="1" />
    <path d="M6 16h36M6 24h36M6 32h36" />
    <path d="M18 8v8M30 8v8M12 16v8M24 16v8M36 16v8M18 24v8M30 24v8M12 32v8M24 32v8M36 32v8" />
  </Svg>
);

export const IconPlatten = (p: P) => (
  <Svg {...p}>
    <path d="M8 8h14v32H8zM26 8h14v32H26z" />
    <path d="M12 14h6M30 14h6" />
  </Svg>
);

export const IconBeton = (p: P) => (
  <Svg {...p}>
    <path d="M6 14 24 6l18 8v20l-18 8-18-8z" />
    <path d="M6 14l18 8 18-8M24 22v20" />
    <circle cx="14" cy="26" r="1" fill="currentColor" />
    <circle cx="32" cy="30" r="1" fill="currentColor" />
    <circle cx="35" cy="22" r="1" fill="currentColor" />
  </Svg>
);

export const IconPutz = (p: P) => (
  <Svg {...p}>
    <path d="M8 30h24l6-6H14z" />
    <path d="M26 24v-8a4 4 0 0 1 4-4h4" />
    <path d="M6 38c6-2 10 2 16 0s10-2 16 0" />
  </Svg>
);

export const IconStroh = (p: P) => (
  <Svg {...p}>
    <rect x="6" y="14" width="36" height="22" rx="3" />
    <path d="M10 18l4 14M16 18l4 14M22 18l4 14M28 18l4 14M34 18l4 14" />
  </Svg>
);

export const IconFrage = (p: P) => (
  <Svg {...p}>
    <circle cx="24" cy="24" r="18" />
    <path d="M18.5 18a5.5 5.5 0 1 1 7.5 5.1c-1.3.6-2 1.6-2 2.9v1.5" />
    <circle cx="24" cy="34" r="1.2" fill="currentColor" />
  </Svg>
);

export const IconKamera = (p: P) => (
  <Svg {...p}>
    <path d="M6 16h8l3-5h14l3 5h8v22H6z" />
    <circle cx="24" cy="26" r="7" />
  </Svg>
);

export const IconZurueck = (p: P) => (
  <Svg viewBox="0 0 24 24" {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
);

export const IconPfeil = (p: P) => (
  <Svg viewBox="0 0 24 24" {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const IconNeu = (p: P) => (
  <Svg viewBox="0 0 24 24" {...p}>
    <path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.5" />
    <path d="M4 4v4.5h4.5" />
  </Svg>
);

export const IconTeilen = (p: P) => (
  <Svg viewBox="0 0 24 24" {...p}>
    <circle cx="18" cy="5" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="19" r="2.5" />
    <path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
  </Svg>
);

export const IconRechner = (p: P) => (
  <Svg viewBox="0 0 24 24" {...p}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M8 7h8M8 11h2M12 11h2M16 11v6M8 14h2M12 14h2M8 17h2M12 17h2" />
  </Svg>
);

export const IconDrucken = (p: P) => (
  <Svg viewBox="0 0 24 24" {...p}>
    <path d="M7 9V3h10v6" />
    <rect x="3" y="9" width="18" height="8" rx="2" />
    <path d="M7 14h10v7H7z" />
  </Svg>
);

export const IconMail = (p: P) => (
  <Svg viewBox="0 0 24 24" {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </Svg>
);

export const IconTelefon = (p: P) => (
  <Svg viewBox="0 0 24 24" {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </Svg>
);

export const IconInfo = (p: P) => (
  <Svg viewBox="0 0 24 24" {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v6" />
    <circle cx="12" cy="7.5" r="0.8" fill="currentColor" />
  </Svg>
);

export const IconWarnung = (p: P) => (
  <Svg viewBox="0 0 24 24" {...p}>
    <path d="M12 3 2 20h20z" />
    <path d="M12 10v4" />
    <circle cx="12" cy="17" r="0.8" fill="currentColor" />
  </Svg>
);

export const IconSuche = (p: P) => (
  <Svg viewBox="0 0 24 24" {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.3-4.3" />
  </Svg>
);

export const IconFinder = (p: P) => (
  <Svg viewBox="0 0 24 24" {...p}>
    <path d="M3 18h18M3 14h18M3 10h18" />
    <path d="M3 6h18" strokeOpacity={0.4} />
  </Svg>
);

export const IconBuch = (p: P) => (
  <Svg viewBox="0 0 24 24" {...p}>
    <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
    <path d="M4 19V5M8 7h7" />
  </Svg>
);

export const IconSack = (p: P) => (
  <Svg viewBox="0 0 24 24" {...p}>
    <path d="M7 4h10l-1 3 2 3v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-9l2-3z" />
    <path d="M9 13h6" />
  </Svg>
);

export const IconChat = (p: P) => (
  <Svg viewBox="0 0 24 24" {...p}>
    <path d="M4 5h16v11H9l-5 4z" />
    <path d="M8 9h8M8 12h5" />
  </Svg>
);

export const IconHaken = (p: P) => (
  <Svg viewBox="0 0 24 24" {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);

export const IconKopieren = (p: P) => (
  <Svg viewBox="0 0 24 24" {...p}>
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
  </Svg>
);

const OPTION_ICONS: Record<string, (p: P) => ReturnType<typeof IconInnen>> = {
  innen: IconInnen,
  aussen: IconAussen,
  sockel: IconSockel,
  keller: IconKeller,
  mauerwerk: IconMauerwerk,
  platten: IconPlatten,
  beton: IconBeton,
  putz: IconPutz,
  stroh: IconStroh,
  fragezeichen: IconFrage,
  kamera: IconKamera,
};

export function OptionIcon({ name, ...p }: P & { name?: string }) {
  const I = (name && OPTION_ICONS[name]) || null;
  return I ? <I {...p} /> : null;
}
