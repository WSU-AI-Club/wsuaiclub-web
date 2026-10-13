// Renders favicon-32.png and apple-touch-icon.png from the brand mark SVG.
// Usage: node scripts/make-icons.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const mark = readFileSync('public/brand/mark-black.svg');
const ivory = { r: 245, g: 242, b: 234, alpha: 1 };

await sharp(mark, { density: 300 }).resize({ width: 32, height: 32, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile('public/favicon-32.png');

// iOS icons must be opaque: the unmodified mark sits on the Paper ground.
const inner = await sharp(mark, { density: 300 }).resize({ width: 120, height: 120, fit: 'contain', background: { ...ivory, alpha: 0 } }).png().toBuffer();
await sharp({ create: { width: 180, height: 180, channels: 4, background: ivory } }).composite([{ input: inner, gravity: 'center' }]).png().toFile('public/apple-touch-icon.png');
console.log('icons written');
