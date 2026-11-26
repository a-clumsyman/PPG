"use client";

import { Badge } from "./ui";
import { useT } from "@/lib/i18n";

/**
 * Section 24.3 - AI trust rules. Surfaces confidence, data used, verification
 * and limitations wherever the platform shows an AI-derived answer.
 */
export function TrustBadges({
  confidence,
  dataUsed,
  limitations,
}: {
  confidence?: "high" | "medium" | "low";
  dataUsed?: string[];
  limitations?: string[];
}) {
  const t = useT();
  const tone =
    confidence === "high" ? "green" : confidence === "medium" ? "amber" : "red";
  return (
    <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
      <div className="flex flex-wrap items-center gap-2">
        {confidence && (
          <Badge tone={tone}>
            {t("trust.confidence", { level: t("trust." + confidence) })}
          </Badge>
        )}
        {dataUsed && dataUsed.length > 0 && (
          <Badge tone="blue">{t("trust.dataUsed", { n: dataUsed.length })}</Badge>
        )}
      </div>
      {limitations && limitations.length > 0 && (
        <ul className="list-inside list-disc space-y-0.5">
          {limitations.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function VerificationBadge({ status }: { status: string }) {
  const t = useT();
  const map: Record<string, { tone: string; label: string }> = {
    staff_verified: { tone: "green", label: t("trust.staffVerified") },
    unverified: { tone: "amber", label: t("trust.unverified") },
    disputed: { tone: "red", label: t("trust.disputed") },
  };
  const v = map[status] || map.unverified;
  return <Badge tone={v.tone}>{v.label}</Badge>;
}
