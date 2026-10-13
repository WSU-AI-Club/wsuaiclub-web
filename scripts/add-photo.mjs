// Adds an event photo to the site: downscales it to a 2400px long edge (JPEG
// quality 82), fixes the camera rotation and strips location and camera data.
// Never commit camera originals; run them through this script first.
//
// Usage: npm run photo -- "<path to original>" <kebab-case-name>
//   e.g. npm run photo -- "C:\Users\me\Downloads\IMG_1234.jpeg" build-night-oct
// Then list it in src/lib/photos.ts with alt text and a focal point.
import sharp from 'sharp';
import { existsSync, statSync } from 'node:fs';

const [input, name] = process.argv.slice(2);
if (!input || !name || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
  console.error('Usage: npm run photo -- "<original>" <kebab-case-name>');
  process.exit(1);
}
if (!existsSync(input)) {
  console.error(`Not found: ${input}`);
  process.exit(1);
}
const out = `src/assets/photos/${name}.jpg`;
const info = await sharp(input)
  .rotate()
  .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(out);
console.log(`${out}  ${info.width}x${info.height}  ${Math.round(statSync(out).size / 1024)} KB`);
