import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/session';
export async function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = `default-src 'self'; script-src 'self' 'nonce-${nonce}'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.tile.openstreetmap.org; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';${process.env.NODE_ENV === 'production' ? ' upgrade-insecure-requests;' : ''}`;
  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  headers.set('Content-Security-Policy', csp);
  const privateRoute = /^\/(admin|dashboard|blast|direktori|peta|ringkasan|tentang)(\/|$)/.test(request.nextUrl.pathname);
  let response: NextResponse;
  if (privateRoute && !await verifySession(request.cookies.get(SESSION_COOKIE)?.value)) {
    const url = new URL('/login', request.url);
    url.searchParams.set('next', request.nextUrl.pathname);
    response = NextResponse.redirect(url);
  } else response = NextResponse.next({ request: { headers } });
  response.headers.set('Content-Security-Policy', csp);
  if (privateRoute || request.nextUrl.pathname.startsWith('/api/') || request.nextUrl.pathname === '/login') {
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.svg|fonts/|produk/).*)'] };
