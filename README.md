# gh44-website

Source for [gh44.dev](https://gh44.dev). TanStack Start, self-hosted with Coolify, styled with the [gh44 theme](https://github.com/gentrithalili1/gh44-theme).

## Develop

```sh
pnpm install
pnpm dev
```

## Check

```sh
pnpm typecheck && pnpm lint && pnpm format:check && pnpm build
```

`pnpm build` prerenders every linked page. Add new public pages to `src/routes/sitemap[.]xml.ts`.

## Deploy

Coolify builds the `Dockerfile` and redeploys on every push to `main`. Run the production build locally with:

```sh
pnpm build && pnpm start
```

## Theme

`src/styles/gh44.css` and `public/fonts/` are copied from `gh44-theme`. Re-copy them after changing the theme. `src/styles.css` maps the palette to Tailwind utilities (`bg-canvas`, `text-muted`, `text-brand`).
