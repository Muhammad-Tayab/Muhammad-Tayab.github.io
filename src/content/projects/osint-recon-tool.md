---
title: "OSINT Recon Tool"
status: "coming-soon"
stack: ["Python", "Bash", "APIs", "Shodan", "WHOIS"]
github: ""
liveUrl: ""
excerpt: "An automated OSINT reconnaissance framework that aggregates data from multiple sources — certificate transparency logs, Shodan, WHOIS, social media, and more — into a structured attack surface report."
featured: true
---

# OSINT Recon Tool

**Status:** In Development
**ETA:** Q2 2025

## Concept

A command-line OSINT framework focused on bug bounty reconnaissance. Instead of running five separate tools and manually correlating results, this tool chains them into a single automated pipeline and outputs a structured JSON/HTML report.

## Planned Features

- Subdomain enumeration (CT logs, brute force, permutations)
- DNS record analysis and historical lookups
- Shodan integration for exposed services and ports
- WHOIS and RDAP lookups with organizational correlation
- GitHub/GitLab code search for leaked credentials and secrets
- Social media profile aggregation
- Technology fingerprinting via HTTP headers and JavaScript files
- Automated screenshot of discovered web assets

## Why I'm Building This

After 1+ year of bug bounty hunting, my recon workflow involves 8+ separate tools with manual steps between each. This tool will be the glue that automates the transitions and normalizes output into a unified format I can pipe into my reporting templates.

*Stay tuned — development updates will be posted on the blog.*
