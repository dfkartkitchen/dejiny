// Z dist/ vyrobí preview/ – samostatný náhled s relativními cestami (pro sdílený odkaz bez serveru).
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(root, 'dist');
const OUT = join(root, 'preview');
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const files = walk(DIST);
const ROUTES = 'otazka|prehled|img|_astro|favicon|zkouseni|kviz|karticky';
const keep = new Set();

// CSS: písma jako data URI (jen latin + latin-ext), ostatní sady vynechat
const cssFile = files.find((f) => f.endsWith('.css'));
let css = readFileSync(cssFile, 'utf8');
css = css.replace(/@font-face\{[^}]*\}/g, (block) => {
  const m = block.match(/url\(\/_astro\/([^)]+\.woff2)\)/);
  if (!m) return block;
  if (!/-(latin|latin-ext)-/.test(m[1])) return '';
  const b64 = readFileSync(join(DIST, '_astro', m[1])).toString('base64');
  return block.replace(m[0], `url(data:font/woff2;base64,${b64})`);
});

for (const f of files.filter((x) => x.endsWith('.html'))) {
  const rel = relative(DIST, f);
  const depth = rel.split('/').length - 1;
  const pre = depth ? '../'.repeat(depth) : './';
  let h = readFileSync(f, 'utf8');

  // AVIF zdroje a 1920 px šířky vynechat (náhled = menší počet souborů)
  h = h.replace(/<source type="image\/avif"[^>]*>/g, '');
  h = h.replace(/,\s*\/img\/[^,"\s]+-1920\.webp 1920w/g, '');
  // absolutní cesty → relativní
  h = h.replace(new RegExp(`(["'(,\\s=])\\/(?=(${ROUTES})[\\/".])`, 'g'), `$1${pre}`);
  h = h.replace(/(href=")\/(#[a-z-]+)?"/g, `$1${pre}index.html$2"`);
  h = h.replace(/("|')\/(#osa)/g, `$1${pre}index.html$2`);
  // adresářové odkazy → index.html
  h = h.replace(new RegExp(`(${pre.replace(/\./g, '\\.')}(?:otazka\\/[^"'\\s#?/]+|prehled|zkouseni|karticky|kviz\\/[^"'\\s#?/]+)\\/)(?=["'?#])`, 'g'), '$1index.html');
  h = h.replace(/(\.\.\/|\.\/)index\.html#osa/g, '$1index.html#osa');
  // odkazy na OG/kanonické adresy nejsou v náhledu potřeba
  h = h.replace(/<link rel="canonical"[^>]*>|<meta property="og:[^>]*>|<meta name="twitter:[^>]*>/g, '');
  // PWA (manifest, service worker) v náhledu nefunguje – vynechat
  h = h.replace(/<link rel="manifest"[^>]*>|<link rel="apple-touch-icon"[^>]*>/g, '');

  if (rel === 'index.html') {
    // stránku obalí hostitel – ponechat jen obsah hlavy a těla
    h = h.replace(/<!DOCTYPE html>/i, '')
      .replace(/<html[^>]*>/, '')
      .replace(/<\/html>\s*$/, '')
      .replace(/<head>|<\/head>/g, '')
      .replace(/<body[^>]*>/, '')
      .replace(/<\/body>/, '')
      .replace(/<meta charset="utf-8"\s*\/?>|<meta name="viewport"[^>]*>/g, '')
      .replace("document.documentElement.classList.add('js');", "document.documentElement.classList.add('js');document.documentElement.lang='cs';document.documentElement.dataset.epocha='pravek-starovek';");
  }
  for (const m of h.matchAll(/(?:\.\.\/|\.\/)+(img\/[^"'\s,)]+|_astro\/[^"'\s,)]+|favicon\.svg)/g)) keep.add(m[1]);
  h = h.replace(/_astro\//g, 'assets/'); // složky s podtržítkem hostitel nepovoluje
  mkdirSync(dirname(join(OUT, rel)), { recursive: true });
  writeFileSync(join(OUT, rel), h);
}

for (const k of keep) {
  const src = join(DIST, k);
  if (!existsSync(src)) { console.warn('chybí', k); continue; }
  const dest = join(OUT, k.replace(/^_astro\//, 'assets/'));
  mkdirSync(dirname(dest), { recursive: true });
  if (k.endsWith('.css')) writeFileSync(dest, css);
  else copyFileSync(src, dest);
}
const all = walk(OUT);
const size = all.reduce((a, f) => a + statSync(f).size, 0);
console.log(`preview/: ${all.length} souborů, ${(size / 1024 / 1024).toFixed(1)} MB`);
