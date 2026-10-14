"""Update the server-only password verifier without printing credentials."""
import getpass, hashlib, os, secrets
from pathlib import Path
password = getpass.getpass('Kata sandi admin baru (minimal 8 karakter): ')
if len(password) < 8 or password == 'sppg-admin': raise SystemExit('Gunakan kata sandi baru minimal 8 karakter.')
if password != getpass.getpass('Ulangi kata sandi: '): raise SystemExit('Kata sandi berbeda.')
salt = secrets.token_hex(16)
hash_value = hashlib.scrypt(password.encode(), salt=salt.encode(), n=16384, r=8, p=1, dklen=64).hex()
target = Path('lib/server/admin-config.ts')
import json
target.write_text("import 'server-only';\n/** Server-side password verifier; plaintext password is never stored here. */\nexport const ADMIN_PASSWORD_HASH = " + json.dumps(salt + ':' + hash_value) + ";\n")
print('Hash password server diperbarui. Commit perubahan, lalu deploy. Kunci sesi otomatis berubah saat build; tidak perlu Environment Variables Vercel.')
