from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json
import os
import datetime

from database import get_session, AuditResult, ScheduledAudit
from audit import run_audit
from alerts import send_alert, should_alert
from scheduler import start_scheduler, add_scheduled_audit, remove_scheduled_audit, list_scheduled_jobs
import anthropic

# ─────────────────────────────────────────
# APP SETUP
# ─────────────────────────────────────────

app = FastAPI(
    title="Vigil",
    description="Always watching. Always reporting.",
    version="1.0.0"
)

# Allow React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Anthropic client for AI summaries
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
anthropic_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None


# ─────────────────────────────────────────
# REQUEST MODELS
# ─────────────────────────────────────────

class AuditRequest(BaseModel):
    url: str

class ScheduleRequest(BaseModel):
    url: str
    interval_hours: int = 6
    alert_email: Optional[str] = None
    alert_threshold: float = 70.0


# ─────────────────────────────────────────
# AI SUMMARY GENERATOR
# ─────────────────────────────────────────

def generate_ai_summary(url: str, scores: dict, issues: list) -> str:
    if not anthropic_client:
        return "AI summary unavailable — set ANTHROPIC_API_KEY environment variable."

    issues_text = "\n".join([f"- {i}" for i in issues[:10]])

    prompt = f"""
You are a web auditing assistant. A site audit was just completed.

Site: {url}

Scores (out of 100):
- Performance: {scores['performance']}
- SEO: {scores['seo']}
- Accessibility (ADA/WCAG): {scores['accessibility']}
- Security: {scores['security']}
- Overall: {scores['overall']}

Issues found:
{issues_text}

Write a 2-3 sentence plain English summary for a non-technical client or business owner.
Flag any scores under 70 as urgent. Mention ADA/legal risk if accessibility is low.
Be direct and professional. Do not use bullet points.
    """.strip()

    try:
        message = anthropic_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}]
        )
        return message.content[0].text
    except Exception as e:
        print(f"[Vigil] AI summary error: {e}")
        return "AI summary could not be generated at this time."


# ─────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "Vigil is running", "version": "1.0.0"}


@app.post("/audit")
def trigger_audit(request: AuditRequest):
    """
    Run a one-time audit on a URL.
    Returns scores, issues, and an AI summary.
    """
    url = request.url.strip()
    if not url.startswith("http"):
        url = "https://" + url

    # Run the audit
    result = run_audit(url)

    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])

    # Generate AI summary — uses flat list
    result["ai_summary"] = generate_ai_summary(
        url,
        result["scores"],
        result["issues_flat"]
    )

    # Save to database — store flat list for simplicity
    with get_session() as session:
        audit_record = AuditResult(
            url=url,
            performance_score=result["scores"]["performance"],
            seo_score=result["scores"]["seo"],
            accessibility_score=result["scores"]["accessibility"],
            security_score=result["scores"]["security"],
            overall_score=result["scores"]["overall"],
            issues=json.dumps(result["issues_flat"]),
            ai_summary=result["ai_summary"]
        )
        session.add(audit_record)
        session.commit()
        session.refresh(audit_record)
        result["id"] = audit_record.id

    return result


@app.get("/history")
def get_history(url: str, limit: int = 20):
    """
    Get audit history for a specific URL.
    Used to power the trend chart on the dashboard.
    """
    with get_session() as session:
        records = (
            session.query(AuditResult)
            .filter(AuditResult.url == url)
            .order_by(AuditResult.created_at.desc())
            .limit(limit)
            .all()
        )

        if not records:
            raise HTTPException(status_code=404, detail=f"No audit history found for {url}")

        return [
            {
                "id": r.id,
                "url": r.url,
                "scores": {
                    "performance": r.performance_score,
                    "seo": r.seo_score,
                    "accessibility": r.accessibility_score,
                    "security": r.security_score,
                    "overall": r.overall_score
                },
                "issues": json.loads(r.issues) if r.issues else [],
                "ai_summary": r.ai_summary,
                "created_at": r.created_at.isoformat()
            }
            for r in records
        ]


@app.get("/results/{audit_id}")
def get_result(audit_id: int):
    """
    Get a single audit result by ID.
    """
    with get_session() as session:
        record = session.query(AuditResult).filter(AuditResult.id == audit_id).first()
        if not record:
            raise HTTPException(status_code=404, detail="Audit result not found")

        return {
            "id": record.id,
            "url": record.url,
            "scores": {
                "performance": record.performance_score,
                "seo": record.seo_score,
                "accessibility": record.accessibility_score,
                "security": record.security_score,
                "overall": record.overall_score
            },
            "issues": json.loads(record.issues) if record.issues else [],
            "ai_summary": record.ai_summary,
            "created_at": record.created_at.isoformat()
        }


@app.post("/schedule")
def create_schedule(request: ScheduleRequest):
    """
    Set up a recurring audit for a URL.
    """
    url = request.url.strip()
    if not url.startswith("http"):
        url = "https://" + url

    with get_session() as session:
        scheduled = ScheduledAudit(
            url=url,
            interval_hours=request.interval_hours,
            alert_email=request.alert_email,
            alert_threshold=request.alert_threshold
        )
        session.add(scheduled)
        session.commit()
        session.refresh(scheduled)
        audit_id = scheduled.id

    # Register with scheduler
    add_scheduled_audit(
        audit_id=audit_id,
        url=url,
        interval_hours=request.interval_hours,
        run_audit_fn=run_scheduled_audit
    )

    return {
        "message": f"Scheduled audit every {request.interval_hours} hours for {url}",
        "schedule_id": audit_id,
        "next_run_in_hours": request.interval_hours
    }


@app.delete("/schedule/{schedule_id}")
def delete_schedule(schedule_id: int):
    """
    Cancel a scheduled audit.
    """
    with get_session() as session:
        scheduled = session.query(ScheduledAudit).filter(ScheduledAudit.id == schedule_id).first()
        if not scheduled:
            raise HTTPException(status_code=404, detail="Schedule not found")
        scheduled.is_active = 0
        session.commit()

    remove_scheduled_audit(schedule_id)
    return {"message": f"Schedule #{schedule_id} cancelled"}


@app.get("/schedules")
def list_schedules():
    """
    List all active scheduled audits.
    """
    with get_session() as session:
        schedules = (
            session.query(ScheduledAudit)
            .filter(ScheduledAudit.is_active == 1)
            .all()
        )
        return [
            {
                "id": s.id,
                "url": s.url,
                "interval_hours": s.interval_hours,
                "alert_email": s.alert_email,
                "alert_threshold": s.alert_threshold,
                "created_at": s.created_at.isoformat(),
                "last_run_at": s.last_run_at.isoformat() if s.last_run_at else None
            }
            for s in schedules
        ]


@app.get("/scheduler/jobs")
def get_scheduler_jobs():
    """
    See all currently running scheduler jobs.
    Useful for debugging.
    """
    return list_scheduled_jobs()


# ─────────────────────────────────────────
# SCHEDULED AUDIT RUNNER
# (called automatically by APScheduler)
# ─────────────────────────────────────────

def run_scheduled_audit(url: str):
    """
    Runs an audit automatically on a schedule.
    Sends an alert email if scores drop below threshold.
    """
    print(f"[Vigil] Running scheduled audit for {url}")

    result = run_audit(url)
    if result.get("error"):
        print(f"[Vigil] Scheduled audit failed for {url}: {result['error']}")
        return

    result["ai_summary"] = generate_ai_summary(url, result["scores"], result["issues_flat"])

    # Save to DB
    with get_session() as session:
        audit_record = AuditResult(
            url=url,
            performance_score=result["scores"]["performance"],
            seo_score=result["scores"]["seo"],
            accessibility_score=result["scores"]["accessibility"],
            security_score=result["scores"]["security"],
            overall_score=result["scores"]["overall"],
            issues=json.dumps(result["issues_flat"]),
            ai_summary=result["ai_summary"]
        )
        session.add(audit_record)

        # Update last_run_at on the schedule
        schedule = session.query(ScheduledAudit).filter(ScheduledAudit.url == url).first()
        if schedule:
            schedule.last_run_at = datetime.datetime.utcnow()

        session.commit()

    # Send alert if scores are low
    with get_session() as session:
        schedule = session.query(ScheduledAudit).filter(ScheduledAudit.url == url).first()
        if schedule and schedule.alert_email:
            if should_alert(result["scores"], schedule.alert_threshold):
                send_alert(
                    to_email=schedule.alert_email,
                    url=url,
                    scores=result["scores"],
                    issues=result["issues_flat"]
                )


# ─────────────────────────────────────────
# STARTUP / SHUTDOWN
# ─────────────────────────────────────────

@app.on_event("startup")
def startup():
    start_scheduler()

    # Re-register any active schedules from DB on server restart
    with get_session() as session:
        active_schedules = session.query(ScheduledAudit).filter(ScheduledAudit.is_active == 1).all()
        for s in active_schedules:
            add_scheduled_audit(
                audit_id=s.id,
                url=s.url,
                interval_hours=s.interval_hours,
                run_audit_fn=run_scheduled_audit
            )
        print(f"[Vigil] Restored {len(active_schedules)} scheduled audit(s) from database")


@app.on_event("shutdown")
def shutdown():
    from scheduler import stop_scheduler
    stop_scheduler()