// Připraví ilustrace: AVIF + WebP ve 3 šířkách, OG obrázek 1200×630 a LQIP.
// Zdroj (v tomto pořadí): podklady/obrazky/qNN.png → stažení z obrazky.json → dočasný zástupný obrázek.
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { epochy, otazky } = JSON.parse(readFileSync(resolve(root, 'src/data/otazky.json'), 'utf8'));
const SRC = resolve(root, 'podklady/obrazky');
const OUT = resolve(root, 'public/img');
const META = resolve(root, 'src/data/obrazky-meta.json');
const WIDTHS = [640, 1280, 1920];
const BARVY = { okr: '#B07A2A', lapis: '#2B4C8C', terakota: '#B5523B', zlato: '#A8862B', patina: '#3E7F6E', signal: '#D2301F' };
mkdirSync(SRC, { recursive: true });
mkdirSync(OUT, { recursive: true });

const prev = existsSync(META) ? JSON.parse(readFileSync(META, 'utf8')) : {};
const meta = {};

async function zdroj(o) {
  const local = resolve(SRC, `${o.id}.png`);
  if (existsSync(local)) return { buf: readFileSync(local), typ: 'original' };
  if (o.obrazek.url) {
    try {
      const res = await fetch(o.obrazek.url, { signal: AbortSignal.timeout(20000) });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        writeFileSync(local, buf);
        return { buf, typ: 'original' };
      }
    } catch { /* síť nedostupná → zástupný obrázek */ }
  }
  const e = epochy.find((x) => x.id === o.obdobi);
  const c = BARVY[e.barva];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">
    <defs><radialGradient id="g" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="#1D1A16"/></radialGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="58%" font-family="Georgia, serif" font-size="520" fill="#F4EFE6" fill-opacity=".14" text-anchor="middle">${String(o.cislo).padStart(2, '0')}</text>
  </svg>`;
  return { buf: await sharp(Buffer.from(svg)).png().toBuffer(), typ: 'zastupny' };
}

let original = 0, zastupny = 0;
for (const o of otazky) {
  const local = resolve(SRC, `${o.id}.png`);
  const hotovo = existsSync(resolve(OUT, `${o.id}-1920.avif`)) && prev[o.id];
  // hotový originál přeskoč; zástupný obrázek zkus vždy nahradit originálem (stažení / nový soubor)
  if (hotovo && prev[o.id].typ === 'original' && existsSync(local) && statSync(local).mtimeMs <= prev[o.id].mtime) {
    meta[o.id] = prev[o.id];
    prev[o.id].typ === 'original' ? original++ : zastupny++;
    continue;
  }
  const { buf, typ } = await zdroj(o);
  if (typ === 'zastupny' && hotovo && prev[o.id].typ === 'zastupny') { meta[o.id] = prev[o.id]; zastupny++; continue; }
  const base = sharp(buf).resize({ width: 1920, height: 1080, fit: 'cover' });
  const master = await base.toBuffer();
  for (const w of WIDTHS) {
    const img = sharp(master).resize({ width: w });
    await img.clone().avif({ quality: w > 1000 ? 50 : 55, effort: 4 }).toFile(resolve(OUT, `${o.id}-${w}.avif`));
    await img.clone().webp({ quality: 72 }).toFile(resolve(OUT, `${o.id}-${w}.webp`));
  }
  await sharp(master).resize({ width: 1200, height: 630, fit: 'cover' }).jpeg({ quality: 78, mozjpeg: true }).toFile(resolve(OUT, `${o.id}-og.jpg`));
  const lq = await sharp(master).resize({ width: 32 }).blur(1.2).webp({ quality: 40 }).toBuffer();
  const { dominant } = await sharp(master).stats();
  meta[o.id] = {
    typ,
    mtime: existsSync(local) ? statSync(local).mtimeMs : 0,
    lqip: `data:image/webp;base64,${lq.toString('base64')}`,
    barva: `rgb(${dominant.r} ${dominant.g} ${dominant.b})`,
  };
  typ === 'original' ? original++ : zastupny++;
  process.stdout.write(typ === 'original' ? '■' : '□');
}
writeFileSync(META, JSON.stringify(meta, null, 2));

// --- videa z Higgsfieldu (podklady/videa/seznam.json) -------------------------
const SEZNAM = resolve(root, 'podklady/videa/seznam.json');
const VOUT = resolve(root, 'public/video');
const VMETA = resolve(root, 'src/data/videa.json');
const videa = {};
if (existsSync(SEZNAM)) {
  mkdirSync(VOUT, { recursive: true });
  const { videa: list } = JSON.parse(readFileSync(SEZNAM, 'utf8'));
  for (const v of list.filter((x) => x.url && x.soubor !== 'prezentace-webu.mp4')) {
    const dest = resolve(VOUT, v.soubor);
    if (!existsSync(dest)) {
      try {
        const res = await fetch(v.url, { signal: AbortSignal.timeout(60000) });
        if (res.ok) writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
      } catch { /* bez sítě – video se na webu nezobrazí */ }
    }
    if (existsSync(dest)) videa[v.soubor.replace('.mp4', '')] = `/video/${v.soubor}`;
  }
}
writeFileSync(VMETA, JSON.stringify(videa, null, 2));
console.log(`Videa: ${Object.keys(videa).length} k dispozici.`);
console.log(`\nObrázky: ${original} originálních, ${zastupny} zástupných.`);
if (zastupny) console.log(`Chybějící ilustrace vlož jako ${SRC}/qNN.png a spusť znovu „npm run images“.`);
