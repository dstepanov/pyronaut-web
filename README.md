# pyronaut-web

Marketing website for **Pyronaut** — an integrated application platform for
Python, built on the Micronaut application model and GraalPy/GraalVM.

Built with [Astro](https://astro.build), [Tailwind CSS v4](https://tailwindcss.com),
and TypeScript, mirroring the page structure of `micronaut-web`.

## Six design candidates

The site currently ships **six complete design directions** that share the
same structure and content (hero → features → code showcase → workflow →
deep dives → stack comparison → personas → CTA → footer). The root page
(`/`) is a design chooser, and every design page has a floating switcher for
quick comparison. **Every design supports light and dark mode** — the
moon/sun toggle in each header persists the choice (`localStorage`,
class-based Tailwind `dark:` variant, falls back to the OS preference).

| Design | Route | Character |
| --- | --- | --- |
| Mission Control | `/designs/mission-control/` | Clean, enterprise SaaS with warm flame gradients and a terminal hero |
| Deep Space | `/designs/deep-space/` | Space theme: starfield, nebula glow, glass cards, mascot porthole |
| Classic | `/designs/classic/` | Deliberately micronaut.io-like: bordered sections, numbered-steps hero card, outline badges |
| Polyglot | `/designs/polyglot/` | Micronaut structure × GraalVM energy: navy gradient-mesh hero, perf stats, runtime layer diagram, blue→violet→flame spectrum |
| Ignition | `/designs/ignition/` | Editorial startup style: announcement bar, mono uppercase kickers, huge tight headline, artwork card with overlapping code window, foundation logo strip |
| Mono | `/designs/mono/` | Inspired by Micronaut's black Sally mark: ink monochrome, Swiss hairline grids, numbered sections — the mascot's flame is the only full-color accent |

Once a direction is chosen, promote that page's markup to `/` and delete the
other variants plus `src/components/DesignSwitcher.astro`.

## Project layout

- `src/lib/site-content.ts` — all shared copy (hero, features, workflow,
  code examples, personas, footer), derived from the Pyronaut positioning
  material
- `src/components/CodeTabs.astro` — tabbed code showcase with dual Shiki
  themes (one frame variant per design; tokens switch with dark mode)
- `src/components/ThemeToggle.astro` — light/dark toggle button
- `src/components/Glyph.astro` — inline stroke icon set
- `src/layouts/BaseLayout.astro` — shared head/meta/fonts + pre-paint theme
  script
- `src/pages/designs/*.astro` — the three design candidates
- `public/pyronaut-assets/` — logos and mascot derived from `resources/`

## Commands

```sh
npm install
npm run dev        # dev server on 127.0.0.1:4321
npm run build      # typecheck + static build into dist/
npm run preview    # preview the production build
```
