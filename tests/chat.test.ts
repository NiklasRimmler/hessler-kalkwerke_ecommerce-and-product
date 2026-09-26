import { afterEach, describe, expect, it } from 'vitest';
import { handleChat } from '../server/chat';

const post = (body: unknown) => new Request('http://x/api/chat', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });
const alterKey = process.env.ANTHROPIC_API_KEY;

afterEach(() => {
  if (alterKey === undefined) delete process.env.ANTHROPIC_API_KEY;
  else process.env.ANTHROPIC_API_KEY = alterKey;
});

describe('Chat-Endpunkt', () => {
  it('ohne ANTHROPIC_API_KEY: deaktiviert, App funktioniert weiter', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    expect(await (await handleChat(new Request('http://x/api/chat'))).json()).toEqual({ enabled: false });
    const r = await handleChat(post({ messages: [{ role: 'user', content: 'Hallo' }] }));
    expect(r.status).toBe(503);
  });

  it('lehnt ungültige Anfragen ab, bevor die API aufgerufen wird', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    expect((await handleChat(post({}))).status).toBe(400);
    expect((await handleChat(post({ messages: [{ role: 'assistant', content: 'x' }] }))).status).toBe(400);
    expect((await handleChat(new Request('http://x/api/chat', { method: 'DELETE' }))).status).toBe(405);
  });
});
