import { useEffect, useState } from 'react';
import type { Antworten } from './types';

/** Hash-Routing: #/seite/unterseite?param=wert – funktioniert auf jedem statischen Hosting und ist teilbar. */
export interface Route {
  pfad: string[];
  params: URLSearchParams;
}

export function parseHash(hash: string): Route {
  const roh = hash.replace(/^#/, '');
  const [pfadTeil, query = ''] = roh.split('?');
  return { pfad: pfadTeil.split('/').filter(Boolean), params: new URLSearchParams(query) };
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export function href(pfad: string, params?: Record<string, string | undefined | null>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) if (v) q.set(k, v);
  const qs = q.toString();
  return `#/${pfad}${qs ? `?${qs}` : ''}`;
}

export function navigiere(ziel: string) {
  if (window.location.hash !== ziel) window.location.hash = ziel;
  window.scrollTo({ top: 0 });
}

// Zusatzfragen-Antworten kompakt in der URL: z=rissrisiko,farbanstrich (ja) · n=schaloel (nein)
export function antwortenAusParams(params: URLSearchParams): Antworten {
  const a: Antworten = {};
  for (const id of (params.get('z') ?? '').split(',').filter(Boolean)) a[id] = true;
  for (const id of (params.get('n') ?? '').split(',').filter(Boolean)) a[id] = false;
  return a;
}

export function antwortenParams(a: Antworten): { z?: string; n?: string } {
  const ja = Object.keys(a).filter((k) => a[k]);
  const nein = Object.keys(a).filter((k) => a[k] === false);
  return { z: ja.join(',') || undefined, n: nein.join(',') || undefined };
}

export function absoluteUrl(hashHref: string): string {
  return `${window.location.origin}${window.location.pathname}${hashHref}`;
}
