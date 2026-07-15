# Muhammad Tayab Bashir — Cybersecurity Portfolio

Personal portfolio site for Muhammad Tayab Bashir, Penetration Tester & Security Researcher.

Built with **Astro**, vanilla CSS (glassmorphism + terminal aesthetic), and vanilla JS.

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
