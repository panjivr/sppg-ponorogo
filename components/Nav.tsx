"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "@/components/Icon";
import { applyTheme, getTheme, setTheme, type Theme } from "@/lib/store";
const LINKS: { href: string; label: string; icon: IconName }[] = [
  { href: "/ringkasan", label: "Ringkasan", icon: "grid" },
  { href: "/peta", label: "Peta", icon: "map" },
  { href: "/dashboard", label: "Analisis", icon: "chart" },
  { href: "/direktori", label: "Direktori", icon: "users" },
  { href: "/laporan", label: "Laporan & PM", icon: "chart" },
  { href: "/admin", label: "Kelola data", icon: "settings" },
  { href: "/blast", label: "Pesan WA", icon: "chat" },
  { href: "/tentang", label: "Metodologi", icon: "info" },
  { href: "/supplier", label: "Katalog publik", icon: "bag" },
];
function ThemeToggle() {
  const [theme, setT] = useState<Theme>("system");
  useEffect(() => {
    const t = getTheme();
    setT(t);
    applyTheme(t);
  }, []);
  const label =
    theme === "light" ? "Terang" : theme === "dark" ? "Gelap" : "Ikut sistem";
  return (
    <button
      onClick={() => {
        const next: Theme =
          theme === "system" ? "light" : theme === "light" ? "dark" : "system";
        setT(next);
        setTheme(next);
      }}
      className="tap inline-flex items-center justify-center rounded-lg p-2 text-ink2 hover:bg-surface2"
      aria-label={`Tema: ${label}. Klik untuk ganti.`}
      title={`Tema: ${label}`}
    >
      <Icon name={theme === "dark" ? "moon" : "sun"} />
    </button>
  );
}
export default function Nav() {
  const path = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (menu.current) menu.current.open = false;
  }, [path]);
  const active = (href: string) => path === href;
  return (
    <>
      <header className="internal-header safe-t sticky top-0 z-[1100] border-b border-hairline bg-surface">
        <div className="mx-auto flex max-w-content items-center justify-between gap-3 px-4 py-3">
          <Link
            href="/ringkasan"
            className="flex shrink-0 items-center gap-2 text-brand"
          >
            <Icon name="leaf" />
            <span className="font-semibold leading-tight">
              Bumbu Pawon
              <span className="block text-xs font-normal tracking-wider text-muted">
                AREA PENGELOLA · SPPG
              </span>
            </span>
          </Link>
          <nav
            className="hidden items-center gap-1 xl:flex"
            aria-label="Navigasi pengelola"
          >
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active(l.href) ? "page" : undefined}
                className={`rounded-lg px-2 py-3 text-xs font-medium ${active(l.href) ? "bg-brand-soft text-brand" : "text-ink2 hover:bg-surface2"}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex gap-2">
            <Link
              href="/"
              className="tap inline-flex items-center gap-1 rounded-lg px-2 text-xs text-ink2 hover:bg-surface2"
            >
              Toko <Icon name="arrow" />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <nav
        className="safe-b fixed bottom-0 left-0 right-0 z-[1100] border-t border-hairline bg-surface xl:hidden"
        aria-label="Navigasi pengelola ponsel"
      >
        <ul className="flex">
          {LINKS.slice(0, 4).map((l) => (
            <li key={l.href} className="min-w-0 flex-1">
              <Link
                href={l.href}
                aria-current={active(l.href) ? "page" : undefined}
                className={`tap flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium ${active(l.href) ? "bg-brand-soft text-brand" : "text-ink2"}`}
              >
                <Icon name={l.icon} />
                {l.label}
              </Link>
            </li>
          ))}
          <li className="min-w-0 flex-1">
            <details ref={menu} className="internal-more">
              <summary className="tap flex list-none flex-col items-center justify-center gap-1 py-2 text-xs font-medium text-ink2">
                <Icon name="menu" />
                Lainnya
              </summary>
              <div className="internal-more-links">
                {LINKS.slice(4).map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={active(l.href) ? "page" : undefined}
                    className={active(l.href) ? "text-brand" : "text-ink2"}
                  >
                    <Icon name={l.icon} />
                    {l.label}
                  </Link>
                ))}
              </div>
            </details>
          </li>
        </ul>
      </nav>
    </>
  );
}
export function NavSpacer() {
  return <div className="safe-b h-20 xl:hidden" aria-hidden="true" />;
}
