"use client";

import Link from "next/link";
import { LanguageToggle } from "./LanguageToggle";
import { useT } from "@/lib/i18n";

export function SiteNav() {
  const t = useT();
  const links = [
    { href: "/citizen", label: t("nav.citizen") },
    { href: "/staff", label: t("nav.staff") },
    { href: "/officer", label: t("nav.officer") },
    { href: "/mp/chat", label: t("nav.mpChat") },
    { href: "/mp/dashboard", label: t("nav.mpDash") },
    { href: "/public/issues", label: t("nav.public") },
  ];
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-6 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            PP
          </span>
          <span className="text-sm font-semibold text-slate-900">
            {t("app.name")}
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <LanguageToggle />
      </div>
    </header>
  );
}
