import Anthropic from '@anthropic-ai/sdk';
import produkteJson from '../data/produkte.json' with { type: 'json' };
import aufbautenJson from '../data/aufbauten.json' with { type: 'json' };
import faqJson from '../data/faq.json' with { type: 'json' };
import quelltexte from '../data/quelltexte.json' with { type: 'json' };

/**
 * Optionaler Chat-Modus: beantwortet Fragen ausschließlich auf Basis der strukturierten
 * Daten und der Quelltexte. Der API-Key wird nur serverseitig aus ANTHROPIC_API_KEY gelesen.
 * Ohne Key antwortet GET mit { enabled: false } und die App deaktiviert den Chat-Tab.
 */

const MODEL = process.env.CHAT_MODEL || 'claude-opus-5';
const MAX_NACHRICHTEN = 12;
const MAX_ZEICHEN = 2000;

// Kompakte Sicht auf die Aufbauten (die Volltexte stecken bereits in den Quelltexten).
const aufbautenKompakt = aufbautenJson.aufbauten.map((a) => ({
  id: a.id,
  titel: a.titel,
  bereich: a.bereich,
  untergruende: a.untergruende,
  schichten: a.schichten.map((s) => ({
    funktion: s.funktion,
    produkt: s.produkt_id,
    alternativen: s.alternativen,
    optional: s.optional ? s.optional_label : false,
    ersatz: s.ersatz.map((e) => ({ wenn: e.bedingung.frage, produkt: e.produkt_id })),
    hinweis: s.hinweis,
  })),
  hinweise: a.hinweise,
  annahmen: a.annahmen,
}));

const SYSTEM = `Sie sind der digitale Beratungsassistent einer Demo-Webseite der Hessler Kalkwerke (Naturkalk-Putze). Sie beantworten Fragen von Endkunden und Handwerkern auf Deutsch in der Sie-Form, sachlich, freundlich und knapp (höchstens etwa 150 Wörter, gerne mit kurzer Aufzählung).

Regeln:
- Antworten Sie ausschließlich auf Grundlage der unten stehenden Daten und Quelltexte. Nutzen Sie kein allgemeines Fachwissen und erfinden Sie keine technischen Werte, Produkte oder Verbräuche.
- Steht etwas nicht in den Daten (z. B. Verbrauch anderer Produkte als HP 14), sagen Sie das offen und verweisen Sie an die Beratung: info@hessler-kalkwerk.de oder 06222/9275-0 (gerne mit Fotos des Untergrunds per E-Mail).
- Bei Unsicherheit, Mischuntergründen, Schäden, Feuchte-Problemen oder Dickschichtaufbauten über 10 mm verweisen Sie ebenfalls an die Beratung.
- Geben Sie keine Garantien, Haftungs- oder Gewährleistungszusagen. Die Angaben berücksichtigen nicht den Einzelfall.
- Beantworten Sie nur Fragen zu Putzaufbauten, Untergründen und den Produkten. Andere Themen lehnen Sie höflich ab.
- Weisen Sie bei passenden Fragen auf den Produktfinder und den Mengenrechner dieser Seite hin.

<produkte>
${JSON.stringify(produkteJson.produkte)}
</produkte>

<aufbauten>
${JSON.stringify(aufbautenKompakt)}
</aufbauten>

<faq>
${JSON.stringify(faqJson.faq.map((f) => ({ frage: f.frage, antwort: f.antwort })))}
</faq>

<quelle name="KD_Aufbauempfehlungen_Online.docx">
${quelltexte.aufbauempfehlungen}
</quelle>

<quelle name="HP 14 Kalkhaftputz.pdf">
${quelltexte.merkblatt_hp14}
</quelle>`;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
}

interface ChatNachricht {
  role: 'user' | 'assistant';
  content: string;
}

function validiere(body: unknown): ChatNachricht[] | null {
  if (!body || typeof body !== 'object' || !Array.isArray((body as { messages?: unknown }).messages)) return null;
  const msgs = (body as { messages: unknown[] }).messages
    .filter(
      (m): m is ChatNachricht =>
        !!m &&
        typeof m === 'object' &&
        ((m as ChatNachricht).role === 'user' || (m as ChatNachricht).role === 'assistant') &&
        typeof (m as ChatNachricht).content === 'string' &&
        (m as ChatNachricht).content.trim().length > 0,
    )
    .slice(-MAX_NACHRICHTEN)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_ZEICHEN) }));
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return null;
  return msgs;
}

export async function handleChat(request: Request): Promise<Response> {
  const enabled = Boolean(process.env.ANTHROPIC_API_KEY);
  if (request.method === 'GET') return json({ enabled });
  if (request.method !== 'POST') return json({ error: 'Methode nicht erlaubt' }, 405);
  if (!enabled) return json({ error: 'Der Chat ist in dieser Demo deaktiviert.' }, 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Ungültige Anfrage' }, 400);
  }
  const messages = validiere(body);
  if (!messages) return json({ error: 'Ungültige Anfrage' }, 400);

  const client = new Anthropic();
  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 2000,
      // Server-seitiger Fallback bei Ablehnung durch Sicherheitsklassifikatoren
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      thinking: { type: 'adaptive' },
      output_config: { effort: 'low' },
      // System-Prompt (Daten + Quelltexte) ist stabil → wird gecacht
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages,
    });

    if (response.stop_reason === 'refusal') {
      return json({ antwort: 'Dazu kann ich leider keine Auskunft geben. Bitte wenden Sie sich an info@hessler-kalkwerk.de oder 06222/9275-0.' });
    }
    const antwort = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    return json({ antwort: antwort || 'Dazu liegen mir keine Angaben vor. Bitte wenden Sie sich an info@hessler-kalkwerk.de oder 06222/9275-0.' });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return json({ error: 'Gerade sind zu viele Anfragen. Bitte versuchen Sie es gleich noch einmal.' }, 429);
    if (error instanceof Anthropic.AuthenticationError) return json({ error: 'Der Chat ist nicht korrekt konfiguriert.' }, 503);
    if (error instanceof Anthropic.APIError) {
      console.error('Chat-Fehler', error.status, error.message);
      return json({ error: 'Der Chat ist gerade nicht erreichbar.' }, 502);
    }
    console.error('Chat-Fehler', error);
    return json({ error: 'Der Chat ist gerade nicht erreichbar.' }, 500);
  }
}
