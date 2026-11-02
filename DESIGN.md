---
name: gh44.dev
description: Personal site of Gentrit Halili, built on gh44-theme.
colors:
  ink-violet-dark: "#bba8d9"
  ink-violet-light: "#6f58a0"
  sage-dark: "#b8c5ac"
  sage-light: "#5e7350"
  amber-dark: "#ddbe8e"
  amber-light: "#8c6a2e"
  slate-blue-dark: "#9fb7cc"
  slate-blue-light: "#3f6a8c"
  terracotta-dark: "#e49b80"
  terracotta-light: "#a9502f"
  rose-dark: "#d99aa6"
  rose-light: "#a4506a"
  seafoam-dark: "#9cc4c0"
  seafoam-light: "#3d7a75"
  signal-red-dark: "#eb6f6f"
  signal-red-light: "#c23b32"
  editor-night: "#1e1f22"
  editor-night-raised: "#25262a"
  editor-night-popover: "#2b2d30"
  editor-night-text: "#dfe1e5"
  editor-night-muted-text: "#a8abb2"
  editor-night-rule: "#414349"
  warm-paper: "#faf7f3"
  warm-paper-raised: "#f2ece5"
  warm-paper-text: "#2b2d30"
  warm-paper-muted-text: "#5f6269"
  warm-paper-rule: "#d2c4b6"
typography:
  display:
    fontFamily: "Lilex Variable, ui-monospace, monospace"
    fontSize: "clamp(2.75rem, 1rem + 7vw, 6rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  logo:
    fontFamily: "Lilex Variable, ui-monospace, monospace"
    fontSize: "3.125rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  statement:
    fontFamily: "IBM Plex Sans Variable, ui-sans-serif, sans-serif"
    fontSize: "clamp(1.5rem, 1.1rem + 1.75vw, 2.25rem)"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "IBM Plex Sans Variable, ui-sans-serif, sans-serif"
    fontSize: "1.75rem"
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title:
    fontFamily: "IBM Plex Sans Variable, ui-sans-serif, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.55
  body:
    fontFamily: "IBM Plex Sans Variable, ui-sans-serif, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Lilex Variable, ui-monospace, monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "0.3rem"
  md: "0.4rem"
  lg: "0.5rem"
  xl: "0.7rem"
spacing:
  gutter: "1rem"
  gutter-md: "1.5rem"
  stack: "2rem"
  page-top: "2rem"
  page-top-md: "4rem"
  header-y: "1.5rem"
components:
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.editor-night-text}"
    rounded: "{rounded.lg}"
    size: "3rem"
  icon-button-hover:
    backgroundColor: "{colors.editor-night-raised}"
    textColor: "{colors.editor-night-text}"
  contact-link:
    textColor: "{colors.editor-night-muted-text}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
  contact-link-hover:
    textColor: "{colors.editor-night-text}"
  menu-item:
    textColor: "{colors.editor-night-muted-text}"
    typography: "{typography.title}"
    rounded: "{rounded.xl}"
    padding: "0.625rem 0.75rem"
  menu-item-active:
    backgroundColor: "{colors.editor-night-raised}"
    textColor: "{colors.editor-night-text}"
  menu-sheet:
    backgroundColor: "{colors.editor-night-popover}"
    textColor: "{colors.editor-night-text}"
    width: "75%"
---

# Design System: gh44.dev

## Overview

**Creative North Star: "The Lit Terminal"**

The site reads like a calm code editor at night, or a warm sheet of paper by day. Large type does the work: a mono greeting in Lilex fills the first viewport, a sans statement in IBM Plex Sans sits under it, and almost nothing else competes. Color behaves like syntax highlighting: neutrals carry the page, and one accent per section lights up a word, an icon or the logo's "44".

Density is low. Pages are a single left-aligned column inside a 72rem container, with generous vertical space and no cards, panels or decoration. The interface stays quiet and exact: ghost icon buttons, underlined mono links, muted text that brightens on hover. Motion is short and soft, and it always respects reduced-motion settings.

Every color, font and radius comes from gh44-theme. The site is the theme's live demo, so it never uses a value outside it.

**Key Characteristics:**

- Two themes, light (warm paper) and dark (editor night), following the system setting by default.
- Mono display type (Lilex) for the greeting, headings and logo; IBM Plex Sans for statements and UI.
- One accent per section: gh44-brain violet, work sage, gh44-theme amber.
- Flat surfaces; depth only on the slide-in menu sheet.
- Short fade-and-rise page transitions, blur-in greeting rotation.

## Colors

Muted, warm-leaning neutrals with soft pastel accents in dark mode and deeper, ink-like accents in light mode. Each accent has a light and dark value; the theme swaps them under the `.dark` class.

### Primary

- **Ink Violet** (`ink-violet-dark` / `ink-violet-light`): the gh44-brain accent and the default brand color. Logo "44" on home and unknown routes, focus rings, the `default` button fill.

### Secondary

- **Sage** (`sage-dark` / `sage-light`): the work section accent, and the "copied" state of the contact email.
- **Amber** (`amber-dark` / `amber-light`): the gh44-theme section accent.

### Tertiary

- **Slate Blue, Terracotta, Rose, Seafoam**: used only in the home logo's rotating "44", together with Ink Violet, Sage and Amber. Not for UI roles.
- **Signal Red** (`signal-red-dark` / `signal-red-light`): errors only, such as a failed copy. Kept out of the logo rotation because it reads as an error.

### Neutral

- **Editor Night** (`editor-night`): dark page background and browser `theme-color`.
- **Editor Night Raised** (`editor-night-raised`): dark hover and active fill (`muted`), card surface.
- **Editor Night Popover** (`editor-night-popover`): the menu sheet surface.
- **Editor Night Text / Muted Text** (`editor-night-text`, `editor-night-muted-text`): primary and secondary text in dark mode.
- **Editor Night Rule** (`editor-night-rule`): borders, inputs, link underlines in dark mode.
- **Warm Paper** (`warm-paper`) and its raised, text, muted-text and rule companions: the same roles in light mode.

### Named Rules

**The One Section, One Accent Rule.** A section page uses only its own accent (`SECTIONS[id].textClassName`), on its `h1`, its menu icon and the logo "44". Don't mix section accents on one page.

**The Syntax Highlight Rule.** Accent color marks a word or icon, never a large surface. Backgrounds stay neutral.

**The Token-Only Rule.** Every color is a gh44-theme token (`text-primary`, `bg-muted`, ...). No raw hex in components.

## Typography

**Display Font:** Lilex Variable (with ui-monospace, monospace)
**Body Font:** IBM Plex Sans Variable (with ui-sans-serif, sans-serif)
**Label/Mono Font:** Lilex Variable

**Character:** A programmer's mono for the loud parts, a clear humanist sans for the reading parts. The mono display gives the editor feel; Plex keeps longer text easy to read.

The root font size is 112.5% (18px), so every rem-based size scales up from the Tailwind defaults.

### Hierarchy

- **Display** (Lilex 700, `text-intro`, fluid 2.75rem to 6rem, line-height 1.05, tracking -0.035em): the page `h1`, one per page. The rotating home greeting, section headings, the 404 heading.
- **Logo** (Lilex 700, `text-logo` 3.125rem, tight tracking): the "gh44" wordmark in the header only.
- **Statement** (Plex 400, `text-statement`, fluid 1.5rem to 2.25rem, line-height 1.4, max 34ch, `text-pretty`): the lead text under the `h1`. Its secondary line drops to 0.75em.
- **Headline** (Plex, `text-headline` 1.75rem, line-height 1.25): defined for in-page section headings; not used yet.
- **Title** (Plex 500, 1.125rem): menu items.
- **Body** (Plex 400, 1rem): default text.
- **Label** (Lilex 400, 1rem, lowercase): contact links.

### Named Rules

**The Mono Speaks First Rule.** Lilex is for the `h1`, the logo and short labels. Running text is always Plex.

**The One Display Rule.** One `text-intro` heading per page.

## Layout

A single column, left-aligned, inside a centered container (`max-w-6xl`, 72rem) with side gutters of 1rem, 1.5rem from `md`. The header sits on top with 1.5rem vertical padding: logo left, theme toggle and menu button right.

Each page is a `PageWrapper`: a grid with items aligned to the start, 2rem gap between blocks, and top padding of 2rem (4rem from `md`). The `h1` and its statement group in an `hgroup` with a 1.5rem gap (2rem from `md`). Text blocks cap at 34ch.

The page fills at least the dynamic viewport height. `scrollbar-gutter: stable` keeps layout fixed when page height changes. Contact links wrap in a row with 0.875rem gaps (1.5rem from `sm`).

## Elevation & Depth

Flat by default. Pages have no shadows, cards or layered panels; hierarchy comes from type size and text color. The only lifted element is the menu sheet: a popover-colored panel with a large shadow over a 10% black backdrop with a light blur.

### Named Rules

**The Flat Page Rule.** Page content never casts a shadow. Depth is reserved for overlays (the menu sheet).

## Shapes

Soft, small radii from a 0.5rem base (`--radius`). Radii mostly show on hover fills and focus outlines, since resting elements have no fill or border: `sm` (0.3rem) for inline link and email focus outlines, `lg` (0.5rem) for icon buttons, `xl` (0.7rem) for menu item fills. Underlines are the main line element: 1px for contact links, 2px with 0.3em offset for the email address.

## Components

### Buttons

Quiet and exact. The header uses ghost icon buttons only.

- **Shape:** gently rounded square (0.5rem), 3rem hit area, 1.75rem Lucide icon.
- **Ghost (default in the site):** no fill; `bg-muted` on hover and while its menu is open.
- **Focus:** ring-colored border with a 3px ring at 50% opacity.
- **Press:** shifts down 1px.
- **Other shadcn variants** (`default`, `outline`, `secondary`, `destructive`, `link`) exist in `src/components/ui/button.tsx` but are unused so far.

### Links

- **Contact links:** Lilex, lowercase, muted text with a border-colored underline (offset 4px). Hover and focus switch text and underline to the foreground color. Focus adds a 2px ring outline offset by 4px.
- **Contact email:** a button styled as inline text inside the statement. It copies the address on click and swaps its text in place: Sage for copied, Signal Red for failed, with a screen-reader status message.

### Navigation

- **Menu sheet:** slides in from the right (75% width, max 24rem from `sm`), popover surface, left border. Close button in the same top-right position as the open button.
- **Menu items:** Plex 1.125rem medium, muted text, 0.7rem radius fill. Hover and active (`data-status=active`) use `bg-muted` and foreground text; the item icon takes its section accent.

### Site logo (signature)

"gh" plus "44" in Lilex 700. On section pages, "44" takes the section accent. On home, "44" changes to a random accent every 5s, in sync with the greeting, with a 1s color transition.

### Home greeting (signature)

"Hi, I'm Gentrit Halili" in 21 languages, one at a time, in the display style. A new greeting blurs and rises in over 1s of a 5s cycle while the previous one blurs out upward (800ms). All greetings are stacked invisibly in one grid cell so the height never jumps. RTL greetings stay left-aligned.

### Page transition

The main area fades out and up 8px in 150ms, then the next page fades in and rises 8px in 300ms (ease-out `cubic-bezier(0.33, 1, 0.68, 1)`). Motion follows the user's reduced-motion setting.

## Do's and Don'ts

### Do:

- **Do** use gh44-theme tokens for every color, font and radius.
- **Do** give each page one `text-intro` `h1` in Lilex, colored with its section accent.
- **Do** keep page content in a single left-aligned column with 2rem gaps and text capped near 34ch.
- **Do** keep controls quiet: ghost buttons, muted text that brightens to foreground on hover.
- **Do** make motion short (150 to 300ms for UI, longer only for the greeting) and respect reduced motion.
- **Do** check every change in both light and dark themes.

### Don't:

- **Don't** fill large surfaces with an accent color.
- **Don't** use Signal Red for anything but errors, or in the logo rotation.
- **Don't** add shadows, cards or panels to page content.
- **Don't** set running text in Lilex.
- **Don't** mix section accents on one page.
