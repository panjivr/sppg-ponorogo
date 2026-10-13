import { sameOrigin } from "@/lib/server/origin";
import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/session';
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });
  response.headers.set('Clear-Site-Data', '"cache"');
  return response;
}
