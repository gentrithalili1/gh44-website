# gh44-website

Source for [gh44.dev](https://gh44.dev). TanStack Start, self-hosted with Coolify, styled with the [gh44 theme](https://github.com/gentrithalili1/gh44-theme).

## Develop

```sh
pnpm install
pnpm dev
```

## Check

```sh
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build
```

`pnpm build` prerenders every linked page. Add new public pages to `src/routes/sitemap[.]xml.ts`.

## Deploy

Coolify builds the `Dockerfile` and redeploys on every push to `main`. Run the production build locally with:

```sh
pnpm build && pnpm start
```

## Theme

The gh44-theme dark palette (`palette/tokens.json` in gh44-theme) as Tailwind tokens in `src/styles.css`, mirrored in `src/utils/palette.ts` for the 3D scene, with Lilex as the only font. The site is dark only.

## Planets

`src/utils/planets.ts` drives the solar system, the planet pages, their SEO and the sitemap. Add a planet: add an entry there and a panel case in `src/routes/$planetId/PlanetPage.tsx`.

## Floki

Floki is the cockpit's onboard computer: talk to him with the talk button, or type `floki <question>` in the terminal. Plain orders ("take me to work") fly at once; questions go to Groq, and his answers are spoken by Piper in `floki-voice/`.

He needs two environment variables, in `.env.local` for development and on the site's Coolify resource in production:

- `FLOKI_GROQ_API_KEY`: without it Floki answers "comms down".
- `FLOKI_TTS_URL`: the `floki-voice` service. Without it he answers in text only.

`floki-voice/README.md` has the deploy steps.
