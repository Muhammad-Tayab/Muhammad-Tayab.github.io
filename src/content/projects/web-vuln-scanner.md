---
title: "Web Vulnerability Scanner"
status: "coming-soon"
stack: ["Python", "Requests", "BeautifulSoup", "Asyncio"]
github: ""
liveUrl: ""
excerpt: "A custom web vulnerability scanner targeting common OWASP Top 10 vulnerabilities — SQLi, XSS, SSRF, open redirects, and misconfigurations — with minimal false positives."
featured: false
---

# Web Vulnerability Scanner

**Status:** Planned
**Category:** Security Tooling

## Concept

Most open-source scanners have terrible false positive rates. This scanner is built around precision — only flagging things I can confirm with a proof-of-concept payload, not just pattern matching.

## Target Vulnerabilities

- SQL Injection (error-based, boolean-based blind, time-based blind)
- Reflected and Stored XSS
- SSRF (with Burp Collaborator / interactsh integration)
- Open Redirects
- CORS misconfigurations
- Missing security headers
- Directory traversal
- Sensitive file exposure (.env, .git, backup files)

## Architecture Plan

- Async Python (asyncio + aiohttp) for high-performance concurrent scanning
- Plugin architecture — each vulnerability class is a separate module
- Rate limiting and respect for robots.txt
- Output: JSON, HTML report, and Burp Suite-compatible XML
