# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Recruiters and hiring managers checking Gentrit Halili's background before reaching out.
- Engineers and peers who come for gh44-brain (how Gentrit works with Claude Code), gh44-theme (one color theme for every tool) and react-promise-confirmation-dialog.
- Potential freelance clients looking to hire Gentrit for a project.

## Product Purpose

gh44.dev is the personal site of Gentrit Halili, senior frontend engineer in Pristina, Kosovo. It introduces him, lists where he has worked, shares his open-source projects with their install steps, and is the place to contact him.

Success means a visitor does at least one of:

- contacts Gentrit (copies the email, opens GitHub, LinkedIn or Instagram);
- understands where he has worked and in which roles;
- installs gh44-brain, gh44-theme or react-promise-confirmation-dialog.

## Positioning

The site is built by the engineer it describes, with his own theme (gh44-theme) and his own agent workflow (gh44-brain). It expresses a "nonchalant developer" identity: playful and crafted, but never trying too hard. The site itself is the proof of craft.

## Capabilities and Constraints

- TanStack Start, prerendered, self-hosted on Coolify. New public pages go in `src/routes/sitemap[.]xml.ts`.
- Redesign in progress: the current UI (logo, header menu, theme toggle button, per-section accents, multilingual greeting, page fade) is being replaced. Keep the stack, hosting, SEO setup and the copy-on-click email behavior.
- The home screen is a solar system. Around the sun, each section is a real planet, in real order outward:
  - Earth + Moon = me (`/me`): personal identity and connection with the outside world. Name, title, contact; the moon opens a Gmail compose.
  - Mars + satellites = gh44-confirm (`/gh44-confirm`): verification features and integrations. The npm package, install, usage and a live demo.
  - Jupiter + moons = work (`/work`): companies, projects and professional milestones. One moon per company, the current one highlighted.
  - Saturn + rings = gh44-theme (`/gh44-theme`): one theming ecosystem supporting multiple applications. One ring band per app.
  - Neptune + satellites = gh44-brain (`/gh44-brain`): AI agents, skills and automated workflows. One satellite per agent.
- `src/utils/planets.ts` is the single planet list: order, colors, sizes and each planet's `features` drive the drawing, the pages, SEO and the sitemap.
- Repo sections show install steps as modern docs-style code blocks (tabs, syntax highlighting, copy button).
- Animation library: GSAP. 3D: React Three Fiber; the static SVG system is the server render and the fallback (no WebGL, reduced motion).

## Brand Commitments

- gh44-theme palette for every color (`palette/tokens.json` in gh44-theme).
- Dark only: no light mode, no theme switch, no saved choice.
- The sun is gh44: everything revolves around it. Decorative for now (not a link or a button); later it opens a settings page.
- No logo. No standard app chrome (no header bar, no hamburger menu).
- Voice: dry, deadpan, mostly lowercase. Short lines, a few hidden jokes; facts stay easy to find.
- Space theme: playful, Gentrit is into space.

## Evidence on Hand

- Real: name, title (Senior Frontend Engineer), location (Pristina, Kosovo), contact email (`src/utils/contact.ts`), GitHub, LinkedIn and Instagram profiles (`src/routes/utils/contactLinks.ts`), favicon (`public/favicon.svg`).
- Work history (company, role, dates), most recent first. Show companies, roles and dates only:
  - JOIN: Senior Frontend Engineer, Feb 2026 to present
  - Belt Software: Senior Frontend Engineer, Aug 2023 to Feb 2026
  - Povio: Senior Frontend Engineer, Aug 2021 to Sep 2023
  - Beetroot Academy Kosovo: Advanced JavaScript Trainer, Jun 2020 to Aug 2023
  - Kutia Digital Agency: Frontend Developer & Team Lead, Mar 2019 to Aug 2021
  - ATIS Digital Agency: JavaScript Developer, Feb 2018 to Mar 2019
  - UBT (University for Business and Technology): JavaScript Developer, Mar 2017 to Feb 2018
  - Rrota: Web Developer Intern, Oct 2016 to Jan 2017
- gh44-brain (https://github.com/gentrithalili1/gh44-brain): Claude Code rules, skills, agents, hooks and lint. Install: `git clone git@github.com:gentrithalili1/gh44-brain.git && gh44-brain/install.sh` (needs Homebrew, Node, pnpm). README has the workflow (clarify, plan, implement, create-pr, address-review) and the learning loop (capture, learn, ingest, tidy, retro).
- gh44-theme (https://github.com/gentrithalili1/gh44-theme): "One theme, every tool". Zed, Warp, Slack, Linear, Chrome (Arc, Brave, Edge), GitHub and shadcn/ui, plus a web palette and fonts (Lilex, IBM Plex Sans). Dark and light palettes, each with soft and vivid hues. Per-app install steps live in each app folder's README.
- react-promise-confirmation-dialog (https://github.com/gentrithalili1/react-promise-confirmation-dialog): v1.1.3, MIT. `npm i react-promise-confirmation-dialog`. Await `confirm()`: resolve means confirmed, reject means declined. Live demo: https://gentrithalili1.github.io/react-promise-confirmation-dialog/
- Absent: testimonials, company logos, project case studies. Do not invent them.

## Product Principles

1. Contact is never more than one step away.
2. Show real facts only; leave a thing out rather than invent it.
3. The site demonstrates the theme and workflow it promotes.
4. Every section is server-rendered and indexable at its own URL: one `h1`, own title and description.
5. Playful, never in the way: every joke or animation leaves content and contact reachable by keyboard, screen reader and reduced-motion users.
