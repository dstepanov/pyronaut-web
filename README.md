# pyronaut-web

Marketing website for **Pyronaut** — an integrated application platform for
Python, built on Micronaut.

Built with [Astro](https://astro.build), [Tailwind CSS v4](https://tailwindcss.com),
and TypeScript, mirroring the page structure of `micronaut-web`.

## Design

The site is a single page built from the **Ignition** design direction:
editorial startup style — announcement bar, mono uppercase kickers, a huge
tight-tracking headline, dark pill buttons, a mascot artwork card with an
overlapping code window, and a foundation logo strip. Structure runs hero →
features → code showcase → workflow → deep dives → stack comparison →
personas → CTA → footer.

**Light and dark mode are both supported** — the moon/sun toggle in the
header persists the choice (`localStorage`, class-based Tailwind `dark:`
variant, falls back to the OS preference).

## Project layout

- `src/lib/site-content.ts` — all shared copy (hero, features, workflow,
  code examples, personas, footer), derived from the Pyronaut positioning
  material
- `src/components/CodeTabs.astro` — tabbed code showcase with dual Shiki
  themes (tokens switch with dark mode)
- `src/components/ThemeToggle.astro` — light/dark toggle button
- `src/components/Glyph.astro` — inline stroke icon set
- `src/layouts/BaseLayout.astro` — shared head/meta/fonts + pre-paint theme
  script
- `src/pages/index.astro` — the site homepage
- `public/pyronaut-assets/` — logos and mascot derived from `resources/`

## Commands

```sh
npm install
npm run dev        # dev server on 127.0.0.1:4321
npm run build      # typecheck + static build into dist/
npm run preview    # preview the production build
```
