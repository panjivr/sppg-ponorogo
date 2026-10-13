import { sameOrigin } from "@/lib/server/origin";
import { NextRequest, NextResponse } from 'next/server';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import { createSession, SESSION_COOKIE } from '@/lib/session';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const attempts = new Map<string, { count: number; until: number }>();
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const now = Date.now();
  for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
  const attempt = attempts.get(ip) || { count: 0, until: now + 900_000 };
  if (attempt.count >= 5 || attempts.size > 10_000) return new NextResponse(null, { status: 429, headers: { 'Retry-After': '900', 'Cache-Control': 'no-store' } });
  attempt.count++; attempts.set(ip, attempt);
  const configured = process.env.ADMIN_PASSWORD_HASH;
  if (!configured || !process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET.length < 32) return NextResponse.json({ error: 'Akses admin belum dikonfigurasi.' }, { status: 503 });
  if (Number(request.headers.get('content-length') || 0) > 2048) return new NextResponse(null, { status: 413 });
  let password: unknown;
  try { password = (await request.json()).password; } catch { return new NextResponse(null, { status: 400 }); }
  if (typeof password !== 'string' || password.length > 256) return new NextResponse(null, { status: 400 });
  const [salt, hash] = configured.split(':');
  if (!/^[a-f0-9]{32}$/.test(salt || '') || !/^[a-f0-9]{128}$/.test(hash || '')) return new NextResponse(null, { status: 503 });
  const actual = scryptSync(password, salt, 64);
  if (!timingSafeEqual(actual, Buffer.from(hash, 'hex'))) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return NextResponse.json({ error: 'Kata sandi tidak sesuai.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
  const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  response.cookies.set(SESSION_COOKIE, await createSession(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 3600 });
  return response;
}
