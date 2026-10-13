export const SESSION_COOKIE = 'bp_admin_session';
const encoder = new TextEncoder();
async function key() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
export async function createSession() {
  const k = await key();
  if (!k) throw new Error('Admin authentication unavailable');
  const payload = `${Math.floor(Date.now() / 1000) + 3600}:${crypto.randomUUID()}`;
  const signature = await crypto.subtle.sign('HMAC', k, encoder.encode(payload));
  return `${payload}.${Array.from(new Uint8Array(signature), b => b.toString(16).padStart(2, '0')).join('')}`;
}
export async function verifySession(token?: string) {
  const k = await key();
  if (!k || !token || token.length > 200) return false;
  const [payload, signature, extra] = token.split('.');
  if (extra || !signature || !/^[a-f0-9]{64}$/.test(signature)) return false;
  const expiry = Number(payload.split(':')[0]);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isInteger(expiry) || expiry <= now || expiry > now + 3600) return false;
  return crypto.subtle.verify('HMAC', k, Uint8Array.from(signature.match(/../g)!, b => parseInt(b, 16)), encoder.encode(payload));
}
