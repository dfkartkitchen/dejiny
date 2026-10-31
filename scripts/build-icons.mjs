// Ikony aplikace (PWA, záložka, iOS) z jednoho SVG.
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'public/icons');
mkdirSync(out, { recursive: true });

// klasický sloupový chrám = „muzeum“; tmavý podklad, papírová kresba
const ikona = (pad) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#1d1a16"/>
  <g transform="translate(${pad} ${pad}) scale(${(512 - 2 * pad) / 512})" fill="none" stroke="#f4efe6" stroke-width="22" stroke-linejoin="round">
    <path d="M96 196 256 104l160 92Z"/>
    <path d="M128 196v176M200 196v176M312 196v176M384 196v176"/>
    <path d="M96 372h320M76 420h360"/>
  </g>
  <circle cx="${256}" cy="${158 + pad * 0.15}" r="10" fill="#b07a2a"/>
</svg>`;

const svg = ikona(40);
writeFileSync(resolve(root, 'public/favicon.svg'), svg);
await sharp(Buffer.from(svg)).resize(192).png().toFile(resolve(out, 'icon-192.png'));
await sharp(Buffer.from(svg)).resize(512).png().toFile(resolve(out, 'icon-512.png'));
await sharp(Buffer.from(ikona(110))).resize(512).png().toFile(resolve(out, 'icon-maskable-512.png'));
await sharp(Buffer.from(ikona(56))).resize(180).png().toFile(resolve(out, 'apple-touch-icon.png'));
console.log('Ikony hotové.');
