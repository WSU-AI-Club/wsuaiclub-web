# Approved direction and implementation

Michael selected the first concept's page and artifact design, combined with the second concept's wind behavior. Faster mouse movement must disturb the leaves more strongly; pieces return to the logo when movement stops. This initial deliverable includes the actual Blender asset, a local interactive web app, and a dedicated private repository under MichaelGold11. Vercel and domain attachment are later steps.

## Architecture

React + Vite + TypeScript provide a small static web application. The hero renderer loads a GLB exported from Blender. The ten logo pieces have separate centered pivots. Pointer position is projected into the scene and proximity controls which pieces receive wind; speed determines force. Damped springs restore their rest transforms. Bounds and time subdivision protect against extreme input and unstable frame rates.

The page uses the supplied logos, locally bundled Manrope, white/black/gold colors, large typography, fine rules, an Explore section, and a membership section pointing to the existing club LinkedIn page. No authentication, analytics, or new data storage is added.

## Build sequence

1. Create isolated repository and React/Vite scaffold.
2. Trace actual logo contours in Blender, extrude individual pieces, assign black face/silver edge/gold materials, save native source, export GLB.
3. Build page and independently integrate Three.js rendering and wind springs.
4. Verify production build, spring behavior, real browser loading, mouse intensity, settling, pause, keyboard gust, mobile layout, reduced motion and fallback.
5. Commit source and asset, push to the requested repository, leave the local preview running.

## Review focus

- First pointer entry or an old pointer sample must not create a violent gust.
- Motion must remain bounded under rapid repeated input and low frame rates.
- Reduced-motion users get a composed mark and honest controls.
- Offscreen/hidden content should not consume continuous GPU work.
- Failed model loading or WebGL context loss must leave a useful visible logo and usable HTML page.
- Both desktop and mobile must fit the actual supplied mark without cropping.
- Existing event hosting and domain routes must remain unchanged until a separate migration is requested.
