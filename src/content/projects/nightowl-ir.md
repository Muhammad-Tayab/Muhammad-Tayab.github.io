---
title: "NightOwl-IR"
status: "live"
stack: ["PowerShell", "Incident Response", "MITRE ATT&CK", "Windows", "HTML"]
github: "https://github.com/Muhammad-Tayab/NightOwl-IR"
excerpt: "Zero-dependency PowerShell incident-response triage toolkit for Windows — 87+ checks across 8 domains, MITRE ATT&CK-mapped, with a collapsible HTML dashboard."
featured: true
---

# NightOwl-IR

**Status:** Live · MIT License

## What It Does

NightOwl-IR is a zero-dependency PowerShell triage toolkit for rapid incident response on Windows hosts. When you drop onto a potentially compromised machine, you need answers fast — not a dependency install that phones home. NightOwl-IR runs entirely on stock PowerShell and produces a single, self-contained HTML report.

## Highlights

- **Zero dependencies** — pure PowerShell, runs on a default Windows install with nothing to download
- **87+ checks across 8 domains** — persistence, processes, network connections, accounts, event logs, scheduled tasks, services, and file-system artifacts
- **MITRE ATT&CK-mapped** — every finding is tagged with the relevant technique ID so analysts can triage by tactic
- **Collapsible HTML dashboard** — one portable report file, no server required, easy to hand to stakeholders
- **First-responder focused** — designed for the first 15 minutes of an investigation, when speed matters most

## Why I Built It

Most IR tooling assumes internet access, admin installs, or an EDR agent already in place. On real engagements that's often not true — you get a locked-down host and a short window. NightOwl-IR is the triage script I wanted: fast, offline, and readable.
