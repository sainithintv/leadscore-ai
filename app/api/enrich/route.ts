import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { profiles, lushaApiKey: clientKey } = await req.json();

  const lushaApiKey = process.env.LUSHA_API_KEY || clientKey;

  if (!lushaApiKey) {
    return NextResponse.json(
      { error: 'No Lusha API key provided. Set LUSHA_API_KEY in Vercel environment variables.' },
      { status: 400 }
    );
  }

  // V3 API: batch up to 100 contacts per request
  const contacts = (profiles as Record<string, string>[]).map((p) => ({
    clientReferenceId: p.id,
    firstName: p.firstName || '',
    lastName: p.lastName || '',
    companyName: p.company || '',
    ...(p.linkedinUrl ? { linkedinUrl: p.linkedinUrl } : {}),
  }));

  try {
    const res = await fetch('https://api.lusha.com/v3/contacts/search-and-enrich', {
      method: 'POST',
      headers: {
        'api_key': lushaApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contacts,
        reveal: ['emails', 'phones'],
      }),
    });

    const text = await res.text();

    if (!res.ok) {
      console.error(`Lusha v3 error: ${res.status} ${text}`);
      // Return failed for all profiles rather than crashing
      return NextResponse.json({
        results: profiles.map((p: Record<string, string>) => ({
          id: p.id,
          email: null,
          phone: null,
          status: 'failed',
        })),
      });
    }

    const data = JSON.parse(text) as {
      results: {
        clientReferenceId?: string;
        emails?: { email: string }[];
        phones?: { number: string }[];
        error?: { code: string; message: string };
      }[];
    };

    const results = data.results.map((r) => ({
      id: r.clientReferenceId,
      email: r.emails?.[0]?.email || null,
      phone: r.phones?.[0]?.number || null,
      status: r.error ? 'failed' : r.emails?.length || r.phones?.length ? 'success' : 'failed',
    }));

    return NextResponse.json({ results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
