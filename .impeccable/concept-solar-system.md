# Concept: solar system (agreed in /gh44-clarify, 2026-10-31)

Input for `/impeccable shape`. Product facts live in PRODUCT.md.

- One full-screen 3D solar system (React Three Fiber, stylized low-poly, flat toon shading, gh44 colors, no textures). No scroll on home, no logo, no menu. Inspiration: NASA Eyes solar system (https://eyes.nasa.gov/apps/solar-system/#/home), yevtam.com (playful, GSAP).
- Sun = Gentrit: name, "senior frontend engineer", contact signal. Clicking the sun toggles light/dark ("turn off the sun"). Sun on: warm paper sky, lit planets. Sun off: deep space, stars, planets shown by rim light. First visit follows system; choice saved.
- Planets, each opens a section:
  - work: sage earth-like planet, one moon per company in time order; panel lists company, role, dates. No logos, no projects.
  - gh44-brain: lavender planet with a glowing ring. Fake terminal types the install, then plays a Claude session (/gh44-clarify, plan, implement, PR). Learning loop drawn as an orbit.
  - gh44-theme: gas giant striped in the 9 palette hues. Live palette switcher (dark/light, soft/vivid) that recolors the page; install tabs for all 7 tools with copy.
  - confirmation-dialog: small terracotta planet with an orbiting rocket. Live demo: "launch rocket?" opens the real dialog; confirm launches, cancel aborts. Install and usage code.
- Opening: click planet, camera flies in (GSAP), others dim, panel slides in (right on desktop, bottom sheet on phone), URL changes. Deep links start zoomed in. Esc, "back to orbit" or browser back return.
- Code blocks: tabs, Shiki at build time in gh44 colors, copy button, typing reveal.
- Wayfinding: lowercase mono label per planet, real links, Tab and arrow keys, screen-reader readable. Orbits drift slowly, pause on hover, stop with reduced motion.
- Contact signal fixed on every screen: copy email, GitHub, LinkedIn, Instagram.
- Loading: HTML shows instantly, scene fades in. No WebGL, reduced motion or data saver: static drawing of the system with the same links.
- Mobile: same concept, lighter motion, lower pixel ratio, bottom sheet.
- 404: "lost in space", drifting astronaut, "back to orbit".
- Up to two hidden jokes (e.g. click the rocket enough times and it leaves orbit), never in the way.
- Voice: dry, deadpan, mostly lowercase. 21-language greeting removed.
- Stack: GSAP for camera and UI, R3F + drei for the scene. Motion and Lenis are dropped.

## Update after /impeccable shape (direction round)

- Chosen world: **Quiet Night Sky** (safer hand). Calm and precise: matte flat-shaded planets, hairline orbits, mono labels, starfield, lots of space. Playfulness comes from motion and copy.
- Lots of animation: twinkling parallax stars, shooting stars, slow orbits, moons, the rocket, camera fly-ins.
- Planets are data-driven: one entry per planet (id, name, hue, size, orbit, content). Adding a project = adding an entry.
- Opening a planet zooms in and re-themes the whole space in that planet's colors (background tint, star tint, accent), then shows its data.
- Future (not now): ships flying through the space (an Interstellar-like ship, a Passengers-like ship, a Starship-like rocket). The scene needs a slot for free-flying objects from day one.
- Preview sketch: `.impeccable/mocks/night-sky-v2.html` (2D SVG stand-in; the build is R3F).

## Update 2 (approved preview, 2026-10-31)

- Preview `.impeccable/mocks/night-sky-v2.html` is the approved direction. Gentrit: "this is the approach we are going".
- The home screen is only the system: no name, no links, no header. A visually hidden `h1` keeps SEO. Chrome on screen: the sun switch (top right), a hint (bottom right), "back to orbit" when a planet is open.
- New planet **me** (innermost, sand, pulsing signal rings): name, title, location, email (copy), GitHub, LinkedIn, Instagram. This replaces the always-visible contact element.
- Planet personality: each planet declares `features` that match what it holds. work = moons (one per company, tilted orbits, pass behind and in front of the planet, current company in vivid sage, slower further out). me = signal rings. gh44-brain = ring. gh44-theme = palette bands. confirm() = orbiting rocket.
- Framing: an open planet sits in the space the panel leaves free (left 45% desktop, top 38% phone, panel as bottom sheet).
- Known sketch limits to solve in the build: planet labels scale with the camera (make them HTML at a fixed size), the dialog demo uses window.confirm (use the real package).

## Update 3

- No on-screen chrome on home: the sun is the only light/dark toggle (hover title "turn on/off the sun", keyboard focusable). Hint text removed.
- Planets are flat: no night-side shading.
- gh44-theme has moons too: one per app (zed, warp, slack, linear, chrome, github, shadcn/ui), each in its own palette hue. Clicking a moon while the planet is open selects that app's install tab.
- Music: small play/stop button bottom-left plays "S.T.A.Y." (Interstellar, Hans Zimmer) from `audio/stay.mp3`, which Gentrit supplies. Never autoplays, fades in/out, shows "track missing" when the file is absent. Open: licensing for hosting the track publicly.

## Ideas for later (Gentrit, 2026-10-31)

- 404: a lost planet with dinosaurs on it (replaces the drifting astronaut). Ticket C.
- me planet: Earth-inspired (gh44 blue + sage instead of sand), with one small moon. When the me planet is open, the moon orbits slowly; clicking the moon opens a prefilled Gmail compose to gentrithalili11@gmail.com (`https://mail.google.com/mail/?view=cm&to=…&su=…`). Look in ticket B (moon, colors), link in B or C. Keep the copy-email in the panel as the non-Gmail path.

## Update 4: real planets (Gentrit, 2026-11-01)

- Sun: "everything revolves around gh44". No function for now (not a link, not a toggle). Light/dark switch removed.
- Earth + Moon = me: personal identity and connection with the outside world.
- Mars + satellites = confirm(): verification features and integrations.
- Jupiter + moons = work: companies, projects, professional milestones.
- Saturn + rings = gh44-theme: one theming ecosystem supporting multiple applications.
- Neptune + satellites = gh44-brain: AI agents, skills, automated workflows.
- Planets sit in real solar-system order: Earth, Mars, Jupiter, Saturn, Neptune.
- Later: selecting the sun opens a settings page ("the center of our universe"), e.g. music, motion, maybe theme. Not in ticket B.
