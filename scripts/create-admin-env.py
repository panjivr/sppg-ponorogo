"""Create private admin configuration without printing credentials."""
import getpass, hashlib, os, secrets
from pathlib import Path
password = getpass.getpass('Kata sandi admin baru (minimal 16 karakter): ')
if len(password) < 16 or password == 'sppg-admin': raise SystemExit('Gunakan kata sandi baru minimal 16 karakter.')
if password != getpass.getpass('Ulangi kata sandi: '): raise SystemExit('Kata sandi berbeda.')
salt = secrets.token_hex(16)
hash_value = hashlib.scrypt(password.encode(), salt=salt.encode(), n=16384, r=8, p=1, dklen=64).hex()
target = Path('.env.admin.local')
fd = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
with os.fdopen(fd, 'w') as output:
    output.write(f'ADMIN_PASSWORD_HASH={salt}:{hash_value}\nADMIN_SESSION_SECRET={secrets.token_urlsafe(48)}\n')
print('Konfigurasi dibuat di .env.admin.local (diabaikan Git). Simpan nilainya lewat Vercel Environment Variables, bukan chat atau repository.')
