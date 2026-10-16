# Scrobblehaus

**Live:** https://scrobblehaus.vercel.app

Scrobblehaus is a SvelteKit site with a bunch of Last.fm tools: collage, charts, receipt, taste + character match, insights, exporter and compare.

## Run

```sh
npm install
cp .env.example .env   # add your LASTFM_API_KEY
npm run dev
```

Set `LASTFM_API_KEY` once in `.env`. It stays on the server, so visitors only ever type their Last.fm username.

Free key: https://www.last.fm/api/account/create

## Structure

- `src/routes/api/lastfm` — proxy to the Last.fm API (method whitelist, 5-minute cache, holds the key)
- `src/routes/api/image` — finds artist/track/album art on Deezer, iTunes as a fallback
- `src/routes/<tool>` — one page per tool
- `src/lib` — Last.fm client, collage renderer, insights, persona (character match), utils

## Deploy

The project uses `@sveltejs/adapter-vercel`. Import the repo into Vercel and set `LASTFM_API_KEY` in the project's environment variables.

## Checks

```sh
npm run check
npm run build
```
