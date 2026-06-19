"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [flashcardDue, setFlashcardDue] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("linguify-flashcards");
      if (raw) {
        const cards = JSON.parse(raw);
        setFlashcardDue(cards.filter((c: any) => c.nextReview <= Date.now()).length);
      }
    } catch {}
  }, [pathname]);

  const links = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/skill", label: "Coach", icon: "📖" },
    { href: "/agent", label: "Practice", icon: "🏙️" },
    { href: "/dashboard", label: "Progress", icon: "📊" },
    { href: "/flashcards", label: "Cards", icon: "🃏", badge: flashcardDue > 0 ? flashcardDue : undefined },
    { href: "/voice", label: "Voice", icon: "🎤" },
    { href: "/translate", label: "Translate", icon: "🌍" },
  ];

  return (
    <header className="nav-glass sticky top-0 z-50">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 text-white text-base font-extrabold shadow-lg shadow-accent-500/20">
            L
          </span>
          <span className="gradient-text font-bold text-lg hidden sm:inline">Linguify</span>
        </Link>
        <ul className="flex items-center gap-0.5 overflow-x-auto">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative rounded-lg px-2 sm:px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    active ? "text-accent-600" : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <span className="sm:hidden">{link.icon}</span>
                  <span className="hidden sm:inline">{link.label}</span>
                  {link.badge && (
                    <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-error text-[9px] font-bold text-white">{link.badge}</span>
                  )}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-accent-500" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
