# Vigil

**Vigil** is an automated website monitoring platform built during **HackYSU 2026**.

The system continuously audits websites across four critical dimensions:

- Performance
- SEO
- Accessibility
- Security

Instead of running manual audits occasionally, Vigil was designed to monitor website health over time, track score changes, and notify users when issues appear.

⚠️ This repository is preserved as a **hackathon project showcase**.  
The live deployment and infrastructure used during development are no longer actively maintained.

---

# Project Overview

Modern websites frequently degrade over time due to updates, configuration changes, or overlooked issues. Many teams only discover problems after they impact users, search rankings, or accessibility compliance.

Vigil was created to provide a **continuous monitoring solution** that automatically audits websites and tracks their health across multiple categories.

The goal was to move teams from **reactive debugging** to **proactive monitoring**.

---

# Key Features

## Automated Website Audits

Vigil allows users to run a full audit on any website URL.

Each audit evaluates the site across four categories:

- Performance
- SEO
- Accessibility
- Security

Each category produces an individual score along with an overall site health score.

---

## Historical Monitoring

Instead of a single audit snapshot, Vigil stores previous results to allow users to observe how website health changes over time.

Features included:

- Historical score tracking
- Trend visualization
- Detection of regressions after updates

---

## Scheduled Monitoring

Vigil supports automated recurring audits.

Users could configure monitoring intervals such as:

- Every 6 hours
- Every 12 hours
- Every 24 hours

This allows continuous monitoring rather than one-time scans.

---

## Alert System

Users could configure alert thresholds for monitored websites.

If the site score dropped below a defined threshold, Vigil would send an email notification so teams could quickly investigate the issue.

---

## Guest Mode

Vigil supported guest audits without requiring account creation.

Guest audit results were:

- Stored locally in the browser
- Importable into a user account after signup

---

## Authentication System

The platform included a secure authentication system with:

- User signup
- Email OTP verification
- JWT-based login sessions
- Password reset via email token

---

## AI Audit Summaries

The system also included infrastructure for generating AI-powered summaries explaining:

- Detected issues
- Why they matter
- Suggested fixes

---

# Technology Stack

## Frontend

- React
- Vite
- React Router
- TailwindCSS
- Recharts
- Vitest
- ESLint

---

## Backend

- Python 3.11
- FastAPI
- Uvicorn
- SQLAlchemy
- SQLite (development)
- PostgreSQL (production design)
- JWT Authentication
- APScheduler
- AWS SES (email delivery)
- BeautifulSoup
- Requests

---

# How Vigil Audits Websites

Vigil analyzes websites across four primary categories.

---

## Performance

Performance checks included:

- Page load time
- HTML payload size
- Compression usage
- Render blocking scripts
- Missing image dimensions
- Inline styles
- Missing viewport meta tag

These checks help ensure websites load efficiently and follow performance best practices.

---

## SEO

SEO checks included:

- Title tag presence
- Meta description
- H1 usage
- Missing image alt text
- Canonical tags
- Open Graph tags
- robots.txt
- sitemap.xml
- Broken internal links
- Heading hierarchy
- Structured data

These checks help websites follow search engine optimization best practices.

---

## Accessibility

Accessibility checks were based on **WCAG accessibility guidelines**, including:

- Missing alt text
- Form labels
- ARIA usage
- Color contrast
- Keyboard navigation
- Landmarks
- Focus indicators
- Readability

These checks help ensure websites remain usable for people with disabilities.

---

## Security

Security checks included:

- HTTPS enforcement
- Security headers
- Mixed content
- Missing HSTS configuration
- SSL/TLS configuration
- Vulnerable JavaScript libraries

These checks help detect common security misconfigurations.

---

# Scoring System

Vigil calculates an overall website health score using a weighted average.

| Category | Weight |
|--------|--------|
| Performance | 25% |
| SEO | 25% |
| Accessibility | 30% |
| Security | 20% |

The weighted score helps provide a quick overview of a site's health.

---

# Project Structure

```
vigil/
  backend/
    main.py
    audit.py
    database.py
    auth.py
    alerts.py
    scheduler.py

  frontend/
    src/
      api.js
      App.jsx
      contexts/
      pages/
      components/
      utils/
      __tests__/
```

---

# Development Notes

The project was developed as part of a **36-hour hackathon build** and was designed with scalability in mind.

The architecture supports:

- Scheduled audit workers
- Historical audit storage
- Email notifications
- Future cloud deployment

During development, the system ran locally with working authentication, auditing, scheduling, and email notifications.

---

# Built At

**HackYSU 2026**

This project was created during a 36-hour hackathon to explore automated monitoring tools for modern websites.

---

# Project Status

This repository is maintained as a **past project showcase**.

The original development environment and deployment used during the hackathon are no longer actively maintained.

---

# Summary

Vigil was designed as a **continuous watchdog for websites**.

Instead of manually checking sites only when problems appear, teams could:

- Automatically audit websites
- Track health over time
- Detect regressions early
- Receive alerts when issues appear

The project demonstrates a full-stack monitoring platform built with modern web technologies.