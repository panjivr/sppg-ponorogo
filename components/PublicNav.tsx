"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Brand from "@/components/Brand";
import Icon from "@/components/Icon";
import { waLink } from "@/lib/config";
export default function PublicNav() {
  const path = usePathname();
  const router = useRouter();
  const logoTaps = useRef({ count: 0, time: 0 });
  function handleLogoClick(event: React.MouseEvent<HTMLAnchorElement>) {
    setOpen(false);
    if (path !== "/" || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const now = Date.now();
    const count = now - logoTaps.current.time < 700 ? logoTaps.current.count + 1 : 1;
    logoTaps.current = { count, time: now };
    if (count === 3) {
      logoTaps.current = { count: 0, time: 0 };
      router.push("/admin");
    }
  }
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/", label: "Beranda" },
    { href: "/supplier", label: "Katalog produk" },
    { href: "/#layanan", label: "Layanan" },
    { href: "/#kontak", label: "Kontak" },
  ];
  return (
    <header className="public-header">
      <div className="site-container public-nav">
        <Link
          href="/"
          aria-label="Bumbu Pawon, beranda"
          onClick={handleLogoClick}
        >
          <Brand />
        </Link>
        <nav className="desktop-links" aria-label="Navigasi utama">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={path === l.href ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <a
            className="button button-primary nav-contact"
            href={waLink(
              "Halo Bumbu Pawon, saya ingin bertanya tentang kebutuhan dapur.",
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="chat" />
            <span>Hubungi kami</span>
          </a>
          <button
            className="icon-button mobile-menu"
            aria-label={open ? "Tutup navigasi" : "Buka navigasi"}
            aria-expanded={open}
            aria-controls="public-mobile-nav"
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="public-mobile-nav"
          className="mobile-links site-container"
          aria-label="Navigasi ponsel"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              aria-current={path === l.href ? "page" : undefined}
            >
              {l.label}
              <Icon name="chevron" />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
