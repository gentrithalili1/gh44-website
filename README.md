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

[shadcn/ui](https://ui.shadcn.com) with the gh44 theme: IBM Plex Sans for text, Lilex for code. Update the theme with:

```sh
pnpm dlx shadcn@latest add @gh44/gh44
```

The site is dark only: `<html>` has the `dark` class.
