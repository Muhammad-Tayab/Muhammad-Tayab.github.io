---
title: "Building NightOwl-IR: A Zero-Dependency Windows Triage Toolkit"
date: 2026-05-18
tags: ["incident-response", "powershell", "dfir", "mitre-attack", "windows"]
excerpt: "Real incident response rarely happens on a host with your tools pre-installed. Here's why I built NightOwl-IR to run on stock PowerShell, what it collects in the first 15 minutes, and how mapping findings to MITRE ATT&CK speeds up triage."
published: true
platform: "blog"
---

# Building NightOwl-IR

The first fifteen minutes of an incident decide the next fifteen hours. But that first window is usually the worst possible environment to work in: a locked-down Windows host, no internet egress, no EDR agent you control, and no time to install anything. That constraint is exactly what [NightOwl-IR](https://github.com/Muhammad-Tayab/NightOwl-IR) was built for.

---

## Design rule #1: zero dependencies

Most DFIR tooling quietly assumes you can `pip install`, pull a container, or reach the internet. On a real triage that assumption breaks constantly. NightOwl-IR is pure PowerShell and uses only what ships with Windows — no modules, no downloads, no network calls. If PowerShell runs, the toolkit runs.

This is a deliberate trade-off: I give up some depth for the guarantee that it works *everywhere*, offline, on the first try.

---

## What it collects (8 domains, 87+ checks)

Triage is about breadth before depth — quickly answering "is anything obviously wrong?" across the places attackers live:

1. **Persistence** — Run keys, startup folders, WMI event subscriptions, image-file-execution-options
2. **Processes** — parent/child anomalies, unsigned binaries, processes running from `Temp`/`AppData`
3. **Network** — active connections, listening ports, suspicious outbound to rare destinations
4. **Accounts** — local admins, recently created users, enabled-but-dormant accounts
5. **Event logs** — cleared logs, 4624/4625 patterns, 4688 process creation
6. **Scheduled tasks** — non-Microsoft tasks, tasks calling `powershell`/`mshta`/`rundll32`
7. **Services** — unsigned or unusually-pathed services, recently modified service binaries
8. **File-system artifacts** — recent writes to system directories, alternate data streams

---

## Design rule #2: map everything to MITRE ATT&CK

A raw list of "findings" isn't triage — it's homework. Every NightOwl-IR check is tagged with the relevant ATT&CK technique, so a responder reads results by *tactic*:

- A suspicious Run key → `T1547.001` (Registry Run Keys / Startup Folder)
- A WMI event subscription → `T1546.003` (WMI Event Subscription)
- A cleared Security log → `T1070.001` (Clear Windows Event Logs)

That mapping turns a wall of output into a story: *initial access → persistence → defense evasion*. It also makes the report drop straight into a ticket without translation.

---

## Design rule #3: one portable report

Output is a single self-contained, collapsible HTML dashboard — no server, no viewer, no dependencies to open it. It travels as one file: hand it to a senior analyst, attach it to a case, or diff it against a known-good host.

---

## What I learned

The hardest part wasn't the checks — it was **restraint**. Every check you add is another false positive a tired responder has to dismiss at 3 a.m. NightOwl-IR errs toward high-signal checks with ATT&CK context, because in triage a short accurate list beats a long noisy one every time.
