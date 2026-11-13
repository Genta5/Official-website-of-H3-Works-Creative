"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";

const navigation = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Products", href: "/products" },
  { label: "Contact", href: "/contact" },
];

function BrandMark() {
  return (
    <span className="brand-mark" aria-label="H3 Works symbol">
      <span className="brand-mark__shape brand-mark__shape--one" />
      <span className="brand-mark__shape brand-mark__shape--two" />
      <span className="brand-mark__shape brand-mark__shape--three" />
    </span>
  );
}

export default function SiteNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isContact = pathname === "/contact";

  return (
    <nav className="site-nav relative z-50 border-b border-black/10">
      <div className="mx-auto flex h-[82px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-14">
        <Link
          href="/"
          className="brand-lockup"
          onClick={() => setMenuOpen(false)}
        >
          <BrandMark />
          <span className="brand-word">
            <strong>h3 works<span>.</span></strong>
            <small>Independent creative studio</small>
          </span>
        </Link>

        <div className="hidden items-center gap-9 text-[11px] font-bold md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Link
          href={isContact ? "/" : "/contact"}
          className="nav-cta group hidden md:inline-flex"
        >
          {isContact ? "Back home" : "Let's talk"}
          <ArrowUpRight
            size={15}
            className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
          />
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-11 w-11 items-center justify-center border border-black/15 text-[#191916] transition hover:bg-[#e7e2d7] md:hidden"
          aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {menuOpen && (
        <div
          id="mobile-navigation"
          className="absolute left-0 right-0 top-full border-b border-black/10 bg-[#f1eee6] px-5 py-5 shadow-lg md:hidden sm:px-8"
        >
          <div className="mx-auto flex max-w-[1440px] flex-col">
            {navigation.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between border-b border-black/10 py-4 text-sm font-bold transition hover:text-[#f15a38] ${
                  pathname === item.href ? "text-[#f15a38]" : "text-[#191916]"
                }`}
              >
                <span>{item.label}</span>
                <span className="text-[10px] font-medium text-black/35">
                  0{index + 1}
                </span>
              </Link>
            ))}

            <Link
              href={isContact ? "/" : "/contact"}
              onClick={() => setMenuOpen(false)}
              className="mt-5 flex items-center justify-between bg-[#f15a38] px-5 py-4 text-xs font-bold text-white transition hover:bg-[#191916]"
            >
              {isContact ? "Back home" : "Let's talk"}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
