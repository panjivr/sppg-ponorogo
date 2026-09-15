"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { applyTheme, getTheme, setTheme, type Theme } from "@/lib/store";

const LINKS = [
  { href: "/", label: "Beranda", icon: "🏠" },
  { href: "/peta", label: "Peta", icon: "🗺️" },
  { href: "/dashboard", label: "Analisis", icon: "📊" },
  { href: "/direktori", label: "Direktori", icon: "📋" },
  { href: "/supplier", label: "Katalog", icon: "🏪" },
  { href: "/blast", label: "Blast WA", icon: "💬" },
];

function ThemeToggle() {
  const [theme, setT] = useState<Theme>("system");

  useEffect(() => {
    const t = getTheme();
    setT(t);
    applyTheme(t);
  }, []);

  function cycle() {
    const next: Theme =
      theme === "system" ? "light" : theme === "light" ? "dark" : "system";
    setT(next);
    setTheme(next);
  }

  const icon = theme === "light" ? "☀️" : theme === "dark" ? "🌙" : "🌓";
  const label =
    theme === "light" ? "Terang" : theme === "dark" ? "Gelap" : "Ikut sistem";

  return (
    <button
      onClick={cycle}
      className="tap inline-flex items-center justify-center rounded-lg px-2 text-base hover:bg-surface2"
      aria-label={`Tema: ${label}. Klik untuk ganti.`}
      title={`Tema: ${label}`}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

export default function Nav() {
  const path = usePathname();
  const isActive = (href: string) =>
    href === "/" ? path === "/" : path.startsWith(href);

  return (
    <>
      {/* ---------- Top bar: tablet & desktop ---------- */}
      <header className="safe-t sticky top-0 z-[1100] hidden border-b border-hairline bg-surface/95 backdrop-blur md:block">
        <nav
          className="mx-auto flex max-w-content items-center gap-1 px-4 py-2"
          aria-label="Navigasi utama"
        >
          <Link
            href="/"
            className="mr-3 flex items-center gap-2 font-bold tracking-tight"
          >
            <span aria-hidden="true">🍚</span>
            <span>SPPG Ponorogo</span>
          </Link>
          {LINKS.slice(1).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive(l.href)
                  ? "bg-brand-soft text-brand"
                  : "text-ink2 hover:bg-surface2"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
          </div>
        </nav>
      </header>

      {/* ---------- Compact header: mobile ---------- */}
      <header className="safe-t sticky top-0 z-[1100] flex items-center justify-between border-b border-hairline bg-surface/95 px-3 py-2 backdrop-blur md:hidden">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span aria-hidden="true">🍚</span>
          <span className="text-sm">SPPG Ponorogo</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* ---------- Bottom tab bar: mobile (jangkauan jempol) ---------- */}
      <nav
        className="safe-b fixed bottom-0 left-0 right-0 z-[1100] border-t border-hairline bg-surface/95 backdrop-blur md:hidden"
        aria-label="Navigasi utama"
      >
        <ul className="flex">
          {LINKS.map((l) => (
            <li key={l.href} className="flex-1">
              <Link
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`tap flex flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-medium ${
                  isActive(l.href) ? "text-brand" : "text-ink2"
                }`}
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  {l.icon}
                </span>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

/** Spacer supaya isi halaman tidak tertutup bottom tab bar di HP. */
export function NavSpacer() {
  return <div className="safe-b h-14 md:hidden" aria-hidden="true" />;
}
