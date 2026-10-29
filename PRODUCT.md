# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Recruiters and hiring managers checking Gentrit Halili's background before reaching out.
- Engineers and peers who come for gh44-brain (how Gentrit works with AI agents in Claude Code) and gh44-theme (one color theme for every tool).
- Potential freelance clients looking to hire Gentrit for a project.

## Product Purpose

gh44.dev is the personal site of Gentrit Halili, senior software engineer. It is the home base for his work, gh44-brain and gh44-theme, and the place to contact him.

Success means a visitor does at least one of:

- contacts Gentrit (copies the email, opens GitHub or LinkedIn);
- understands his work and experience;
- adopts gh44-theme or takes ideas from gh44-brain.

## Positioning

The site is built by the engineer it describes, using his own theme (gh44-theme) and his own agent workflow (gh44-brain). The site itself is the proof of craft.

## Capabilities and Constraints

- TanStack Start, prerendered, self-hosted on Coolify. New public pages go in `src/routes/sitemap[.]xml.ts`.
- shadcn/ui with the gh44 theme. Every color, spacing, radius and font comes from theme tokens.
- Routes: home (`/`), `/work`, `/gh44-brain`, `/gh44-theme`. Each section has its own accent token (work: success, gh44-brain: primary, gh44-theme: warning).
- Open: Work page stays "Coming soon" until Gentrit provides real work history. gh44-brain and gh44-theme pages are also stubs.

## Brand Commitments

- Dark only: `<html>` has the `dark` class.
- gh44 theme tokens; IBM Plex Sans for text, Lilex for code and the home greeting.
- Multilingual home greeting ("Hi, I'm Gentrit Halili" in 21 languages).
- Per-section accent colors in the header and logo.
- Voice: short, direct, plain words.

## Evidence on Hand

- Real: name, title (Senior Software Engineer), GitHub profile (`https://github.com/gentrithalili1`), contact email (`src/routes/(home)/components/ContactEmail`), favicon (`public/favicon.svg`).
- Placeholders: LinkedIn and Instagram URLs in `src/routes/(home)/utils/contactLinks.ts` are not confirmed.
- Absent: work history, project case studies, testimonials. Do not invent them.

## Product Principles

1. Contact is never more than one step away.
2. Show real work only; an honest "coming soon" beats invented content.
3. The site demonstrates the theme and workflow it promotes.
4. Public pages are server-rendered and indexable: one `h1`, own title and description per page.
