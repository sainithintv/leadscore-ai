import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  const { profiles, persona, apiKey: clientApiKey, model } = await req.json();

  // Default model is mistral; prefer server-side env vars, fall back to client-provided key
  const resolvedModel = model || 'mistral';
  const apiKey = resolvedModel === 'mistral'
    ? (process.env.MISTRAL_API_KEY || clientApiKey)
    : (process.env.OPENAI_API_KEY || clientApiKey);

  if (!apiKey) {
    return NextResponse.json({ error: 'No API key provided. Add one in Setup or set OPENAI_API_KEY / MISTRAL_API_KEY env var.' }, { status: 400 });
  }

  const systemPrompt = `You are a B2B sales intelligence AI. Score LinkedIn profiles against an ideal customer persona.
Persona: ${persona.name}
Description: ${persona.description}
Target Titles: ${persona.targetTitles}
Target Industries: ${persona.targetIndustries}
Min Seniority: ${persona.minSeniority}

For each profile, return a score 0-100 and a tier:
- Hot (75-100): Strong match
- Warm (40-74): Partial match
- Cold (0-39): Poor match

Also provide 1-2 sentence reasoning.`;

  // Skip internal/UI-only fields and empty values — send everything else to the AI
  const SKIP_FIELDS = new Set(['id', 'enrichmentStatus', 'score', 'tier', 'reasoning', 'email', 'phone']);
  const profilesText = (profiles as Record<string, string>[]).map((p, i) => {
    const name = p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || `Profile ${i}`;
    const fields = Object.entries(p)
      .filter(([k, v]) => !SKIP_FIELDS.has(k) && v && String(v).trim() && !['firstName','lastName','fullName','id'].includes(k))
      .map(([k, v]) => {
        const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
        const val = String(v).slice(0, 300); // truncate long fields
        return `${label}: ${val}`;
      });
    return `[${i}] ${name}\n  ${fields.join('\n  ')}`;
  }).join('\n\n');

  try {
    let content = '';

    if (resolvedModel === 'mistral') {
      const { Mistral } = await import('@mistralai/mistralai');
      const client = new Mistral({ apiKey });
      const response = await client.chat.complete({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Score these profiles and return a JSON array:\n${profilesText}\n\nReturn ONLY a JSON array like: [{"index":0,"score":85,"tier":"hot","reasoning":"..."}]` },
        ],
      });
      content = (response.choices?.[0]?.message?.content as string) || '[]';
    } else {
      const client = new OpenAI({ apiKey });
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Score these profiles and return a JSON array:\n${profilesText}\n\nReturn ONLY a JSON array like: [{"index":0,"score":85,"tier":"hot","reasoning":"..."}]` },
        ],
        response_format: { type: 'json_object' },
      });
      content = response.choices[0].message.content || '{}';
    }

    let scores;
    try {
      const parsed = JSON.parse(content);
      scores = Array.isArray(parsed) ? parsed : (parsed.profiles || parsed.scores || parsed.results || Object.values(parsed)[0] || []);
    } catch {
      scores = [];
    }

    return NextResponse.json({ scores });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
