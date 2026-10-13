"""Production HTTP/browser security checks. Run after npm run build."""
import re, hmac, hashlib, json, os, secrets, subprocess, time, urllib.request, urllib.error
from pathlib import Path
from http.cookies import SimpleCookie
ROOT = Path(__file__).resolve().parents[1]
PORT = 3012
BASE = f'http://127.0.0.1:{PORT}'
password = secrets.token_urlsafe(30)
salt = secrets.token_hex(16)
hash_value = hashlib.scrypt(password.encode(), salt=salt.encode(), n=16384, r=8, p=1, dklen=64).hex()
env = {**os.environ, 'ADMIN_PASSWORD_HASH': salt + ':' + hash_value, 'ADMIN_SESSION_SECRET': secrets.token_urlsafe(48), 'NEXT_TELEMETRY_DISABLED': '1'}
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs): return None
opener = urllib.request.build_opener(NoRedirect())
def request(path, body=None, cookie=None, origin=BASE):
    headers = {'Origin': origin, 'Content-Type': 'application/json'}
    if cookie: headers['Cookie'] = cookie
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode() if body is not None else None, headers=headers)
    try: response = opener.open(req)
    except urllib.error.HTTPError as error: response = error
    return response.code, response.headers, response.read()
process = subprocess.Popen(['node', 'node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', str(PORT)], cwd=ROOT, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    for _ in range(100):
        try:
            if request('/')[0] == 200: break
        except OSError: pass
        time.sleep(.1)
    else: raise AssertionError('Production server failed to start')
    routes = ['/admin', '/dashboard', '/blast', '/direktori', '/peta', '/ringkasan', '/tentang', '/laporan']
    for route in routes:
        for suffix in ['', '?_rsc=probe']:
            status, headers, body = request(route + suffix)
            assert status == 307 and '/login' in headers['Location'], route
            assert 'no-store' in headers['Cache-Control']
    assert request('/api/admin/sppg')[0] == 401
    assert request('/api/admin/sppg', cookie='bp_admin_session=forged')[0] == 401
    assert request('/admin', cookie='bp_admin_session=forged; sppg-ponorogo:admin-auth=1')[0] == 307
    assert request('/api/auth/login', {'password': password}, origin='https://attacker.example')[0] == 403
    result = request('/api/auth/login', {'password': 'sppg-admin'}); assert result[0] == 401, (result[0], result[2][:200])
    status, headers, _ = request('/api/auth/login', {'password': password})
    assert status == 200
    cookie = headers['Set-Cookie'].split(';')[0]
    assert all(value in headers['Set-Cookie'].lower() for value in ['httponly', 'secure', 'samesite=strict'])
    status, api_headers, data = request('/api/admin/sppg', cookie=cookie)
    assert status == 200 and len(json.loads(data)) == 85
    assert 'Access-Control-Allow-Origin' not in api_headers and 'no-store' in api_headers['Cache-Control']
    for route in routes:
        status, headers, _ = request(route, cookie=cookie)
        assert status == 200 and 'no-store' in headers['Cache-Control'], route
    assert request('/admin', cookie=cookie[:-1] + ('0' if cookie[-1] != '0' else '1'))[0] == 307
    expired = str(int(time.time()) - 1) + ':' + secrets.token_hex(16)
    signed = hmac.new(env['ADMIN_SESSION_SECRET'].encode(), expired.encode(), hashlib.sha256).hexdigest()
    assert request('/admin', cookie='bp_admin_session=' + expired + '.' + signed)[0] == 307
    assert request('/api/auth/logout', {}, cookie=cookie, origin='https://attacker.example')[0] == 403
    status, headers, _ = request('/api/auth/logout', {}, cookie=cookie)
    assert status == 200 and 'Max-Age=0' in headers['Set-Cookie']
    for _ in range(3): request('/api/auth/login', {'password': 'incorrect'})
    assert request('/api/auth/login', {'password': 'incorrect'})[0] == 429
    assert request('/favicon.ico')[0] == 200
    from xml.etree import ElementTree as ET
    sitemap = ET.fromstring(request('/sitemap.xml')[2])
    urls = [e.text for e in sitemap.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    assert len(urls) == 64 and all(u.startswith('https://sppg-ponorogo-web.vercel.app') for u in urls)
    assert b'https://sppg-ponorogo-web.vercel.app/supplier/kubis' in request('/supplier/kubis')[2]
    robots = request('/robots.txt')[2].decode()
    assert all(route not in robots for route in routes)
    # No confidential seed values or previous hardcoded password in public JS.
    seed = json.loads((ROOT / 'data/sppg.json').read_text())
    pm = json.loads((ROOT / 'data/pm-kabupaten.json').read_text())
    forbidden = [row['nama'] for row in seed] + [row['nama'] for row in pm if len(row['nama']) > 15] + ['sppg-admin']
    for asset in (ROOT / '.next/static').rglob('*.js'):
        text = asset.read_text()
        assert not any(value in text for value in forbidden), f'Private data found in {asset}'
    from playwright.sync_api import sync_playwright, expect
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        page = browser.new_page(viewport={'width':375, 'height':812})
        errors=[]; page.on('pageerror', lambda error: errors.append(str(error)))
        for route in ['/', '/supplier', '/supplier/kubis', '/login']:
            response = page.goto(BASE + route)
            assert response.status == 200
            assert "frame-ancestors 'none'" in response.headers['content-security-policy']
            assert "'unsafe-inline'" not in response.headers['content-security-policy'].split('script-src')[1].split(';')[0]
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        page.goto(BASE + '/supplier')
        expect(page.locator('.product-card')).to_have_count(61)
        page.get_by_label('Cari bahan dapur', exact=True).fill('slada')
        expect(page.locator('.product-card')).to_have_count(1)
        assert not errors, errors
        page.evaluate("localStorage.setItem('sppg-ponorogo:sppg-override', JSON.stringify({}))")
        page.evaluate("localStorage.setItem('bumbu-pawon:request:v1', JSON.stringify({wortel:2}))")
        name, value = cookie.split('=', 1)
        page.context.add_cookies([{ 'name': name, 'value': value, 'url': BASE, 'httpOnly': True, 'secure': True, 'sameSite': 'Strict' }])
        page.goto(BASE + '/admin')
        expect(page.get_by_role('button', name='Keluar', exact=True)).to_be_visible()
        expect(page.get_by_text(seed[0]['nama'], exact=True).first).to_be_visible()
        assert page.evaluate("localStorage.getItem('sppg-ponorogo:sppg-override')") is None
        page.goto(BASE + '/laporan')
        expect(page.get_by_role('heading', name='Laporan Oktober & penerima manfaat', exact=True)).to_be_visible()
        expect(page.get_by_label('Tanggal laporan', exact=True)).to_have_value('2026-10-14')
        page.get_by_label('Cari sekolah, posyandu, kecamatan atau NPSN', exact=True).fill(pm[0]['nama'])
        expect(page.get_by_role('cell', name=re.compile('^'+re.escape(pm[0]['nama']))).first).to_be_visible()
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        page.goto(BASE + '/admin')
        page.get_by_role('button', name='Keluar', exact=True).click()
        page.wait_for_url('**/login')
        assert page.evaluate("JSON.parse(localStorage.getItem('bumbu-pawon:request:v1')).wortel") == 2
        page.goto(BASE + '/admin'); page.wait_for_url('**/login?next=*')
        assert not errors, errors
        browser.close()
    process.terminate(); process.wait(timeout=10)
    no_auth_env = {**env, 'ADMIN_PASSWORD_HASH': '', 'ADMIN_SESSION_SECRET': ''}
    process = subprocess.Popen(['node', 'node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', str(PORT)], cwd=ROOT, env=no_auth_env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(100):
        try:
            if request('/')[0] == 200: break
        except OSError: pass
        time.sleep(.1)
    else: raise AssertionError('Fail-closed server failed to start')
    assert request('/admin', cookie=cookie)[0] == 307
    assert request('/api/admin/sppg', cookie=cookie)[0] == 401
    assert request('/api/auth/login', {'password': password})[0] == 503
    print('PASS server auth, forged session, old password rejection, protected RSC, CSRF, logout, rate limit, no private JS data, CSP, favicon, mobile catalog.')
finally:
    process.terminate(); process.wait(timeout=10)
