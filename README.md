# wsuaiclub.com

The website of AI Club at Wichita State: a static Astro site with six pages
(`/`, `/about`, `/events`, `/team`, `/contact`, `/join`) and a branded 404.
`/chocolathon` is not part of this repo: Vercel proxies it to the Chocolathon
event site (see `vercel.json`).

## Editing the site (officers)

Most changes are one file, edited in the GitHub web editor (open the file,
click the pencil, change it, "Commit changes"). Each file starts with a
comment that explains every field.

| To change | Edit |
| --- | --- |
| Upcoming events (RSVP links, flyers, partners), hackathons, past speakers | `src/data/events.yaml` (flyers go in `src/assets/flyers/`) |
| Team members, roles, LinkedIn links, headshots, home-page order | `src/data/team.yaml` (headshots go in `src/assets/team/`) |
| Links, contact email, weekly meeting, partners | `src/data/site.yaml` |
| Page copy (headlines, ledes, buttons) | `src/content/copy.ts` |
| Photo alt text and crop focus | `src/lib/photo-meta.ts` |

Every push rebuilds the site. A bad edit (a typo in a field name, a date like
"Oct 14", a missing photo) fails the build with a message naming the file,
the entry and the fix; the live site keeps the last good version.

Events show only if their date is today or later when the site was built;
the browser also hides events that have already ended. Slideshow photo sets
are listed in `src/pages/index.astro` and `src/pages/about.astro`, and in
`events.yaml > past > photos` for the Chocolathon card.

## Run it

Node 22.12 or newer.

```sh
npm ci
npm run dev       # http://127.0.0.1:5178
npm test          # voice lint, data-file checks, routing guards
npm run build     # static site in dist/
npm run preview   # serve dist/ at http://127.0.0.1:5178
npm run check     # TypeScript and Astro diagnostics
```

## Adding a photo

```sh
npm run photo -- "C:\path\to\IMG_1234.jpeg" build-night-oct
```

This writes `src/assets/photos/build-night-oct.jpg` (2400px long edge, JPEG
82, rotation fixed, location data stripped). Then add an entry with alt text
and a focal point to `src/lib/photo-meta.ts`. Never commit camera originals.
Astro turns each photo into AVIF and WebP at several widths at build time.

## How it is built

- **Astro 7, static output.** No framework on the client. One small script
  (`src/scripts/site.ts`, about 3 KB gzipped) runs the scroll reveals, the
  photo slideshows (`src/components/Slideshow.astro`: crossfade every 5 s,
  pause/play, arrows, pauses on hover, focus, hidden tab or offscreen),
  header compaction, the phone menu and the "hide past events" filter. Every page is complete without it, and under
  `prefers-reduced-motion` nothing moves.
- **Brand tokens.** `src/brand/tokens.json` is the single source for color,
  type, spacing, radius, stroke and shadow. `src/lib/tokens.ts` turns it into
  CSS custom properties with two section themes, Paper (ivory) and Ink
  (black): `<section data-theme="ink">`.
- **Fonts.** Geist, Geist Mono and Newsreader, self-hosted from
  `@fontsource-variable`.
- **Logo.** `public/brand/` holds the supplied files. The header layers
  `lockup-horizontal-black-nospark.svg` (the supplied lockup with the spark
  group removed) under the spark drawn from the same path
  (`src/components/SparkSymbol.astro`), so the spark can make its one
  quarter-turn on load.
- **Data.** `src/lib/schema.ts` validates the YAML files with zod (shared by
  the build and `npm test`); `src/lib/data.ts` loads them for the pages.
- **Icons and link preview.** `npm run icons` renders `favicon-32.png` and
  `apple-touch-icon.png` from the mark; `npm run og` renders `og-image.png`.

## Deploy

Vercel, framework preset Astro, output `dist`. `vercel.json` turns on clean
URLs, keeps the 307 redirects from the old event paths to `/chocolathon/...`
and proxies `/chocolathon` to `chocolathon.vercel.app`.
