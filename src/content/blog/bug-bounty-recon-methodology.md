---
title: "My Bug Bounty Recon Methodology: From Scope to Subdomains"
date: 2025-01-20
tags: ["bug-bounty", "recon", "osint", "methodology"]
excerpt: "The exact recon workflow I use before touching a bug bounty target — subdomain enumeration, content discovery, fingerprinting, and building a complete attack surface map."
published: true
platform: "blog"
---

# My Bug Bounty Recon Methodology: From Scope to Subdomains

Good recon is the difference between a $0 day and a $2,000 report. Before I send a single request to a target, I spend hours building a complete picture of the attack surface. This is the exact workflow I've refined across programs including Cloudflare, Expedia Group, and Shutterfly.

---

## Phase 1: Understand the Scope

Before touching anything technical:

1. **Read the program policy top to bottom** — understand what's in scope, what's out, and what the program actually cares about
2. **Note the asset types** — wildcard domains (`*.example.com`), specific subdomains, IP ranges, mobile apps
3. **Understand severity definitions** — does this program pay for informational findings? What's their CVSS floor?
4. **Check the changelog** — programs often add new assets; be the first to test them

---

## Phase 2: Passive Subdomain Enumeration

I never actively probe a target until I've exhausted passive sources.

```bash
# Certificate Transparency logs (fastest wins)
curl "https://crt.sh/?q=%.example.com&output=json" | \
  jq -r '.[].name_value' | sort -u > ct_subs.txt

# Amass passive mode (no active DNS — just OSINT)
amass enum -passive -d example.com -o amass_passive.txt

# Finddomain
finddomain -t example.com -u finddomain_subs.txt

# Subfinder
subfinder -d example.com -all -o subfinder_subs.txt

# Combine and deduplicate
cat ct_subs.txt amass_passive.txt finddomain_subs.txt subfinder_subs.txt | \
  sort -u > all_subs.txt

echo "[*] Total unique subdomains: $(wc -l < all_subs.txt)"
```

---

## Phase 3: Active Enumeration & DNS Resolution

```bash
# Resolve which subdomains are actually live
cat all_subs.txt | dnsx -silent -a -resp > resolved.txt

# Find wildcard DNS (important to avoid false positives)
dig *.example.com @8.8.8.8

# Bruteforce with a good wordlist
amass enum -active -brute -d example.com \
  -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-110000.txt \
  -o amass_brute.txt
```

---

## Phase 4: HTTP Probing & Fingerprinting

```bash
# Check which hosts are serving HTTP/HTTPS
cat resolved.txt | httpx -silent -status-code -title -tech-detect \
  -o live_hosts.txt

# Screenshot everything (spot the interesting ones visually)
gowitness file -f live_hosts.txt -P screenshots/

# Port scan top ports on live hosts
nmap -iL live_ips.txt -T4 --top-ports 1000 \
  -oA nmap_topscan
```

Key things I look for in the httpx output:
- Interesting titles: "Jenkins", "GitLab", "Kibana", "phpMyAdmin", "Grafana"
- Status 401/403 — authentication required (bypass candidates)
- Status 302 redirects to unusual domains
- Technology stacks I know have unpatched CVEs

---

## Phase 5: Content Discovery

```bash
# Dirbuster / feroxbuster for content discovery
feroxbuster -u https://api.example.com \
  -w /usr/share/SecLists/Discovery/Web-Content/raft-large-directories.txt \
  -x php,aspx,jsp,json,yaml,bak,conf \
  --filter-status 404,429 \
  --threads 50

# API endpoint discovery
feroxbuster -u https://api.example.com/v1 \
  -w /usr/share/SecLists/Discovery/Web-Content/api/api-endpoints.txt \
  --threads 30
```

---

## Phase 6: JavaScript Analysis

JavaScript files are goldmines. I look for:
- **Hardcoded API keys and credentials**
- **Internal API endpoints** not linked in the UI
- **Business logic clues** — what does the app think the user should/shouldn't be able to do?

```bash
# Extract all JS files from a domain
gau example.com | grep "\.js$" | sort -u > js_files.txt

# Search for secrets in JS
cat js_files.txt | while read url; do
  curl -s "$url" | grep -E "(api_key|apikey|secret|token|password|auth)"
done
```

---

## Phase 7: Attack Surface Prioritization

After recon, I prioritize targets in this order:

1. **New/recently added assets** — untested, often misconfigured
2. **Authentication endpoints** — login, reset, MFA
3. **File upload features** — classic for stored XSS or RCE
4. **API endpoints** — especially `/v1/internal/` or `/admin/`
5. **Third-party integrations** — OAuth flows, webhooks, payment providers

---

## The Recon Mindset

Recon is never "done." I keep a running notes file for each target and revisit it every few weeks. Programs add new assets. Technology stacks change. A subdomain that was a 404 last month might be a live internal tool today.

The researchers who consistently earn on bug bounty aren't the ones who know the most exploits — they're the ones who map the attack surface most completely before anyone else does.

---

*Have a recon tip or want to compare notes on a specific program? Find me on [HackerOne](https://hackerone.com/n16h70wl55).*
