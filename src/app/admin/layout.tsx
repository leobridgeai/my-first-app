"use client";

import { useSession } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted text-sm">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/albums", label: "Albums" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-heading text-lg">
              Admin
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs tracking-widest uppercase px-3 py-1.5 rounded transition-colors ${
                    item.href === "/admin"
                      ? pathname === item.href
                        ? "bg-foreground text-white"
                        : "text-muted hover:text-foreground"
                      : pathname.startsWith(item.href)
                        ? "bg-foreground text-white"
                        : "text-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              View Site
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="md:hidden px-6 pb-3 flex gap-2 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-xs tracking-widest uppercase px-3 py-1.5 rounded whitespace-nowrap transition-colors ${
                item.href === "/admin"
                  ? pathname === item.href
                    ? "bg-foreground text-white"
                    : "text-muted hover:text-foreground"
                  : pathname.startsWith(item.href)
                    ? "bg-foreground text-white"
                    : "text-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SessionProvider>
  );
}
