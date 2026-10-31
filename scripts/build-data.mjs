// Rozparsuje obsah.md + obrazky.json do src/data/otazky.json.
// Texty se obsahově nemění: jen se rozdělí na segmenty (tučné / běžné).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// sjednocení formátování: „**A**** (b)**“ → „**A (b)**“ (zdvojené hvězdičky z exportu)
const md = readFileSync(resolve(root, 'obsah.md'), 'utf8').replace(/\r\n/g, '\n').replace(/\*\*\*\*/g, '');
const obrazky = JSON.parse(readFileSync(resolve(root, 'obrazky.json'), 'utf8'));

export const EPOCHY = [
  { id: 'pravek-starovek', nazev: 'Pravěk a starověk', od: 1, do: 4, barva: 'okr', obdobi: 'do 5. st.' },
  { id: 'stredovek', nazev: 'Středověk', od: 5, do: 8, barva: 'lapis', obdobi: '5.–15. st.' },
  { id: 'renesance', nazev: 'Renesance', od: 9, do: 11, barva: 'terakota', obdobi: '15.–16. st.' },
  { id: 'baroko', nazev: 'Baroko', od: 12, do: 14, barva: 'zlato', obdobi: '17.–18. st.' },
  { id: '19-stoleti', nazev: '19. století', od: 15, do: 22, barva: 'patina', obdobi: '1780–1910' },
  { id: '20-stoleti', nazev: '20. století a současnost', od: 23, do: 30, barva: 'signal', obdobi: '1900–dnes' },
];

// --- pomocné funkce -------------------------------------------------------
const clean = (s) => s.replace(/[ \t]+/g, ' ').trim();

/** "**A** – b" → [{t:'A',b:true},{t:' – b'}] */
function segments(text) {
  const out = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ t: text.slice(last, m.index) });
    out.push({ t: m[1], b: true });
    last = re.lastIndex;
  }
  if (last < text.length) out.push({ t: text.slice(last) });
  return out.filter((s) => s.t.length);
}
const plain = (segs) => segs.map((s) => s.t).join('');

function slugify(s) {
  return s
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** rozdělí podle čárek mimo závorky */
function splitCommas(s) {
  const out = []; let depth = 0, cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out.map(clean).filter(Boolean);
}

// --- přiřazení příkladu k sekci (pro otočný štítek) ------------------------
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const STOP = new Set(['jeskyne', 'kostel', 'kaple', 'chram', 'palac', 'obraz', 'socha', 'brana', 'a', 'v', 've', 'na']);
function stems(s, n = 5) {
  return norm(s).split(/[^a-z0-9]+/).filter((w) => w.length >= 3 && !STOP.has(w)).map((w) => w.slice(0, n));
}
function matchSection(priklad, sekce, n = 5) {
  const st = stems(priklad, n);
  if (!st.length) return null;
  let best = null, bestScore = 0;
  sekce.forEach((s, i) => {
    const hay = stems(s.nadpis + ' ' + s.body.map(plain).join(' '), n);
    const set = new Set(hay);
    const score = st.filter((w) => set.has(w)).length;
    if (score > bestScore) { bestScore = score; best = i; }
  });
  if (best === null && n > 4) return matchSection(priklad, sekce, 4); // skloňování: Cáchy / Cáchách
  return best === null ? null : { index: best, jistota: bestScore / st.length };
}

// --- parse ------------------------------------------------------------------
const body = md.split(/^## Prompty pro grafiky/m)[0];
const blocks = body.split(/^## (?=\d+\. )/m).slice(1);
const errors = [];
const otazky = [];

for (const block of blocks) {
  const lines = block.split('\n');
  const head = lines.shift().match(/^(\d+)\.\s+(.+)$/);
  const cislo = Number(head[1]);
  const nazev = clean(head[2]);

  let uvod = null, prikladyRaw = null;
  const sekce = [];
  let skupina = null; // aktuální ### nadpis
  let current = null;
  const open = (nadpis, sk) => { current = { nadpis, skupina: sk, body: [] }; sekce.push(current); };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) continue;
    let m;
    if ((m = line.match(/^\*\*O čem to je:\*\*\s*(.+)$/))) { uvod = segments(clean(m[1])); continue; }
    if ((m = line.match(/^\*\*Příklady k zapamatování:\*\*\s*(.+)$/))) { prikladyRaw = clean(m[1]); continue; }
    if ((m = line.match(/^###\s+(.+)$/))) { skupina = clean(m[1]); open(skupina, null); continue; }
    if ((m = line.match(/^\*\*([^*]+)\*\*$/))) { open(clean(m[1]), skupina); continue; }
    // samostatný odstavec „**Štítek:** text“ → vlastní sekce se štítkem jako nadpisem
    if ((m = line.match(/^\*\*([^*]+):\*\*\s*(.+)$/))) {
      open(clean(m[1]), skupina);
      current.body.push(segments(clean(m[2])));
      continue;
    }
    if ((m = line.match(/^[-*]\s+(.+)$/))) {
      if (!current) { errors.push(`${cislo}: odrážka mimo sekci: ${line}`); continue; }
      current.body.push(segments(clean(m[1])));
      continue;
    }
    errors.push(`${cislo}: neznámý řádek: ${line.slice(0, 80)}`);
  }

  // ### bez vlastních odrážek slouží jen jako skupina → nevzniká prázdná sekce
  const plne = sekce.filter((s) => s.body.length);
  if (!uvod) errors.push(`${cislo}: chybí „O čem to je“`);
  if (!prikladyRaw) errors.push(`${cislo}: chybí „Příklady k zapamatování“`);
  if (!plne.length) errors.push(`${cislo}: žádná sekce`);

  const priklady = splitCommas((prikladyRaw || '').replace(/\.$/, '')).map((text) => {
    const m = matchSection(text, plne);
    const s = m ? plne[m.index] : null;
    return { text, sekce: s ? (s.skupina ? `${s.skupina} · ${s.nadpis}` : s.nadpis) : null, sekceIndex: m ? m.index : null };
  });

  const img = obrazky.find((o) => o.otazka === cislo);
  if (!img) errors.push(`${cislo}: chybí obrázek v obrazky.json`);
  const kratky = img ? img.nazev : nazev;
  const slug = `${cislo}-${slugify(kratky)}`;
  const epocha = EPOCHY.find((e) => cislo >= e.od && cislo <= e.do);
  const soubor = `q${String(cislo).padStart(2, '0')}`;
  const textAll = [plain(uvod || []), ...plne.flatMap((s) => [s.nadpis, ...s.body.map(plain)])].join(' ');
  const slova = textAll.split(/\s+/).filter(Boolean).length;
  const bezHlavnich = plne.filter((s) => !/^Charakter|Členění/.test(s.nadpis));

  otazky.push({
    id: soubor,
    cislo,
    nazev,
    kratkyNazev: kratky,
    slug,
    obdobi: epocha.id,
    uvod,
    sekce: plne,
    priklady,
    obrazek: {
      soubor,
      url: img?.url ?? null,
      alt: `Ilustrace k otázce ${cislo}: ${nazev} – muzejní dioráma s motivy: ${priklady.slice(0, 4).map((p) => p.text).join(', ')}`,
    },
    slova,
    minutCteni: Math.max(1, Math.round((slova / 180) * 10) / 10),
    _motivy: bezHlavnich.length,
  });
}

if (otazky.length !== 30) errors.push(`Počet otázek je ${otazky.length}, očekáváno 30.`);
otazky.forEach((o, i) => { if (o.cislo !== i + 1) errors.push(`Pořadí: na pozici ${i + 1} je otázka ${o.cislo}`); });

// kontrola beze ztrát: každé slovo z bloků otázek musí být v datech
for (const block of blocks) {
  const cislo = Number(block.match(/^(\d+)\./)[1]);
  const o = otazky.find((x) => x.cislo === cislo);
  const data = norm([String(o.cislo), o.nazev, plain(o.uvod || []), ...o.sekce.flatMap((s) => [s.nadpis, s.skupina || '', ...s.body.map(plain)]), ...o.priklady.map((p) => p.text)].join(' '));
  const src = norm(block.replace(/\*\*|^#+ |^- /gm, '').replace(/O čem to je:|Příklady k zapamatování:/g, ''));
  const words = new Set(data.split(/[^a-z0-9]+/));
  const missing = [...new Set(src.split(/[^a-z0-9]+/))].filter((w) => w && !words.has(w));
  if (missing.length) errors.push(`${cislo}: ztracená slova: ${missing.join(', ')}`);
}

otazky.forEach((o) => delete o._motivy);
const out = resolve(root, 'src/data/otazky.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ epochy: EPOCHY, otazky }, null, 2));

// přehled
console.log('č.  | sekcí | příkladů | min | název');
for (const o of otazky) {
  const bez = o.priklady.filter((p) => p.sekce === null).length;
  console.log(`${String(o.cislo).padStart(2)}  | ${String(o.sekce.length).padStart(5)} | ${String(o.priklady.length).padStart(8)} | ${o.minutCteni.toFixed(1)} | ${o.nazev}${bez ? `  [${bez}× bez sekce]` : ''}`);
}
console.log(`\nCelkem: ${otazky.length} otázek, ${otazky.reduce((a, o) => a + o.sekce.length, 0)} sekcí, ${otazky.reduce((a, o) => a + o.priklady.length, 0)} příkladů.`);
if (errors.length) {
  console.error('\nCHYBY:\n' + errors.join('\n'));
  process.exit(1);
}
console.log('Validace OK – nic se neztratilo.');
