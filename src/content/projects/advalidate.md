---
title: "ADValidate"
status: "live"
stack: ["Active Directory", "Red Team", "Kerberos", "LDAP", "SMB", "Credential Access"]
github: "https://github.com/Muhammad-Tayab/advalidate"
excerpt: "A native, lockout-aware, multi-protocol credential validation and access-mapping engine for authorized Active Directory penetration testing and red-team engagements."
featured: true
---

# ADValidate

**Status:** Live · Open source

## What It Does

ADValidate is a native, lockout-aware, multi-protocol credential validation and access-mapping engine for **authorized** Active Directory penetration testing and red-team engagements. It answers two questions that matter early in every internal engagement: *which of these credentials are valid?* and *what does each valid credential actually get me?*

## Highlights

- **Lockout-aware** — reads the domain's lockout threshold and observation window, then paces validation so it never locks out the accounts you're testing
- **Multi-protocol** — validates across common AD authentication surfaces (LDAP, Kerberos, SMB, and more) rather than a single protocol
- **Access mapping** — turns a set of valid credentials into a map of reachable hosts and effective privileges across the domain
- **Native and dependency-light** — built to run cleanly on real engagements, not just in a lab
- **Authorized use only** — designed and documented for sanctioned penetration testing and red-team work

## Why I Built It

Credential validation at scale is where a lot of internal assessments go wrong — spray too fast and you lock out half the domain and burn the engagement. ADValidate treats lockout policy as a first-class constraint, then goes a step further by mapping the access each valid credential grants, so the results are immediately actionable.
