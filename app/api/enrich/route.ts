import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { profiles, lushaApiKey: clientKey } = await req.json();

  // Prefer server-side env var, fall back to client-provided key
  const lushaApiKey = process.env.LUSHA_API_KEY || clientKey;

  if (!lushaApiKey) {
    return NextResponse.json({ error: 'No Lusha API key provided. Add one in Setup or set LUSHA_API_KEY env var.' }, { status: 400 });
  }

  const results = await Promise.all(
    (profiles as Record<string, string>[]).map(async (profile) => {
      try {
        const url = new URL('https://api.lusha.com/v2/person');
        url.searchParams.set('firstName', profile.firstName || '');
        url.searchParams.set('lastName', profile.lastName || '');
        url.searchParams.set('company', profile.company || '');
        if (profile.linkedinUrl) url.searchParams.set('linkedinUrl', profile.linkedinUrl);

        const res = await fetch(url.toString(), {
          headers: { 'api_key': `Bearer ${lushaApiKey}` },
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          console.error(`Lusha error for ${profile.firstName} ${profile.lastName}: ${res.status} ${errText}`);
          return { id: profile.id, email: null, phone: null, status: 'failed', lushaError: `${res.status}: ${errText.slice(0, 200)}` };
        }

        const data = await res.json() as {
          emailAddresses?: { email: string }[];
          email?: string;
          phoneNumbers?: { phoneNumber: string }[];
          phone?: string;
        };

        const email = data?.emailAddresses?.[0]?.email || data?.email || null;
        const phone = data?.phoneNumbers?.[0]?.phoneNumber || data?.phone || null;

        return { id: profile.id, email, phone, status: 'success' };
      } catch {
        return { id: profile.id, email: null, phone: null, status: 'failed' };
      }
    })
  );

  return NextResponse.json({ results });
}
