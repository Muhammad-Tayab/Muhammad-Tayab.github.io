---
title: "Clothing Sale Browser Extension"
status: "live"
stack: ["JavaScript", "Node.js", "Express.js", "Machine Learning", "Web Scraping"]
github: "https://github.com/n16h70wl55"
liveUrl: ""
excerpt: "A browser extension that detects clothing sales from major Pakistani fashion brands in real-time, using ML algorithms to suggest similar products based on user preferences and browsing history."
featured: true
---

# Clothing Sale Browser Extension & Web Application

**Duration:** Jan 2023 – Aug 2023
**Role:** Lead Developer
**Thesis Project — University of Central Punjab, CGPA 3.2**

## Overview

My bachelor's thesis project: a browser extension paired with a full-stack web application that helps users find clothing sales from leading Pakistani fashion brands. The extension monitors product pages in real-time and alerts users when items they've viewed go on sale.

## Core Features

- **Real-time sale detection** — scrapes price data across multiple e-commerce platforms and detects price drops automatically
- **ML-based recommendations** — a collaborative filtering model suggests similar products based on the user's view history and saved items
- **Cross-browser support** — Chrome and Firefox compatible using WebExtensions API
- **Web dashboard** — full web application where users can manage wishlists, view purchase history, and set price alert thresholds

## Technical Architecture

### Backend (Node.js + Express.js)
- RESTful API for extension ↔ server communication
- Web scraping pipeline using Puppeteer and Cheerio targeting major Pakistani fashion brands
- Scheduled jobs (node-cron) for price monitoring at configurable intervals
- MongoDB for product data, user preferences, and price history

### Machine Learning
- Collaborative filtering for product recommendations (similar to what Netflix uses)
- TF-IDF for text similarity across product descriptions
- Trained on scraped product catalog data

### Browser Extension
- Manifest V3 (Chrome) and Manifest V2 (Firefox) compatible
- Content scripts inject price comparison widgets on product pages
- Background service worker for persistent monitoring

## Challenges Solved

1. **Anti-bot measures** — implemented request throttling, rotating user agents, and randomized delays to avoid triggering rate limiting on retail sites
2. **Data normalization** — product names, sizes, and prices vary wildly across sites; built a normalization pipeline to create comparable entries
3. **Extension performance** — minimized content script footprint to avoid slowing down browsing; all heavy processing happens server-side

## Outcome

Successfully demonstrated at university capstone presentation. Received distinction for technical complexity and real-world applicability.
