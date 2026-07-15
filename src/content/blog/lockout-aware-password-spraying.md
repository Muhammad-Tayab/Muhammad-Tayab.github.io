---
title: "Lockout-Aware Password Spraying: Validating AD Credentials Without Locking Out the Domain"
date: 2026-06-12
tags: ["active-directory", "red-team", "password-spraying", "credential-access", "pentest"]
excerpt: "Password spraying is only useful if you don't lock out the accounts you're testing. Here's the lockout math every internal pentester should know — thresholds, observation windows, and safe spray cadence — and how I bake it into ADValidate."
published: true
platform: "blog"
---

# Lockout-Aware Password Spraying

Password spraying — trying one password against many accounts — is one of the highest-value moves in an internal Active Directory engagement. It's also one of the fastest ways to torpedo an engagement: spray too aggressively and you lock out half the domain, trigger the SOC, and spend the rest of the day apologizing.

Doing it safely is entirely a function of understanding the lockout policy. This post covers the math I use, and how I built it directly into [ADValidate](https://github.com/Muhammad-Tayab/advalidate).

---

## The three numbers that matter

Every domain's lockout behavior comes down to three settings in the account lockout policy:

- **Lockout threshold** — how many bad passwords before an account locks (e.g. `5`)
- **Observation window** (`LockoutObservationWindow`) — how long `badPwdCount` takes to reset after a failed attempt (e.g. `30 minutes`)
- **Lockout duration** — how long the account stays locked once tripped

You can read these before spraying:

```bash
# With valid low-priv creds
crackmapexec smb DC01 -u user -p 'Pass' --pass-pol

# Or over LDAP / rpc
rpcclient -U '' -N DC01 -c 'getdompwinfo'
```

The one that saves you is the **observation window**. `badPwdCount` is not a permanent counter — it resets after the observation window elapses since the *last* bad attempt.

---

## The safe-spray rule

Given a threshold of `T`, never send more than `T - 1` attempts to any single account within one observation window. In practice I use `T - 2` as a safety margin, because:

- `badPwdCount` replication between DCs is not instant
- A real user may be fat-fingering their own password at the same time

So for a `threshold = 5`, `window = 30 min` policy, the rule is: **at most 2–3 attempts per account per 30 minutes.** One spray of a single candidate password across the whole user list burns exactly one attempt per account — well within budget. Wait out the window before the next password.

```
attempts_per_window  = threshold - 2
spray_interval       = observation_window + small_buffer
```

---

## Don't spray the accounts you can't afford to lock

Two more precautions I always take:

1. **Filter out already-near-lockout accounts.** Enumerate `badPwdCount` first and skip anyone already at `threshold - 1`.
2. **Skip privileged/service accounts on the first pass.** A locked-out `svc-sql` account is an outage, not a finding.

---

## Where ADValidate fits

Manual spraying with a stopwatch works, but it's error-prone across large user lists and multiple DCs. ADValidate reads the lockout threshold and observation window up front, then paces validation automatically so it never crosses `threshold - N` for any account — across LDAP, Kerberos, and SMB. Once a credential validates, it maps the access that credential actually grants, so the output is a prioritized list of *usable* footholds rather than a raw valid/invalid dump.

The guiding principle is simple: **lockout policy is a hard constraint, not an afterthought.** Treat it that way and spraying becomes a safe, repeatable part of the methodology instead of a gamble.

---

## Mitigations (for the blue team reading this)

- Set a sane lockout threshold (**not** `0` / disabled) with a smart lockout / risk-based policy where possible
- Alert on horizontal `badPwdCount` growth across many accounts in a short window — that pattern *is* spraying
- Enforce MFA on every externally reachable authentication surface
- Ban weak/seasonal passwords (`Summer2026!`, `Company123`) with a password filter
