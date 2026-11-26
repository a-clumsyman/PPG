"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";

export default function HomePage() {
  const t = useT();
  const surfaces = [
    { href: "/citizen", title: t("nav.citizen"), desc: t("home.surf.citizen.desc") },
    { href: "/staff", title: t("nav.staff"), desc: t("home.surf.staff.desc") },
    { href: "/mp/chat", title: t("mpchat.title"), desc: t("home.surf.mpChat.desc") },
    { href: "/mp/dashboard", title: t("nav.mpDash"), desc: t("home.surf.mpDash.desc") },
    { href: "/public/issues", title: t("nav.public"), desc: t("home.surf.public.desc") },
  ];
  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 p-8 text-white">
        <h1 className="text-3xl font-bold">{t("app.name")}</h1>
        <p className="mt-2 max-w-2xl text-brand-50">{t("home.heroDesc")}</p>
        <p className="mt-4 max-w-2xl text-sm text-brand-100">{t("home.heroSub")}</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {surfaces.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">{s.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
            <span className="mt-4 inline-block text-sm font-medium text-brand-600">
              {t("home.open")}
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
