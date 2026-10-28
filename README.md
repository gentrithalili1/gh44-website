# gh44-website

Source for [gh44.dev](https://gh44.dev). TanStack Start on Cloudflare Workers, styled with the [gh44 theme](https://github.com/gentrithalili1/gh44-theme).

## Develop

```sh
pnpm install
pnpm dev
```

## Check

```sh
pnpm typecheck && pnpm lint && pnpm format:check && pnpm build
```

`pnpm build` prerenders every linked page and writes `sitemap.xml`.

## Deploy

```sh
pnpm run deploy
```

Pushes to `main` deploy through Cloudflare Workers Builds.

## Theme

`src/styles/gh44.css` and `public/fonts/` are copied from `gh44-theme`. Re-copy them after changing the theme. `src/styles.css` maps the palette to Tailwind utilities (`bg-canvas`, `text-muted`, `text-brand`).
