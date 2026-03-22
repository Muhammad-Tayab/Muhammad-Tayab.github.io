---
title: "How Braze's Email Infrastructure Leaks Sensitive URLs at Scale"
date: 2026-03-22
tags: ["bug-bounty", "email-security", "recon", "osint", "responsible-disclosure"]
excerpt: "I found hundreds of Braze-hosted one-click unsubscribe URLs publicly indexed on urlscan.io — with encrypted tokens fully intact. Braze closed it as Informative. Here's why that's the wrong call."
published: true
platform: "blog"
---

# How Braze's Email Infrastructure Leaks Sensitive URLs at Scale (and Why They Closed It as Informative)

*By Muhammad Tayab Bashir | Security Research*

---

So I found something interesting in Braze's email infrastructure. Submitted it. Got told it's "Informative." Classic.

But since the finding is genuinely novel and the community deserves to know about it, here we are. Grab a coffee. This one's a bit of a story.

---

## How It Started (Accidentally, Like All Good Things)

I wasn't specifically hunting Braze. I was doing what every bored security researcher does at 2am — poking around urlscan.io looking for interesting stuff — when something caught my eye.

Braze-hosted URLs. Lots of them. Publicly indexed. Containing one-click unsubscribe links, preference center URLs, and tracking endpoints — with their encrypted tokens fully intact and searchable.

My first thought: *surely not.*

My second thought: *oh no.*

---

## Quick Background: What Even Is a One-Click Unsubscribe?

If you've ever hit "Unsubscribe" inside Gmail without leaving your inbox, you've used one-click unsubscribe. It's mandated by RFC 8058 and enforced by major inbox providers like Google and Yahoo for bulk senders. The way it works is dead simple — a single GET request to a URL unsubscribes the user. No login, no CAPTCHA, no confirmation page — just click, done.

The security model is entirely token-based. The URL looks roughly like:

```
https://links.customer.com/unsubscribe?token=eyJhbGciOiJIUzI1NiIsIn...
```

The token is encrypted and *theoretically* unguessable. You don't know what's inside it so you can't forge it. Security through obscurity — but honestly it's the only real option given the legal constraints around email.

Here's the problem: what if the token stops being secret?

---

## The Finding: URL Scanners Are Doing Your Recon For You

Here's what happens in the real world:

1. A company sends marketing emails to hundreds of thousands of users
2. Some of those users have browser extensions — security tools, phishing checkers, corporate proxies — that automatically submit URLs to scanning services
3. urlscan.io, CommonCrawl, and similar platforms happily log and index those URLs
4. The token — which was supposed to be secret — is now sitting in a public, searchable database

The encrypted token is no longer secret. The entire security model just evaporated.

Through passive recon (I cannot stress *passive* enough — purely reading what's already publicly indexed, zero touching of production systems), I identified a significant number of Braze-hosted unsubscribe and list management URLs indexed this way. Hundreds of confirmed URLs spanning multiple Braze client companies across different industries.

The irony is almost poetic: the security tools your users install to *protect* themselves are the exact mechanism creating this exposure.

---

## Braze's Response — A Study in Missing the Point

To be fair, Braze's security team (brazeappsec) responded in detail. Their main counterpoints:

**"One-click unsubscribe is a legal requirement, we can't add auth to it"**

Yes, I know. I said that in the report. The issue isn't the design of the URL. It's that your infrastructure is feeding these URLs into public scanning databases at scale.

**"Tokens are encrypted so they can't be guessed or brute forced"**

Also correct. But they *can be read directly from urlscan.io*. Encryption doesn't help if the ciphertext is sitting in a public index.

**"Emails aren't always opened within 24–48 hours so we can't use short-lived tokens"**

Fair point. Didn't argue this one.

**"Some of these are customer domains, we can't control their misconfigurations"**

Also fair — and actually a secondary finding. Braze's enterprise clients are inheriting this exposure without knowing it.

**"We already have robots.txt on all our domains"**

Cool. That stops *future* indexing. Doesn't help with the thousands of URLs already cached.

Report closed: **Informative**. No bounty, no fix committed, no acknowledgment that this is a systemic pattern worth addressing.

---

## Why "Informative" Is The Wrong Call

Braze's response is technically accurate on each individual point. But it completely misses the forest for the trees.

The combination of:

- ✅ Long-lived tokens (legally necessary)
- ✅ Unauthenticated single-GET actions (RFC 8058 compliant)
- ❌ No mechanism to detect/respond when those URLs get indexed publicly

...creates a systemic exposure that affects not just Braze's infrastructure but every enterprise client sending email through them. This isn't a single misconfiguration you can point a finger at — it's a class of vulnerability sitting at the intersection of email compliance standards and modern security tooling infrastructure.

---

## What Could Actually Help

Not here to just complain, so here are realistic mitigations:

**For Braze and similar platforms:**
- Monitor public scanning databases (urlscan.io has an API) for your own infrastructure URLs and invalidate exposed tokens proactively
- Register all owned infrastructure domains with urlscan.io's organizational opt-out
- Notify clients when their email tracking domains start appearing in public scan results

**For Braze's clients:**
- Search urlscan.io for your own domains right now — you might be surprised
- If you're running custom tracking domains, understand that your users' security tools may be indexing every URL you send them
- Consider periodic token audits as part of your email security posture

**For everyone else:**
- Your "helpful" browser security extensions may be indexing every URL from every email you open and submitting it to third-party databases. Just something to be aware of.

---

## Conclusion

I reported this to Braze in good faith. They engaged, explained their position, and closed it as Informative. I disagree with the severity assessment — which is exactly why this writeup exists.

Security research doesn't benefit anyone when it dies quietly in a vendor's ticketing system. The pattern here — long-lived unauthenticated action URLs getting passively indexed by third-party scanning infrastructure — is real, reproducible, and affects the broader email marketing ecosystem well beyond Braze.

If you're a security engineer at an ESP or marketing platform: go run your domains through urlscan.io right now. Seriously. I'll wait.

And if you've seen this pattern on other platforms — I'd love to hear about it.

---

*All research was conducted through passive recon against publicly available, already-indexed data. No production systems were accessed. No user data was read, modified, or stored. This writeup follows responsible disclosure — Braze was notified prior to publication.*

*— Muhammad Tayab Bashir*

*[GitHub](https://github.com/Muhammad-Tayab) | [Portfolio](https://muhammad-tayab.github.io/portfolio) | [HackerOne](https://hackerone.com/n16h70wl55) | [LinkedIn](https://www.linkedin.com/in/muhammad-tayab-bashir-694b84125/)*
