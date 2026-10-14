import { randomBytes } from 'node:crypto';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
const target = new URL('../lib/server/session-secret.generated.ts', import.meta.url);
mkdirSync(new URL('../lib/server/', import.meta.url), { recursive: true });
if (!process.argv.includes('--reuse') || !existsSync(target)) {
  writeFileSync(target, `// Generated private build key. Never commit or import from client code.\nimport 'server-only';\nexport const BUILD_SESSION_SECRET = ${JSON.stringify(randomBytes(48).toString('base64url'))};\n`, { mode: 0o600 });
}
console.log('Private session signing key prepared (value not logged).');
