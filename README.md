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

The gh44-theme palette (`palette/tokens.json` in gh44-theme) as Tailwind tokens in `src/styles.css`, with Lilex as the only font. Light and dark follow the system until the visitor clicks the sun; the choice is saved in `localStorage`.

## Planets

`src/utils/planets.ts` drives the solar system, the planet pages, their SEO and the sitemap. Add a planet: add an entry there and a panel case in `src/routes/$planetId/PlanetPage.tsx`.
