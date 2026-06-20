"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import ThemeToggle from "./ThemeToggle";

interface NavLink {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

export default function Navbar() {
  const pathname = usePathname();
  const [flashcardDue, setFlashcardDue] = useState(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("linguify-flashcards") : null;
      if (raw) {
        const cards: { nextReview: number }[] = JSON.parse(raw);
        return cards.filter((c) => c.nextReview <= Date.now()).length;
      }
    } catch { /* ignore */ }
    return 0;
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      setMobileOpen(false);
    }
  }, [pathname]);

  // Refresh flashcard count when tab becomes visible
  useEffect(() => {
    const refresh = () => {
      try {
        const raw = localStorage.getItem("linguify-flashcards");
        if (raw) {
          const cards: { nextReview: number }[] = JSON.parse(raw);
          setFlashcardDue(cards.filter((c) => c.nextReview <= Date.now()).length);
        }
      } catch { /* ignore */ }
    };
    window.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const links: NavLink[] = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/skill", label: "Coach", icon: "👤" },
    { href: "/agent", label: "Practice", icon: "🎧" },
    { href: "/dashboard", label: "Progress", icon: "📈" },
    { href: "/flashcards", label: "Cards", icon: "🃏", badge: flashcardDue > 0 ? flashcardDue : undefined },
    { href: "/voice", label: "Voice", icon: "🎤" },
    { href: "/translate", label: "Translate", icon: "🌐" },
  ];

  return (
    <>
      <header className="nav-glass sticky top-0 z-50">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 text-white text-base font-extrabold shadow-lg shadow-accent-500/20">
              L
            </span>
            <span className="gradient-text font-bold text-lg hidden sm:inline">Linguify</span>
          </Link>

          {/* Desktop nav (≥768px) — unchanged horizontal layout */}
          <ul className="hidden md:flex items-center gap-0.5 overflow-x-auto">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      active ? "text-accent-600" : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {link.label}
                    {link.badge && (
                      <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-error text-[9px] font-bold text-white">
                        {link.badge}
                      </span>
                    )}
                    {active && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-accent-500" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Theme toggle + mobile hamburger */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
            onClick={toggleMobile}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/60 transition-colors"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={toggleMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile slide-out menu */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[280px] bg-[var(--bg-root)] backdrop-blur-2xl border-l border-[var(--border-card)] shadow-2xl md:hidden transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Menu header with close button */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-[var(--border-card)]">
          <span className="gradient-text font-bold text-lg">Linguify</span>
          <button
            onClick={toggleMobile}
            aria-label="Close menu"
            className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/60 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Menu items */}
        <nav className="flex flex-col px-3 py-4 gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 min-h-[44px] px-4 rounded-xl text-[15px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-accent-500/10 text-accent-500"
                    : "text-text-secondary hover:bg-[var(--bg-panel)] hover:text-text-primary active:bg-accent-500/5"
                }`}
              >
                <span className="text-lg w-6 text-center flex-shrink-0">{link.icon}</span>
                <span className="flex-1">{link.label}</span>
                {link.badge && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-error px-1.5 text-[11px] font-bold text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Theme toggle at bottom of mobile menu */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-[var(--border-card)]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Dark mode</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  );
}
