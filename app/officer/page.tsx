"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, urgencyTone } from "@/components/ui";
import { catLabel, statusLabel, urgLabel, useLanguage, useT } from "@/lib/i18n";

const STEPS = ["received", "details_check", "field_check", "decision"] as const;
const TOKEN_KEY = "pp-officer-token";

interface Application {
  id: string;
  tracking_id: string;
  summary: string;
  original_text: string;
  language: string;
  category: string;
  urgency: string;
  location: string | null;
  workflow_step: string;
  decision: string | null;
  decision_note: string | null;
  priority_score: number;
  created_at: string;
}

interface HistoryEvent {
  id: string;
  action: string;
  actor: string;
  step_from: string | null;
  step_to: string | null;
  note: string;
  ai_suggestion: string;
  decision: string | null;
  created_at: string;
}

export default function OfficerPage() {
  const t = useT();
  const [token, setToken] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setToken(window.localStorage.getItem(TOKEN_KEY));
  }, []);

  function onLogin(tok: string) {
    window.localStorage.setItem(TOKEN_KEY, tok);
    setToken(tok);
  }
  function onLogout() {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setSelected(null);
  }

  if (!token) return <LoginCard onLogin={onLogin} />;
  if (selected)
    return <ApplicationDetail id={selected} token={token} onBack={() => setSelected(null)} onExpire={onLogout} />;
  return <Queue token={token} onSelect={setSelected} onLogout={onLogout} onExpire={onLogout} />;
}

function LoginCard({ onLogin }: { onLogin: (tok: string) => void }) {
  const t = useT();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setError(true);
        return;
      }
      const data = await res.json();
      onLogin(data.token);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        <h1 className="text-xl font-bold text-slate-900">{t("off.login.title")}</h1>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t("off.login.user")}
            autoComplete="username"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("off.login.pass")}
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
          {error && <p className="text-xs text-red-600">{t("off.login.error")}</p>}
          <Button type="submit" disabled={busy} className="w-full">
            {t("off.login.submit")}
          </Button>
        </form>
        <p className="mt-3 text-xs text-slate-400">{t("off.login.hint")}</p>
      </Card>
    </div>
  );
}

function Queue({
  token,
  onSelect,
  onLogout,
  onExpire,
}: {
  token: string;
  onSelect: (id: string) => void;
  onLogout: () => void;
  onExpire: () => void;
}) {
  const t = useT();
  const { lang } = useLanguage();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/workflow/queue", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      onExpire();
      return;
    }
    const data = await res.json();
    setApps(data.applications || []);
    setLoading(false);
  }, [token, onExpire]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("off.queue.title")}</h1>
          <p className="text-sm text-slate-500">{t("off.queue.subtitle")}</p>
        </div>
        <Button variant="ghost" onClick={onLogout} className="text-xs">
          {t("off.logout")}
        </Button>
      </div>

      {loading ? (
        <Card>{t("off.queue.loading")}</Card>
      ) : !apps.length ? (
        <Card>{t("off.queue.empty")}</Card>
      ) : (
        <div className="space-y-2">
          {apps.map((a) => (
            <button
              key={a.id}
              onClick={() => onSelect(a.id)}
              className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-brand-300"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-slate-500">{a.tracking_id}</span>
                  <Badge tone="blue">{catLabel(lang, a.category)}</Badge>
                  <Badge tone={urgencyTone(a.urgency)}>{urgLabel(lang, a.urgency)}</Badge>
                  <Badge tone="gray">{t("off.step." + (STEPS.includes(a.workflow_step as never) ? a.workflow_step : "received"))}</Badge>
                </div>
                <Badge tone="purple">{t("off.priority", { n: a.priority_score })}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-800">{a.summary}</p>
              {a.location && <p className="mt-0.5 text-xs text-slate-500">{a.location}</p>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationDetail({
  id,
  token,
  onBack,
  onExpire,
}: {
  id: string;
  token: string;
  onBack: () => void;
  onExpire: () => void;
}) {
  const t = useT();
  const { lang } = useLanguage();
  const [app, setApp] = useState<Application | null>(null);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [note, setNote] = useState("");
  const [fieldNote, setFieldNote] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const auth = { Authorization: `Bearer ${token}` };

  const load = useCallback(async () => {
    const res = await fetch(`/api/workflow/applications/${id}`, { headers: auth });
    if (res.status === 401) {
      onExpire();
      return;
    }
    const data = await res.json();
    setApp(data.application);
    setHistory(data.history || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(path: string, body: Record<string, unknown>, tag: string) {
    setBusy(tag);
    setError(false);
    try {
      const res = await fetch(`/api/workflow/applications/${id}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        onExpire();
        return;
      }
      if (!res.ok) {
        setError(true);
        return;
      }
      const data = await res.json();
      if (path === "assist") setSuggestion(data.suggestion || "");
      setNote("");
      await load();
    } catch {
      setError(true);
    } finally {
      setBusy(null);
    }
  }

  if (!app) return <Card>{t("off.queue.loading")}</Card>;

  const stepIdx = STEPS.indexOf(app.workflow_step as never);
  const decided = Boolean(app.decision);

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-brand-600 hover:underline">
        {t("off.back")}
      </button>

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-slate-500">{app.tracking_id}</span>
          <Badge tone="blue">{catLabel(lang, app.category)}</Badge>
          <Badge tone={urgencyTone(app.urgency)}>{urgLabel(lang, app.urgency)}</Badge>
          <Badge tone="purple">{t("off.priority", { n: app.priority_score })}</Badge>
          {app.location && <span className="text-xs text-slate-500">{app.location}</span>}
        </div>
        <p className="mt-2 text-sm font-medium text-slate-900">{app.summary}</p>
        {app.original_text && app.original_text !== app.summary && (
          <p className="mt-1 text-xs text-slate-500">{app.original_text}</p>
        )}

        {/* Step progress */}
        <div className="mt-4 flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-1">
              <div
                className={
                  "h-2 flex-1 rounded-full " +
                  (decided || i <= stepIdx ? "bg-brand-500" : "bg-slate-200")
                }
              />
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-slate-500">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={!decided && i === stepIdx ? "font-semibold text-brand-700" : ""}
            >
              {t("off.step." + s)}
            </span>
          ))}
        </div>
      </Card>

      {!decided && (
        <>
          <Card>
            <div className="text-sm font-semibold text-slate-900">{t("off.assist")}</div>
            <p className="mt-0.5 text-xs text-slate-500">{t("off.assist.note")}</p>
            <textarea
              value={fieldNote}
              onChange={(e) => setFieldNote(e.target.value)}
              rows={2}
              placeholder={t("off.fieldNote")}
              className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-brand-400"
            />
            <div className="mt-2">
              <Button
                variant="outline"
                disabled={busy !== null}
                onClick={() =>
                  act("assist", {
                    language: lang === "te" ? "Telugu" : "English",
                    field_note: fieldNote,
                  }, "assist")
                }
              >
                {busy === "assist" ? t("off.assist.loading") : t("off.assist")}
              </Button>
            </div>
            {suggestion && (
              <div className="mt-3 whitespace-pre-wrap rounded-lg border border-brand-100 bg-brand-50 p-3 text-sm text-slate-700">
                {suggestion}
              </div>
            )}
          </Card>

          <Card>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder={t("off.advance.note")}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-brand-400"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {app.workflow_step !== "decision" && (
                <Button
                  disabled={busy !== null}
                  onClick={() => act("advance", { note }, "advance")}
                >
                  {t("off.advance")}
                </Button>
              )}
            </div>
          </Card>

          <Card>
            <div className="text-sm font-semibold text-slate-900">{t("off.decision.title")}</div>
            <p className="mt-0.5 text-xs text-slate-500">{t("off.decision.you")}</p>
            <p className="mt-2 text-xs text-slate-400">{t("off.decision.note")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                disabled={busy !== null}
                onClick={() => act("decision", { decision: "approved", note }, "approve")}
              >
                {t("off.decision.approve")}
              </Button>
              <Button
                variant="outline"
                disabled={busy !== null || !note.trim()}
                onClick={() => act("decision", { decision: "rejected", note }, "reject")}
              >
                {t("off.decision.reject")}
              </Button>
              <Button
                variant="outline"
                disabled={busy !== null || !note.trim()}
                onClick={() => act("decision", { decision: "returned", note }, "return")}
              >
                {t("off.decision.return")}
              </Button>
            </div>
          </Card>
        </>
      )}

      {decided && (
        <Card className="border-emerald-200 bg-emerald-50">
          <div className="text-sm font-semibold text-emerald-900">
            {t("off.decision." + app.decision)}
          </div>
          {app.decision_note && (
            <p className="mt-1 text-sm text-emerald-800">{app.decision_note}</p>
          )}
        </Card>
      )}

      {error && <p className="text-xs text-red-600">{t("off.error")}</p>}

      <Card>
        <div className="text-sm font-semibold text-slate-900">{t("off.history")}</div>
        {!history.length ? (
          <p className="mt-2 text-xs text-slate-400">{t("off.history.empty")}</p>
        ) : (
          <ol className="mt-3 space-y-3 border-l-2 border-slate-100 pl-4">
            {[...history].reverse().map((e) => (
              <li key={e.id} className="text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-800">{e.actor}</span>
                  <span className="text-slate-600">
                    {e.action === "step_advanced" && (
                      <>
                        {t("off.ev.moved")}: {t("off.step." + (e.step_from || "received"))} →{" "}
                        {t("off.step." + (e.step_to || "received"))}
                      </>
                    )}
                    {e.action === "ai_assist" && (
                      <>
                        {t("off.ev.assist")} ({t("off.step." + (e.step_from || "received"))})
                      </>
                    )}
                    {e.action === "decision" && (
                      <>
                        {t("off.ev.decision")}:{" "}
                        <Badge
                          tone={
                            e.decision === "approved"
                              ? "green"
                              : e.decision === "rejected"
                                ? "red"
                                : "amber"
                          }
                        >
                          {t("off.decision." + (e.decision || "returned"))}
                        </Badge>
                      </>
                    )}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(e.created_at).toLocaleString(lang === "te" ? "te-IN" : "en-IN")}
                  </span>
                </div>
                {e.note && <p className="mt-0.5 text-xs text-slate-500">{e.note}</p>}
                {e.ai_suggestion && (
                  <p className="mt-0.5 whitespace-pre-wrap rounded-md bg-slate-50 p-2 text-xs text-slate-500">
                    {e.ai_suggestion}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
