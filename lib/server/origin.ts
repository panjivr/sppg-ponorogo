import 'server-only';
import type { NextRequest } from 'next/server';
export function sameOrigin(request: NextRequest) {
  try {
    const origin = new URL(request.headers.get('origin') || '');
    return origin.host === request.headers.get('host') && origin.protocol === request.nextUrl.protocol;
  } catch { return false; }
}
