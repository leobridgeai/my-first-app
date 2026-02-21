"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutEnabled, setAboutEnabled] = useState(true);
  const isHome = pathname === "/";

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.aboutEnabled === "false") setAboutEnabled(false);
      })
      .catch(() => {});
  }, []);

  const links = [
    { href: "/work", label: "Work" },
    ...(aboutEnabled ? [{ href: "/about", label: "About" }] : []),
    { href: "/about", label: "Books" },
    { href: "/about", label: "Etc" },
    { href: "/about", label: "Contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 ${
        isHome ? "bg-transparent" : "bg-white"
      }`}
    >
      <div className="max-w-[960px] mx-auto px-6 md:px-10 h-[56px] flex items-center justify-between">
        {/* Site name — quiet, not competing */}
        <Link
          href="/work"
          className="text-[11px] tracking-[0.25em] uppercase text-[#111] hover:text-[#666]"
        >
          Leonard Canitrot
        </Link>

        {/* Desktop navigation — plain text links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link, i) => (
            <Link
              key={`${link.href}-${i}`}
              href={link.href}
              className="text-[11px] tracking-[0.15em] uppercase text-[#555] hover:text-[#111]"
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
          <div className="w-5 flex flex-col gap-1.5">
            <span
              className={`block h-[1px] bg-[#111] ${
                menuOpen ? "rotate-45 translate-y-[7px]" : ""
              }`}
            />
            <span
              className={`block h-[1px] bg-[#111] ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-[1px] bg-[#111] ${
                menuOpen ? "-rotate-45 -translate-y-[7px]" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile menu — plain white overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-[56px] bg-white z-40">
          <div className="flex flex-col items-start px-6 pt-10 gap-6">
            {links.map((link, i) => (
              <Link
                key={`${link.href}-${i}`}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-[13px] tracking-[0.15em] uppercase text-[#555] hover:text-[#111]"
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
