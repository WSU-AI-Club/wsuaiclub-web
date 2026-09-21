# WSU AI Club

The future home of **wsuaiclub.com**. A modern club landing page with a custom Blender emblem and a Three.js wind interaction.

## Run locally

Use Node.js 22.12+ (Node 24 recommended).

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5178. Production check: `npm run build`. Spring behavior tests: `npm test`.

## The interaction

The supplied mark becomes ten independent beveled pieces: six wheat blades, two chevrons, a stem, and a gold spark. Slow pointer movement subtly turns the sculpture. Faster sweeps apply stronger local impulses to nearby pieces; the pieces twist and separate in depth, then return through damped springs. A **Send a gust** button offers the same interaction by keyboard or tap. Motion can be paused, and the operating system's reduced-motion preference is respected.

This is a real-time interaction, not a looping video. Blender supplies the editable model, materials, and an optional authored preview; Three.js owns the pointer-responsive choreography.

## Project structure

- `src/App.tsx`, `src/styles.css`: responsive landing page and accessible controls.
- `src/components/LogoSculpture.tsx`: model loading, lighting, rendering, gusts, and cleanup.
- `src/lib/wind.ts`: bounded, frame-rate-independent spring model.
- `src/lib/wind.test.ts`: gust intensity, localization, settling, stability, and frame-rate checks.
- `public/brand/`: supplied logo artwork.
- `public/models/club-emblem.glb`: web-ready Blender export.
- `blender/build_emblem.py`: reproducible model generation from the supplied artwork.
- `blender/club-emblem.blend`: editable Blender source.
- `blender/asset-report.json`: asset validation results.

## Blender

Open `blender/club-emblem.blend` in Blender. To regenerate the model, run Blender in background mode with `--python blender/build_emblem.py`. Blender 5.2 was used for the initial export. Each named piece is independently addressable; keep those node names when replacing the GLB. Web front faces lie in XY and face +Z.

## Vercel, when ready

Import `MichaelGold11/wsuaiclub-web`, select **Vite**, and use:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm ci`
- Node.js: 24
- Environment variables: none

No domain or deployment changes are made by this repository. The existing Chocolathon site is linked at `https://chocolathon.vercel.app`. Before assigning wsuaiclub.com to this app, plan how `/chocolathon` and any existing event routes will continue to reach the event project.

The membership CTA currently leads to the club's verified LinkedIn page, not a new signup backend. Replace it with the preferred enrollment destination when that flow is decided.

## Visual direction

Approved combination: **Parallax Assembly** geometry and gallery-like page, plus **Prairie Instrument** wind behavior. Use the supplied black/white/gold identity. Maintain the recognizable assembled silhouette, preserve typography and normal HTML navigation independently of WebGL, and provide the source logo if WebGL or the model fails.

## References

- [Three.js GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html)
- [Three.js RoomEnvironment](https://threejs.org/docs/pages/RoomEnvironment.html)
- [WSU AI Club on LinkedIn](https://www.linkedin.com/company/wsu-ai-club)
