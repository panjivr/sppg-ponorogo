import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/session';
import { SPPG_SEED } from '@/lib/server/sppg';
export const dynamic = 'force-dynamic';
export async function GET() {
  const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };
  if (!await verifySession(cookies().get(SESSION_COOKIE)?.value)) return NextResponse.json({ error: 'Autentikasi diperlukan.' }, { status: 401, headers });
  return NextResponse.json(SPPG_SEED, { headers });
}
