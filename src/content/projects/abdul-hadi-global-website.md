---
title: "Abdul Hadi Global — Business Website"
status: "live"
stack: ["HTML", "CSS", "JavaScript", "WordPress", "SEO"]
github: ""
liveUrl: "https://abdulhadiglobal.com"
excerpt: "A professional business website for Abdul Hadi Global, an import/export and general trading company — featuring responsive design, service pages, secure contact forms, and SEO optimization."
featured: true
---

# Abdul Hadi Global Business Website

**Duration:** Sep 2024 – Oct 2024
**Client:** Abdul Hadi Global
**Live URL:** [abdulhadiglobal.com](https://abdulhadiglobal.com)

## Overview

Full website design and development for Abdul Hadi Global, a company specializing in international import, export, and general trading. The brief required a professional, trustworthy appearance that works perfectly on mobile and ranks well in search engines.

## What Was Delivered

- **Professional UI/UX** — clean, corporate design conveying reliability and expertise to international trading partners
- **Service showcase pages** — detailed descriptions of import/export services, trading capabilities, and geographic reach
- **Contact and inquiry system** — secure contact forms with email integration for business inquiries
- **Mobile-first responsive layout** — tested across devices from 320px to 2560px wide
- **SEO optimization** — keyword research, meta tags, structured data markup, sitemap, and Google Search Console setup
- **Security hardening** — SSL certificate, security headers (CSP, HSTS, X-Frame-Options), login protection, file permission hardening

## Security Measures Applied

Since I'm a penetration tester, security was a priority even on a small business site:

- Disabled XML-RPC (common WordPress attack vector)
- Hidden WordPress version from headers and feeds
- Custom login URL (moved from `/wp-admin` default)
- Rate limiting on login attempts via plugin
- CSP headers to prevent XSS
- Disable directory browsing
- Database prefix changed from default `wp_`

## Technical Highlights

- WordPress with custom theme (no page-builder bloat)
- Optimized images with lazy loading — PageSpeed score 90+
- Schema markup for business entity type
- Cookie-less analytics integration
- GDPR-compliant privacy policy and data handling

## Outcome

Site launched on time and within budget. Client reported an increase in international inquiries within the first month.
