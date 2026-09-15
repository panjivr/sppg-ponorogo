import type { ReactNode } from "react";
import { STATUS_META, type SppgStatus } from "@/lib/types";
import { num } from "@/lib/format";

/* ---------------- Wadah ---------------- */

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-hairline bg-surface p-4 sm:p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  children,
  sub,
}: {
  children: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
        {children}
      </h2>
      {sub && <p className="mt-1 text-sm text-ink2">{sub}</p>}
    </div>
  );
}

/* ---------------- Angka utama (hero / stat tile) ----------------
   Bukan grafik: satu angka yang dibaca sekali. Angka besar pakai
   angka proporsional; tabular-nums hanya untuk kolom yang harus rata. */

export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "brand" | "seqA" | "seqB";
}) {
  const toneClass =
    tone === "brand"
      ? "text-brand"
      : tone === "seqA"
        ? "text-seqA"
        : tone === "seqB"
          ? "text-seqB"
          : "text-ink";
  return (
    <div className="rounded-xl border border-hairline bg-surface p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-bold sm:text-3xl ${toneClass}`}>
        {value}
      </div>
      {hint && <div className="mt-1 text-xs leading-snug text-ink2">{hint}</div>}
    </div>
  );
}

/* ---------------- Status: warna + ikon + label ----------------
   Warna status tidak pernah berdiri sendiri (validator menandai
   pasangan warning/serious sulit dibedakan), jadi selalu ada teks. */

export function StatusBadge({
  status,
  size = "sm",
}: {
  status: SppgStatus;
  size?: "sm" | "xs";
}) {
  const m = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface2 font-medium text-ink2 ${
        size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
      }`}
    >
      <span aria-hidden="true" style={{ color: m.color }}>
        {m.icon}
      </span>
      {m.label}
    </span>
  );
}

export function StatusDot({ status }: { status: SppgStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      aria-hidden="true"
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ background: m.color }}
    />
  );
}

/* ---------------- Bar list (satu seri, magnitude) ----------------
   Bar horizontal: nama panjang tetap terbaca tanpa memutar label
   (label miring = anti-pattern). Satu seri => tanpa legenda. */

export interface BarRow {
  label: string;
  value: number;
  /** Teks tambahan di tooltip / baris kedua. */
  note?: string;
}

export function BarList({
  rows,
  color = "var(--seq-a)",
  format = num,
  unit = "",
  max,
}: {
  rows: BarRow[];
  color?: string;
  format?: (n: number) => string;
  unit?: string;
  max?: number;
}) {
  const peak = max ?? Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-2">
      {rows.map((r) => {
        const pct = Math.max(1.5, (r.value / peak) * 100);
        return (
          <li
            key={r.label}
            className="group grid grid-cols-[minmax(5.5rem,8rem)_1fr_auto] items-center gap-2 sm:grid-cols-[10rem_1fr_auto] sm:gap-3"
            title={`${r.label}: ${format(r.value)}${unit}${r.note ? ` · ${r.note}` : ""}`}
          >
            <span className="truncate text-xs text-ink2 sm:text-sm">
              {r.label}
            </span>
            {/* jalur bar = sumbu recessive; bar anchored di kiri (baseline) */}
            <span className="relative block h-3 w-full rounded-sm bg-surface2">
              <span
                className="absolute left-0 top-0 h-3 transition-[width] duration-500 group-hover:brightness-110"
                style={{
                  width: `${pct}%`,
                  background: color,
                  borderRadius: "2px 4px 4px 2px",
                }}
              />
            </span>
            <span className="tabular-nums text-xs font-semibold text-ink sm:text-sm">
              {format(r.value)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------- Rincian status (baris terpisah) ----------------
   Sengaja BUKAN stacked bar: validator menunjukkan warna
   "akan" & "berhenti" hanya ΔE 13,6 — kalau bersebelahan dalam
   satu bar akan sulit dibedakan. Baris terpisah + label = aman. */

export function StatusBreakdown({
  rows,
  total,
}: {
  rows: { status: SppgStatus; jumlah: number; porsi: number }[];
  total: number;
}) {
  const peak = Math.max(1, ...rows.map((r) => r.jumlah));
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => {
        const m = STATUS_META[r.status];
        return (
          <li key={r.status}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="flex items-center gap-2 text-sm text-ink2">
                <span aria-hidden="true" style={{ color: m.color }}>
                  {m.icon}
                </span>
                {m.label}
              </span>
              <span className="tabular-nums text-sm">
                <span className="font-semibold text-ink">{r.jumlah}</span>
                <span className="text-muted">
                  {" "}
                  / {total} · {num(r.porsi)} pm
                </span>
              </span>
            </div>
            <span className="mt-1 block h-2 w-full rounded-sm bg-surface2">
              <span
                className="block h-2"
                style={{
                  width: `${Math.max(1.5, (r.jumlah / peak) * 100)}%`,
                  background: m.color,
                  borderRadius: "2px 4px 4px 2px",
                }}
              />
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------- Tombol ---------------- */

export function Btn({
  children,
  onClick,
  variant = "solid",
  className = "",
  type = "button",
  disabled,
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "solid" | "outline" | "ghost" | "danger";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-50";
  const styles = {
    solid: "bg-brand text-white hover:opacity-90",
    outline: "border border-hairline text-ink hover:bg-surface2",
    ghost: "text-ink2 hover:bg-surface2",
    danger: "border border-hairline text-critical hover:bg-surface2",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </button>
  );
}
