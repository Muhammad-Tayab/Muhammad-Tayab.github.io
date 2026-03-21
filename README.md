# Muhammad Tayab Bashir — Cybersecurity Portfolio

Personal portfolio site for Muhammad Tayab Bashir, Penetration Tester & Security Researcher.

Built with **Astro**, vanilla CSS (glassmorphism + terminal aesthetic), and vanilla JS.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (http://localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## Project Structure

```
src/
  pages/
    index.astro          ← Homepage (all sections)
    blog/
      index.astro        ← Blog listing
      [slug].astro       ← Individual blog post
    ctf/
      index.astro        ← CTF writeups listing
      [slug].astro       ← Individual CTF writeup
    projects/
      index.astro        ← Projects listing
  content/
    blog/*.md            ← Blog post markdown files
    ctf/*.md             ← CTF writeup markdown files
    projects/*.md        ← Project markdown files
  layouts/
    BaseLayout.astro     ← HTML shell, global styles, cursor, animations
    PostLayout.astro     ← Layout for blog/CTF post pages
  components/
    Nav.astro            ← Sticky navigation with scroll effects
    Hero.astro           ← Typewriter terminal hero section
    ProjectCard.astro    ← Project card with terminal chrome
    BlogCard.astro       ← Blog post card
    CTFCard.astro        ← CTF writeup card
    CertCard.astro       ← Certificate card
    ToolGrid.astro       ← Animated tools grid
    ContactForm.astro    ← Formspree contact form
    Footer.astro         ← Footer
public/
  favicon.ico
.github/
  workflows/
    deploy.yml           ← GitHub Actions auto-deploy to Pages
```

---

## How to Add Content

### Add a new blog post

1. Create a `.md` file in `src/content/blog/`
2. The filename becomes the URL slug (e.g., `my-post.md` → `/blog/my-post`)
3. Use this frontmatter:

```yaml
---
title: "Your Post Title"
date: 2025-06-01
tags: ["web-pentesting", "bug-bounty"]
excerpt: "A short description shown on the listing page."
published: true
platform: "blog"
---

Your markdown content here...
```

### Add a new CTF writeup

1. Create a `.md` file in `src/content/ctf/`
2. Use this frontmatter:

```yaml
---
title: "Machine Name — HackTheBox"
date: 2025-06-01
platform: "HackTheBox"    # or "TryHackMe"
difficulty: "Medium"       # Easy / Medium / Hard
category: "Web"
tags: ["sqli", "privilege-escalation"]
published: true
excerpt: "Short description for the listing page."
---

Your writeup content here...
```

### Add a new project

1. Create a `.md` file in `src/content/projects/`
2. Use this frontmatter:

```yaml
---
title: "Project Name"
status: "live"             # or "coming-soon"
stack: ["Python", "Bash"]
github: "https://github.com/..."
liveUrl: "https://..."     # leave empty if none
excerpt: "Short description."
featured: true             # shows on homepage if true
---

Project description markdown...
```

---

## Deploy to GitHub Pages

### One-time setup

1. **Update `astro.config.mjs`** with your GitHub username and repo name:

```js
export default defineConfig({
  site: 'https://YOUR_USERNAME.github.io',
  base: '/YOUR_REPO_NAME',
  output: 'static',
});
```

2. **Enable GitHub Pages** in your repository:
   - Go to **Settings → Pages**
   - Source: **GitHub Actions**

3. **Push to `main`** — the workflow in `.github/workflows/deploy.yml` builds and deploys automatically.

### Custom domain

1. Add a `CNAME` file to the `public/` directory:
```
yourdomain.com
```
2. In GitHub: **Settings → Pages → Custom domain** → enter your domain
3. Add a CNAME record in your DNS: `www` → `YOUR_USERNAME.github.io`
4. Remove `base` from `astro.config.mjs` (not needed with custom domains):
```js
export default defineConfig({
  site: 'https://yourdomain.com',
  output: 'static',
});
```

---

## Deploy to Vercel (Alternative)

No configuration needed — Vercel auto-detects Astro.

1. Remove `site` and `base` from `astro.config.mjs`
2. Import your GitHub repository in the [Vercel dashboard](https://vercel.com)
3. Framework preset: **Astro** (auto-detected)
4. Click **Deploy**

Every push to `main` auto-deploys.

---

## Set Up Formspree Contact Form

1. Go to [formspree.io](https://formspree.io) and create a free account
2. Create a new form and copy your **Form ID** (looks like `xyzabcde`)
3. Open `src/components/ContactForm.astro` and replace:
```js
const FORMSPREE_ID = 'YOUR_FORM_ID';
```
with your actual form ID:
```js
const FORMSPREE_ID = 'xyzabcde';
```

That's it — the form handles everything including success/error states without a page reload.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Astro 4 (static output) |
| Styling | Vanilla CSS (per-component) |
| Animations | Vanilla JS + CSS |
| Content | Markdown (.md files) |
| Contact | Formspree |
| Fonts | JetBrains Mono (Google Fonts) |
| Deployment | GitHub Pages / Vercel |

---

## License

MIT — use freely, attribution appreciated.
