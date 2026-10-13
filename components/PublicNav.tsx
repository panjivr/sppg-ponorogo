"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Brand from "@/components/Brand";
import Icon from "@/components/Icon";
import { waLink } from "@/lib/config";
export default function PublicNav() {
  const path = usePathname();
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
          onClick={() => setOpen(false)}
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
              "Halo Bumbu Pawon Mas Dhoo, saya ingin bertanya tentang kebutuhan dapur.",
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
