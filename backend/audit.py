import requests
from bs4 import BeautifulSoup
import time
import json
from urllib.parse import urljoin, urlparse



# -----------------------------------------
# Main Audit Function
# -----------------------------------------
def run_audit(url: str) -> dict:
    """
    Runs a full audit on a URL.
    Returns scores for performance, SEO, accessibility, security,
    a list of issues found, and an overall score.
    """
    print(f"[Vigil] Starting audit for {url}")

    # Fetch the page
    page = fetch_page(url)
    if page is None:
        return error_result(url, "Could not fetch the page. Check the URL and try again.")

    html = page["html"]
    load_time = page["load_time"]
    response = page["response"]
    soup = BeautifulSoup(html, "html.parser")

    # Run each audit module
    performance = audit_performance(soup, html, load_time)
    seo = audit_seo(soup, url)
    accessibility = audit_accessibility(soup)
    security = audit_security(url, response)

    # Collect all issues
    all_issues = (
            performance["issues"] +
            seo["issues"] +
            accessibility["issues"] +
            security["issues"]
    )

    # Calculate overall score (weighted average)
    overall = round(
        (performance["score"] * 0.25) +
        (seo["score"] * 0.25) +
        (accessibility["score"] * 0.30) +   # weighted higher — legal risk
        (security["score"] * 0.20),
        1
    )

    result = {
        "url": url,
        "scores": {
            "performance": performance["score"],
            "seo": seo["score"],
            "accessibility": accessibility["score"],
            "security": security["score"],
            "overall": overall
        },
        "issues": all_issues,
        "ai_summary": None,   # filled in by main.py after Anthropic call
        "error": None
    }

    print(f"[Vigil] Audit complete for {url} — Overall: {overall}")
    return result



# --------------------------------------------
# Page Fetcher
# --------------------------------------------

def fetch_page (url:str) -> dict | None:
    headers = {
        "User Agent" : (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36 "
        )
    }

    try:
        start = time.time()
        response = requests.get(url, headers=headers, timeout=5)
        load_time = round (time.time() - start, 2)

        return {
            "html" : response.text,
            "load_time" : load_time,
            "response" : response
        }

    except requests.exceptions.RequestException as e:
        print(f"[Vigil] Fetch error: {e}")
        return None



# --------------------------------------------
# Performance audit
# --------------------------------------------
def audit_performance (soup, html:str, load_time: float) -> dict:
    issues = []
    score = 100

    # load time penalty
    if load_time > 3:
        issues.append (f"Slow load time: {load_time}s (target: under 3s)")
        score -= 30
    elif load_time > 1.5:
        issues.apend (f"Moderte load time: {load_time}s (target: under 1.5s)")
        score -= 15

    # page size check (rough estimate from HTML length)
    html_size_kb = len (html.encode ("utf-8")) / 1024
    if html_size_kb > 500:
        issues.append(f"Large HTML size: {round(html_size_kb)} KB (target: under 500 KB)")
        score -= 10

    # Render-blocking scripts in <head>
    head = soup.find ("head")
    blocking_scripts = 0
    if head:
        for script in head.find_all ("script", src=True):
            if not script.get("async") and not script.get("defer"):
                blocking_scripts += 1

    if blocking_scripts > 0:
        issues.append(f"{blocking_scripts} render-blocking script(s) found in <head>")
        score -= blocking_scripts * 5

    # Images without width/height (causes layout shift)
    unsized_images = 0
    for img in soup.find_all("img"):
        if not img.get("width") or not img.get("height"):
            unsized_images += 1
    if unsized_images > 3:
        issues.append(f"{unsized_images} images missing width/height (causes layout shift)")
        score -= 10

    return {"score": max(score, 0), "issues": issues}



# --------------------------------------------
# SEO AUDIT
# --------------------------------------------
def audit_seo(soup, url: str) -> dict:
    issues = []
    score = 100

    # Title tag
    title = soup.find("title")
    if not title or not title.text.strip():
        issues.append("Missing <title> tag")
        score -= 20
    elif len(title.text.strip()) > 60:
        issues.append(f"Title tag too long: {len(title.text.strip())} chars (target: under 60)")
        score -= 5

    # Meta description
    meta_desc = soup.find("meta", {"name": "description"})
    if not meta_desc or not meta_desc.get("content", "").strip():
        issues.append("Missing meta description")
        score -= 15
    elif len(meta_desc.get("content", "")) > 160:
        issues.append("Meta description too long (target: under 160 chars)")
        score -= 5

    # H1 tag
    h1_tags = soup.find_all("h1")
    if len(h1_tags) == 0:
        issues.append("No <h1> tag found on page")
        score -= 15
    elif len(h1_tags) > 1:
        issues.append(f"Multiple <h1> tags found ({len(h1_tags)}) — should only have one")
        score -= 10

    # Images missing alt text (SEO + accessibility overlap)
    images_no_alt = [img for img in soup.find_all("img") if not img.get("alt")]
    if images_no_alt:
        issues.append(f"{len(images_no_alt)} image(s) missing alt text")
        score -= min(len(images_no_alt) * 3, 15)

    # Canonical tag
    canonical = soup.find("link", {"rel": "canonical"})
    if not canonical:
        issues.append("No canonical tag found")
        score -= 5

    # Open Graph tags (social sharing)
    og_title = soup.find("meta", {"property": "og:title"})
    if not og_title:
        issues.append("Missing Open Graph tags (og:title) — affects social sharing")
        score -= 5

    return {"score": max(score, 0), "issues": issues}



# --------------------------------------------
# ACCESSIBILITY AUDIT (WCAG AA)
# --------------------------------------------
def audit_accessibility(soup) -> dict:
    issues = []
    score = 100

    # Images missing alt text
    images_no_alt = [img for img in soup.find_all("img") if not img.get("alt")]
    if images_no_alt:
        issues.append(f"ADA: {len(images_no_alt)} image(s) missing alt text (WCAG 1.1.1)")
        score -= min(len(images_no_alt) * 5, 25)

    # Form inputs missing labels
    inputs = soup.find_all("input", {"type": lambda x: x not in ["hidden", "submit", "button"]})
    unlabeled = 0
    for inp in inputs:
        input_id = inp.get("id")
        has_label = False
        if input_id:
            has_label = bool(soup.find("label", {"for": input_id}))
        has_aria = inp.get("aria-label") or inp.get("aria-labelledby")
        if not has_label and not has_aria:
            unlabeled += 1
    if unlabeled > 0:
        issues.append(f"ADA: {unlabeled} form input(s) missing labels (WCAG 1.3.1)")
        score -= min(unlabeled * 8, 20)

    # Buttons with no text
    empty_buttons = []
    for btn in soup.find_all("button"):
        if not btn.text.strip() and not btn.get("aria-label"):
            empty_buttons.append(btn)
    if empty_buttons:
        issues.append(f"ADA: {len(empty_buttons)} button(s) with no text or aria-label (WCAG 4.1.2)")
        score -= min(len(empty_buttons) * 5, 15)

    # Links with no descriptive text
    vague_links = []
    for a in soup.find_all("a"):
        text = a.text.strip().lower()
        if text in ["click here", "here", "read more", "more", "link"]:
            vague_links.append(text)
    if vague_links:
        issues.append(f"ADA: {len(vague_links)} link(s) with non-descriptive text like 'click here' (WCAG 2.4.4)")
        score -= min(len(vague_links) * 3, 10)

    # Missing lang attribute on <html>
    html_tag = soup.find("html")
    if html_tag and not html_tag.get("lang"):
        issues.append("ADA: <html> tag missing lang attribute (WCAG 3.1.1)")
        score -= 10

    # Missing skip navigation link
    skip_link = soup.find("a", href="#main") or soup.find("a", href="#content")
    if not skip_link:
        issues.append("ADA: No skip navigation link found (WCAG 2.4.1)")
        score -= 5

    return {"score": max(score, 0), "issues": issues}



# --------------------------------------------
# SECURITY AUDIT
# --------------------------------------------
def audit_security(url: str, response) -> dict:
    issues = []
    score = 100
    headers = response.headers

    # HTTPS check
    if not url.startswith("https://"):
        issues.append("Site is not using HTTPS — data is transmitted insecurely")
        score -= 40

    # Security headers
    if not headers.get("X-Frame-Options"):
        issues.append("Missing X-Frame-Options header (clickjacking risk)")
        score -= 10

    if not headers.get("X-Content-Type-Options"):
        issues.append("Missing X-Content-Type-Options header (MIME sniffing risk)")
        score -= 10

    if not headers.get("Strict-Transport-Security"):
        issues.append("Missing Strict-Transport-Security (HSTS) header")
        score -= 10

    if not headers.get("Content-Security-Policy"):
        issues.append("Missing Content-Security-Policy header (XSS risk)")
        score -= 15

    if not headers.get("Referrer-Policy"):
        issues.append("Missing Referrer-Policy header")
        score -= 5

    # Server header exposure
    server = headers.get("Server", "")
    if server and any(v in server.lower() for v in ["apache", "nginx", "iis", "php"]):
        issues.append(f"Server header exposes technology stack: '{server}'")
        score -= 10

    return {"score": max(score, 0), "issues": issues}



# --------------------------------------------
# ERROR RESULT HELPER
# --------------------------------------------
def error_result(url: str, message: str) -> dict:
    return {
        "url": url,
        "scores": {
            "performance": 0,
            "seo": 0,
            "accessibility": 0,
            "security": 0,
            "overall": 0
        },
        "issues": [message],
        "ai_summary": None,
        "error": message
    }
