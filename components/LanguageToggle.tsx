"use client";

import { useLanguage } from "@/lib/i18n";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const pill = (active: boolean) =>
    active
      ? "rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white"
      : "rounded-full px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900";
  return (
    <div
      role="group"
      aria-label="Language"
      className="ml-auto flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5"
    >
      <button
        type="button"
        onClick={() => setLang("te")}
        className={pill(lang === "te")}
        aria-pressed={lang === "te"}
      >
        తెలుగు
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={pill(lang === "en")}
        aria-pressed={lang === "en"}
      >
        English
      </button>
    </div>
  );
}
