"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Sppg } from "@/lib/types";
import { getAllSppg } from "@/lib/storage";
import { statusMeta } from "@/lib/sppgMeta";
import {
  buildRecipients,
  renderTemplate,
  waSendLink,
  toCsv,
  toVcard,
  TEMPLATE_VARS,
  DEFAULT_TEMPLATE,
  type Recipient,
} from "@/lib/marketing";

const TPL_KEY = "sppg-ponorogo:wa-template";
const SENT_KEY = "sppg-ponorogo:wa-sent";

export default function BlastPage() {
  const [list, setList] = useState<Sppg[]>([]);
  const [includeKa, setIncludeKa] = useState(true);
  const [includePic, setIncludePic] = useState(false);
  const [kec, setKec] = useState("all");
  const [q, setQ] = useState("");
  const [tpl, setTpl] = useState(DEFAULT_TEMPLATE);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sent, setSent] = useState<Set<string>>(new Set());

  useEffect(() => {
    setList(getAllSppg());
    try {
      const t = localStorage.getItem(TPL_KEY);
      if (t) setTpl(t);
      const s = localStorage.getItem(SENT_KEY);
      if (s) setSent(new Set(JSON.parse(s)));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(TPL_KEY, tpl);
    } catch {}
  }, [tpl]);

  function persistSent(next: Set<string>) {
    setSent(next);
    try {
      localStorage.setItem(SENT_KEY, JSON.stringify([...next]));
    } catch {}
  }

  const recipients = useMemo(
    () => buildRecipients(list, { includeKa, includePic }),
    [list, includeKa, includePic]
  );

  const kecamatanList = useMemo(
    () =>
      Array.from(new Set(recipients.map((r) => r.sppg.kecamatan)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "id")),
    [recipients]
  );

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return recipients.filter((r) => {
      if (kec !== "all" && r.sppg.kecamatan !== kec) return false;
      if (!n) return true;
      return (
        r.contact.toLowerCase().includes(n) ||
        r.sppg.nama.toLowerCase().includes(n) ||
        r.nomor.includes(n)
      );
    });
  }, [recipients, kec, q]);

  // sinkronkan selected default = semua yang terfilter saat pertama
  useEffect(() => {
    setSelected(new Set(filtered.map((r) => r.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipients]);

  const selectedRecipients = filtered.filter((r) => selected.has(r.id));
  const pending = selectedRecipients.filter((r) => !sent.has(r.id));
  const preview = selectedRecipients[0] ?? filtered[0] ?? null;

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }
  function selectAll(v: boolean) {
    setSelected(v ? new Set(filtered.map((r) => r.id)) : new Set());
  }

  function send(r: Recipient) {
    window.open(waSendLink(r, tpl), "_blank", "noopener");
    const next = new Set(sent);
    next.add(r.id);
    persistSent(next);
  }
  function sendNext() {
    const r = pending[0];
    if (r) send(r);
  }

  function download(name: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-gradient-to-r from-brand-dark to-brand px-4 py-3 text-white shadow">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15 text-lg">💬</span>
          <div>
            <h1 className="text-base font-bold leading-tight">Blast WhatsApp Marketing</h1>
            <p className="text-[11px] text-brand-light">
              Kirim penawaran ke kontak SPPG — aman via wa.me
            </p>
          </div>
        </div>
        <Link href="/" className="rounded-full border border-white/40 px-3 py-1.5 text-xs font-medium hover:bg-white/15">
          🗺 Peta
        </Link>
      </header>

      <div className="mx-auto max-w-6xl p-4">
        {/* Peringatan kepatuhan */}
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <strong>Kirim manual & bertahap.</strong> Alat ini membuka WhatsApp dengan pesan sudah
          terisi — Anda tetap menekan kirim. Hindari mengirim ratusan pesan sekaligus / terlalu cepat
          agar nomor tidak diblokir WhatsApp. Sebar ke penerima yang relevan saja.
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
          {/* Panel kiri: template & filter */}
          <div className="space-y-4">
            <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold text-slate-700">Pesan</h2>
              <textarea
                value={tpl}
                onChange={(e) => setTpl(e.target.value)}
                rows={9}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-brand focus:outline-none"
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {TEMPLATE_VARS.map((v) => (
                  <button
                    key={v.key}
                    onClick={() => setTpl((t) => t + `{${v.key}}`)}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-200"
                    title={v.label}
                  >
                    {"{" + v.key + "}"}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Ganti <code className="font-mono">[Nama Toko/Supplier Anda]</code> dengan nama usaha Anda.
              </p>
            </section>

            {preview && (
              <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <h2 className="mb-1 text-sm font-semibold text-slate-700">
                  Pratinjau · {preview.contact}
                </h2>
                <div className="whitespace-pre-wrap rounded-md bg-[#e5ddd5] p-2 text-[13px] text-slate-800">
                  <div className="rounded-md bg-[#dcf8c6] p-2 shadow-sm">
                    {renderTemplate(tpl, preview)}
                  </div>
                </div>
              </section>
            )}

            <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold text-slate-700">Penerima</h2>
              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 accent-brand" checked={includeKa} onChange={(e) => setIncludeKa(e.target.checked)} />
                  Kepala SPPG
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 accent-brand" checked={includePic} onChange={(e) => setIncludePic(e.target.checked)} />
                  PIC Yayasan
                </label>
                <select value={kec} onChange={(e) => setKec(e.target.value)} className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs">
                  <option value="all">Semua kecamatan</option>
                  {kecamatanList.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / SPPG / nomor…" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs" />
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <button onClick={() => download("kontak-sppg.csv", toCsv(selectedRecipients), "text/csv")} className="rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-50">⬇ CSV</button>
                <button onClick={() => download("kontak-sppg.vcf", toVcard(selectedRecipients), "text/vcard")} className="rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-50">⬇ vCard</button>
                <button onClick={() => navigator.clipboard?.writeText(selectedRecipients.map((r) => r.nomor).join("\n"))} className="rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-50">📋 Salin nomor</button>
              </div>
            </section>
          </div>

          {/* Panel kanan: antrian kirim */}
          <div className="space-y-3">
            <section className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-700">
                  {selectedRecipients.length} penerima dipilih
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    {sent.size > 0 && `· ${selectedRecipients.filter((r)=>sent.has(r.id)).length} terkirim · `}
                    {pending.length} tersisa
                  </span>
                </div>
              </div>
              <button
                onClick={sendNext}
                disabled={pending.length === 0}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-40"
              >
                ▶ Kirim berikutnya ({pending.length})
              </button>
              <button onClick={() => selectAll(true)} className="rounded-md border border-slate-300 px-2 py-2 text-xs hover:bg-slate-50">Pilih semua</button>
              <button onClick={() => selectAll(false)} className="rounded-md border border-slate-300 px-2 py-2 text-xs hover:bg-slate-50">Kosongkan</button>
              {sent.size > 0 && (
                <button onClick={() => persistSent(new Set())} className="rounded-md border border-amber-300 px-2 py-2 text-xs text-amber-700 hover:bg-amber-50">↺ Reset terkirim</button>
              )}
            </section>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="max-h-[60vh] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-2 py-2 w-8"></th>
                      <th className="px-2 py-2">Kontak</th>
                      <th className="px-2 py-2">SPPG / Kec.</th>
                      <th className="px-2 py-2">Nomor</th>
                      <th className="px-2 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => {
                      const meta = statusMeta(r.sppg.status);
                      const isSent = sent.has(r.id);
                      return (
                        <tr key={r.id} className={`border-t border-slate-100 ${isSent ? "bg-green-50/50" : "hover:bg-slate-50"}`}>
                          <td className="px-2 py-1.5">
                            <input type="checkbox" className="h-4 w-4 accent-brand" checked={selected.has(r.id)} onChange={() => toggle(r.id)} />
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="font-medium text-slate-800">{r.contact}</div>
                            <div className="text-[11px] text-slate-400">{r.peran}</div>
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: meta.color }} />
                              <span className="text-[12px] text-slate-600">{r.sppg.kecamatan}</span>
                            </div>
                            <div className="text-[11px] text-slate-400">{r.sppg.nama}</div>
                          </td>
                          <td className="px-2 py-1.5 font-mono text-[11px] text-slate-500">+{r.nomor}</td>
                          <td className="px-2 py-1.5 text-right">
                            <button
                              onClick={() => send(r)}
                              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                                isSent
                                  ? "border border-slate-300 text-slate-400"
                                  : "bg-green-600 text-white hover:bg-green-700"
                              }`}
                            >
                              {isSent ? "✓ ulangi" : "Kirim"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-400">Tidak ada penerima.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <details className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-sm">
              <summary className="cursor-pointer font-semibold text-slate-700">
                Butuh blast otomatis penuh? (WhatsApp Business API resmi)
              </summary>
              <p className="mt-2 leading-relaxed">
                Untuk pengiriman otomatis massal yang legal, gunakan <strong>WhatsApp Business Cloud
                API</strong> (Meta) atau penyedia resmi (mis. Qontak, Mekari Qontak, Twilio, Wati).
                Syaratnya: akun bisnis terverifikasi, <em>template pesan</em> yang disetujui Meta, dan
                penerima sudah <em>opt-in</em>. Ekspor kontak lewat tombol CSV/vCard di panel kiri untuk
                diimpor ke sana. Cara <em>whatsapp-web.js</em>/Baileys/ekstensi blast tidak resmi dan
                berisiko nomor diblokir — tidak disarankan.
              </p>
            </details>
          </div>
        </div>
      </div>
    </main>
  );
}
