"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Card } from "@/components/ui";
import { CATEGORIES } from "@/lib/constants";
import { catLabel, statusLabel, useLanguage, useT } from "@/lib/i18n";

interface PublicIssue {
  id: string;
  title: string;
  category: string;
  area: string;
  status: string;
  report_count: number;
  public_updates: { note: string; created_at: string }[];
}

export default function PublicIssuesPage() {
  const t = useT();
  const { lang } = useLanguage();
  const [issues, setIssues] = useState<PublicIssue[]>([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = category ? `?category=${encodeURIComponent(category)}` : "";
    const res = await fetch(`/api/public/issues${qs}`);
    const data = await res.json();
    setIssues(data.issues || []);
    setLoading(false);
  }, [category]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("pub.title")}</h1>
        <p className="text-sm text-slate-500">{t("pub.desc")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setCategory("")}
          className={
            category === ""
              ? "rounded-full bg-brand-600 px-3 py-1 text-xs font-medium text-white"
              : "rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
          }
        >
          {t("pub.all")}
        </button>
        {CATEGORIES.filter((c) => c !== "Other").map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={
              category === c
                ? "rounded-full bg-brand-600 px-3 py-1 text-xs font-medium text-white"
                : "rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
            }
          >
            {catLabel(lang, c)}
          </button>
        ))}
      </div>

      {loading ? (
        <Card>{t("pub.loading")}</Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {issues.map((issue) => (
            <Card key={issue.id}>
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold text-slate-900">
                  {issue.title}
                </span>
                <Badge tone="blue">{catLabel(lang, issue.category)}</Badge>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {issue.area || t("pub.constituency")} · {issue.report_count}{" "}
                {t("pub.reports")}
              </div>
              <div className="mt-2">
                <Badge tone="gray">
                  {t("pub.status")}: {statusLabel(lang, issue.status)}
                </Badge>
              </div>
              {issue.public_updates.length > 0 && (
                <div className="mt-3 space-y-1 border-t border-slate-100 pt-2">
                  <div className="text-xs font-semibold text-slate-600">
                    {t("pub.updates")}
                  </div>
                  {issue.public_updates.map((u, i) => (
                    <p key={i} className="text-xs text-slate-500">
                      {u.note}
                    </p>
                  ))}
                </div>
              )}
            </Card>
          ))}
          {!issues.length && <Card>{t("pub.none")}</Card>}
        </div>
      )}
    </div>
  );
}
