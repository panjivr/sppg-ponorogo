"""Validate workbook import against prior tracked seed without exposing personal data."""
import json, subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[1]
load=lambda name:json.loads((root/'data'/name).read_text())
old={r['id']:r for r in json.loads(subprocess.check_output(['git','show','HEAD:data/sppg.json'],cwd=root))}
seed=load('sppg.json');daily=load('laporan-oktober.json');groups=load('pm-kabupaten.json');summary=load('sppg-import-summary.json')
assert len(seed)==len(old)==85 and {r['id'] for r in seed}==set(old)
assert len(daily)==1189 and len({(r['sppgId'],r['tanggal']) for r in daily})==len(daily)
assert max(r['tanggal'] for r in daily)=='2026-10-14'
updates=0
for r in seed:
 before=old[r['id']]
 for key in ['id','nama','kecamatan','desa','lat','lng','perkiraan','alamat','gmaps']:
  assert r.get(key)==before.get(key),key
 for key in ['nomorKa','picNama','picNomor','yayasan','perijinan','bankVa']:
  assert r['detail'].get(key)==before['detail'].get(key),key
 latest=[x for x in daily if x['sppgId']==r['id'] and (x['totalPm'] or 0)>0]
 if latest:
  report=max(latest,key=lambda x:x['tanggal']);assert r['porsi']==report['totalPm'];assert r['detail']['dailyReportDate']==report['tanggal'];updates+=1
 else:assert r['porsi']==before['porsi'] and r['pm']==before['pm']
assert updates==summary['updatedPmCount']==50
assert len(groups)==832 and len({r['id'] for r in groups})==832
assert not any(key.lower() in ['nik','nikpic','picnomor','phone','no.telfon'] for r in groups for key in r)
assert sum(r['possibleDuplicate'] for r in groups)==20
assert sum(r['reconciled'] is False for r in groups)==37
print('PASS: 85 kitchens matched, 50 PM updates, 35 prior values preserved, locations/contacts unchanged, 1189 dated records, 832 PM groups, duplicate/total flags.')
