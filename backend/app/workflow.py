from __future__ import annotations

import secrets
from datetime import timedelta

from fastapi import HTTPException, Request

from .ai import get_chat
from .config import settings
from .db import (
    application_events,
    issue_clusters,
    jsonify,
    locations,
    now,
    oid,
    sessions,
    submissions,
)

# ---------------------------------------------------------------------------
# Officer workflow: each submission is an application that moves through
# fixed steps to a human decision. Every move, AI suggestion and decision is
# recorded in application_events (the decision log / human review history).
# ---------------------------------------------------------------------------

WORKFLOW_STEPS = ["received", "details_check", "field_check", "decision"]
DECISIONS = ["approved", "rejected", "returned"]

URGENCY_WEIGHT = {"Low": 0.25, "Medium": 0.5, "High": 0.8, "Critical": 1.0}

STEP_LABELS_TE = {
    "received": "స్వీకరించబడింది",
    "details_check": "వివరాల పరిశీలన",
    "field_check": "క్షేత్ర పరిశీలన",
    "decision": "నిర్ణయం",
}

_ASSIST_PROMPTS = {
    "received": (
        "You are assisting a government field officer triaging a new citizen grievance application. "
        "Summarize the application in 2-3 short sentences, state the category and urgency, and say what the officer should check first."
    ),
    "details_check": (
        "You are assisting a government field officer verifying the details of a citizen grievance application. "
        "Check completeness: is the location specific enough, is the problem described clearly, is anything inconsistent or missing? "
        "Give a short verification checklist of 2-4 items."
    ),
    "field_check": (
        "You are assisting a government field officer after a field visit for a citizen grievance application. "
        "Based on the application and any field note, summarize what should be confirmed on the ground and what evidence to record. "
        "Keep it to 2-4 short points."
    ),
    "decision": (
        "You are assisting a government field officer making the final decision on a citizen grievance application. "
        "Give a balanced recommendation (approve / reject / return for more information) with the main reason for and against. "
        "Make clear the officer decides, not you. Keep it to 3-4 short sentences."
    ),
}


# ------------------------------- Auth --------------------------------------


def login(body: dict) -> dict:
    username = (body.get("username") or "").strip()
    password = body.get("password") or ""
    if username != settings.officer_username or password != settings.officer_password:
        raise HTTPException(status_code=401, detail="invalid_credentials")
    token = secrets.token_urlsafe(24)
    sessions().insert_one(
        {"token": token, "actor": username, "created_at": now(),
         "expires_at": now() + timedelta(days=7)}
    )
    return {"ok": True, "token": token, "actor": username}


def require_officer(request: Request) -> str:
    auth = request.headers.get("authorization") or ""
    token = auth.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=401, detail="login_required")
    s = sessions().find_one({"token": token})
    if not s or s.get("expires_at", now()) < now():
        raise HTTPException(status_code=401, detail="login_required")
    return s.get("actor") or "officer"


# ------------------------------- Helpers -----------------------------------


def _record_event(
    submission_id,
    action: str,
    actor: str,
    step_from: str | None = None,
    step_to: str | None = None,
    note: str = "",
    ai_suggestion: str = "",
    decision: str | None = None,
) -> None:
    """Append one entry to the decision log. Never raises."""
    try:
        application_events().insert_one(
            {
                "submission_id": submission_id,
                "action": action,
                "actor": actor,
                "step_from": step_from,
                "step_to": step_to,
                "note": (note or "")[:1000],
                "ai_suggestion": (ai_suggestion or "")[:4000],
                "decision": decision,
                "created_at": now(),
            }
        )
    except Exception:
        pass


def _cluster_scores(sub_ids_clusters) -> dict:
    cids = [c for c in sub_ids_clusters if c]
    score = {}
    for c in issue_clusters().find({"_id": {"$in": cids}}):
        score[str(c["_id"])] = c.get("priority_score", 0)
    return score


def _location_names(subs) -> dict:
    loc_ids = [s["location_id"] for s in subs if s.get("location_id")]
    return {
        str(l["_id"]): l["name"]
        for l in locations().find({"_id": {"$in": loc_ids}})
    }


def _application_view(s: dict, loc_name: dict, score: dict) -> dict:
    return {
        "id": str(s["_id"]),
        "tracking_id": s.get("tracking_id"),
        "summary": s.get("summary"),
        "original_text": s.get("original_text"),
        "language": s.get("language"),
        "category": s.get("category"),
        "urgency": s.get("urgency"),
        "location": loc_name.get(str(s.get("location_id"))) if s.get("location_id") else None,
        "workflow_step": s.get("workflow_step") or "received",
        "decision": s.get("decision"),
        "decision_note": s.get("decision_note"),
        "priority_score": score.get(str(s.get("cluster_id")), 0),
        "created_at": jsonify(s.get("created_at")),
    }


# ------------------------------- Queue -------------------------------------


def workflow_queue(actor: str) -> dict:
    subs = list(submissions().find({"decision": {"$exists": False}}).limit(500))
    subs += list(submissions().find({"decision": None}).limit(500))
    # de-duplicate
    seen, unique = set(), []
    for s in subs:
        if str(s["_id"]) not in seen:
            seen.add(str(s["_id"]))
            unique.append(s)
    loc_name = _location_names(unique)
    score = _cluster_scores([s.get("cluster_id") for s in unique])

    def rank(s):
        return (
            -score.get(str(s.get("cluster_id")), 0),
            -URGENCY_WEIGHT.get(s.get("urgency") or "Medium", 0.5),
            s.get("created_at") or now(),
        )

    unique.sort(key=rank)
    return {
        "applications": [_application_view(s, loc_name, score) for s in unique[:100]],
        "steps": WORKFLOW_STEPS,
    }


def workflow_application(submission_id: str, actor: str) -> dict:
    s = submissions().find_one({"_id": oid(submission_id)})
    if not s:
        raise HTTPException(status_code=404, detail="not_found")
    loc_name = _location_names([s])
    score = _cluster_scores([s.get("cluster_id")])
    events = list(
        application_events().find({"submission_id": s["_id"]}).sort("created_at", 1)
    )
    return {
        "application": _application_view(s, loc_name, score),
        "steps": WORKFLOW_STEPS,
        "history": [jsonify({**e, "submission_id": str(e["submission_id"])}) for e in events],
    }


# ------------------------------- Moves -------------------------------------


def advance(submission_id: str, body: dict, actor: str) -> dict:
    s = submissions().find_one({"_id": oid(submission_id)})
    if not s:
        raise HTTPException(status_code=404, detail="not_found")
    if s.get("decision"):
        raise HTTPException(status_code=409, detail="already_decided")
    current = s.get("workflow_step") or "received"
    idx = WORKFLOW_STEPS.index(current) if current in WORKFLOW_STEPS else 0
    if idx >= len(WORKFLOW_STEPS) - 1:
        raise HTTPException(status_code=409, detail="use_decision_endpoint")
    nxt = WORKFLOW_STEPS[idx + 1]
    note = (body.get("note") or "").strip()
    submissions().update_one(
        {"_id": s["_id"]}, {"$set": {"workflow_step": nxt, "updated_at": now()}}
    )
    _record_event(s["_id"], "step_advanced", actor, step_from=current, step_to=nxt, note=note)
    return {"moved": True, "step_from": current, "step_to": nxt}


def decide(submission_id: str, body: dict, actor: str) -> dict:
    s = submissions().find_one({"_id": oid(submission_id)})
    if not s:
        raise HTTPException(status_code=404, detail="not_found")
    if s.get("decision"):
        raise HTTPException(status_code=409, detail="already_decided")
    decision = (body.get("decision") or "").strip()
    note = (body.get("note") or "").strip()
    if decision not in DECISIONS:
        raise HTTPException(status_code=400, detail="invalid_decision")
    if decision in ("rejected", "returned") and not note:
        raise HTTPException(status_code=400, detail="note_required")
    # The officer must be at the decision step to decide.
    current = s.get("workflow_step") or "received"
    update = {
        "workflow_step": "decision",
        "decision": decision,
        "decision_note": note,
        "decided_by": actor,
        "decided_at": now(),
        "updated_at": now(),
    }
    submissions().update_one({"_id": s["_id"]}, {"$set": update})
    _record_event(
        s["_id"], "decision", actor, step_from=current, step_to="decision",
        note=note, decision=decision,
    )
    return {"decided": True, "decision": decision, "decided_by": actor}


# ------------------------------- AI assist ---------------------------------


def assist(submission_id: str, body: dict, actor: str) -> dict:
    s = submissions().find_one({"_id": oid(submission_id)})
    if not s:
        raise HTTPException(status_code=404, detail="not_found")
    step = s.get("workflow_step") or "received"
    lang = (body.get("language") or "Telugu").strip()
    field_note = (body.get("field_note") or "").strip()

    system = _ASSIST_PROMPTS.get(step, _ASSIST_PROMPTS["received"])
    system += f"\nReply in {lang}. Plain, short sentences a field worker can act on."
    user = (
        f"Application ({s.get('tracking_id')}):\n"
        f"Summary: {s.get('summary')}\n"
        f"Original note: {s.get('original_text')}\n"
        f"Category: {s.get('category')} | Urgency: {s.get('urgency')}\n"
        f"Current step: {step}\n"
        + (f"Officer's field note: {field_note}\n" if field_note else "")
    )
    try:
        msg = get_chat().invoke(
            [{"role": "system", "content": system}, {"role": "user", "content": user}]
        )
        suggestion = (msg.content or "").strip()
    except Exception:
        # Deterministic fallback so the demo never breaks without an LLM key.
        suggestion = (
            f"Step: {step}. Review the summary, confirm the location, and record "
            "what you verified before moving the application forward."
        )
    _record_event(s["_id"], "ai_assist", actor, step_from=step, ai_suggestion=suggestion)
    return {"step": step, "suggestion": suggestion}
