import { defineConfig } from 'astro/config';

// GitHub Pages config — update these two values before deploying:
//   site: your GitHub Pages URL  e.g. 'https://n16h70wl55.github.io'
//   base: your repo name         e.g. '/portfolio'
//
// For Vercel: remove `site` and `base`, set output: 'static' (already set).
// Then just connect the repo in the Vercel dashboard — zero config needed.

export default defineConfig({
  site: 'https://Muhammad-Tayab.github.io',
  base: '/portfolio',
  output: 'static',
  trailingSlash: 'ignore',
});
