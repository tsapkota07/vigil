import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

SENDER_EMAIL = os.getenv("VIGIL_EMAIL_ADDRESS", "")       #check .env.example
SENDER_PASSWORD = os.getenv("VIGIL_EMAIL_PASSWORD", "")   


def send_alert(to_email: str, url: str, scores: dict, issues: list):
    """
    Sends an email alert when a score drops below the threshold.
    """
    if not SENDER_EMAIL or not SENDER_PASSWORD:
        print("[Vigil] Email not configured — skipping alert")
        return

    subject = f"Vigil Alert: Score drop detected on {url}"

    score_lines = "\n".join([
        f"  • Performance:   {scores['performance']}/100",
        f"  • SEO:           {scores['seo']}/100",
        f"  • Accessibility: {scores['accessibility']}/100",
        f"  • Security:      {scores['security']}/100",
        f"  • Overall:       {scores['overall']}/100",
    ])

    issue_lines = "\n".join([f"  - {issue}" for issue in issues[:10]])  # capped at 10 issues
    if len(issues) > 10:
        issue_lines += f"\n  ... and {len(issues) - 10} more issues"

    body = f"""
Vigil has detected issues on a monitored site.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Site: {url}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current Scores:
{score_lines}

Issues Found:
{issue_lines}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This alert was sent automatically by Vigil.
Always watching. Always reporting.
    """.strip()

    try:
        msg = MIMEMultipart()
        msg["From"] = SENDER_EMAIL
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, to_email, msg.as_string())

        print(f"[Vigil] Alert sent to {to_email} for {url}")

    except Exception as e:
        print(f"[Vigil] Failed to send alert: {e}")


def send_reset_email(to_email: str, username: str, reset_url: str):
    """Sends a password reset link to the user."""
    if not SENDER_EMAIL or not SENDER_PASSWORD:
        print("[Vigil] Email not configured — skipping reset email")
        return

    subject = "Vigil — Password Reset Request"
    body = f"""Hi {username},

You requested a password reset for your Vigil account.

Click the link below to reset your password (expires in 1 hour):
{reset_url}

If you didn't request this, you can safely ignore this email.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vigil — Always watching. Always reporting.""".strip()

    try:
        msg = MIMEMultipart()
        msg["From"] = SENDER_EMAIL
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, to_email, msg.as_string())

        print(f"[Vigil] Password reset email sent to {to_email}")
    except Exception as e:
        print(f"[Vigil] Failed to send reset email: {e}")


def should_alert(scores: dict, threshold: float) -> bool:
    """
    Returns True if any score is below the threshold.
    """
    return any(
        v < threshold
        for k, v in scores.items()
        if k != "overall"
    )