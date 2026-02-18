"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = pathname === "/";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isHome ? "bg-transparent" : "bg-black/90 backdrop-blur-sm border-b border-white/5"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-white text-xs md:text-sm tracking-[0.4em] uppercase font-semibold hover:opacity-70 transition-opacity text-glitch"
        >
          Portfolio
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-10">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[10px] tracking-[0.35em] uppercase font-medium transition-all duration-200 ${
                pathname.startsWith(link.href)
                  ? "text-white"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 -mr-2"
          aria-label="Toggle menu"
        >
          <div className="w-6 flex flex-col gap-1.5">
            <span
              className={`block h-[1px] bg-white transition-all duration-300 ${
                menuOpen ? "rotate-45 translate-y-[7px]" : ""
              }`}
            />
            <span
              className={`block h-[1px] bg-white transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-[1px] bg-white transition-all duration-300 ${
                menuOpen ? "-rotate-45 -translate-y-[7px]" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile menu - fullscreen overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-black z-40">
          <div className="flex flex-col items-start justify-center h-full px-8 gap-8 -mt-16">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-4xl tracking-[0.2em] uppercase font-heading font-bold transition-opacity ${
                  pathname.startsWith(link.href)
                    ? "text-white"
                    : "text-white/30 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
