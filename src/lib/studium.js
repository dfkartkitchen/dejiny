// Generování studijního materiálu z dat (kartičky, kvízy). Nic se nevymýšlí – vše je vytažené z textu otázek.
const plain = (segs) => segs.map((s) => s.t).join('');
const clean = (s) => s.replace(/\s+/g, ' ').replace(/^[\s:–-]+|[\s:,;–-]+$/g, '').trim();

/** Kartičky: každá odrážka s tučným úsekem → líc = první tučný úsek, rub = celá odrážka + kontext. */
export function karticky(otazky, epochy) {
  const out = [];
  for (const o of otazky) {
    const e = epochy.find((x) => x.id === o.obdobi);
    const seen = new Set();
    o.sekce.forEach((s) => {
      s.body.forEach((b) => {
        const first = b.find((x) => x.b);
        if (!first) return;
        const lic = clean(first.t);
        if (lic.length < 3 || lic.length > 70 || seen.has(lic.toLowerCase())) return;
        seen.add(lic.toLowerCase());
        out.push({
          id: `${o.id}-${out.length}`,
          otazka: o.cislo,
          obdobi: o.obdobi,
          lic,
          rub: plain(b),
          sekce: s.skupina ? `${s.skupina} · ${s.nadpis}` : s.nadpis,
          nazev: o.kratkyNazev,
          epocha: e.nazev,
        });
      });
    });
  }
  return out;
}

const PARTICLE = new Set(['van', 'von', 'de', 'da', 'della', 'di', 'del', 'der', 'le', 'la', 'z', 'st.', 'ml.', 'y']);
const NE_OSOBA = new Set(['Konstrukce', 'Prvky', 'Vynálezy', 'Jinde', 'Mykény', 'Charakter', 'Kréta', 'Nizozemí', 'Versailles', 'Rusko', 'Česko', 'High-tech']);
let NADPISY = null;
const jakoJmeno = (a) =>
  !NE_OSOBA.has(a) && !NADPISY.has(a) && !/ismus$/.test(a) &&
  a.split(' ').length <= 5 &&
  a.split(' ').every((w) => PARTICLE.has(w) || /^\(?\p{Lu}/u.test(w));

/** Dvojice umělec – dílo z odrážek typu „**Jméno:** **Dílo**“ nebo „**Jméno: Dílo**“. */
export function autorDilo(o, vsechny = [o]) {
  if (!NADPISY) NADPISY = new Set(vsechny.flatMap((x) => x.sekce.flatMap((s) => [s.nadpis, s.skupina]).filter(Boolean)));
  const pairs = [];
  for (const s of o.sekce) for (const b of s.body) {
    const bold = b.map((x, i) => ({ ...x, i })).filter((x) => x.b);
    if (!bold.length) continue;
    const f = bold[0];
    if (f.i !== 0) continue;
    if (/^[^:]{3,40}: .{3,}$/.test(f.t)) {
      const [a, d] = f.t.split(/: (.+)/);
      pairs.push({ autor: clean(a), dilo: clean(d) });
    } else if ((/:$/.test(f.t) || /^:/.test(b[1]?.t ?? '')) && bold[1]) {
      pairs.push({ autor: clean(f.t), dilo: clean(bold[1].t) });
    }
  }
  return pairs.filter((p) => jakoJmeno(p.autor) && p.dilo.length <= 60);
}

/** Zásobník kvízových otázek pro jednu otázku; distraktory z jiných otázek téže epochy. */
export function kvizPool(o, otazky) {
  const stejnaEpocha = otazky.filter((x) => x.obdobi === o.obdobi && x.cislo !== o.cislo);
  const pool = [];
  // 1) Kdo je autorem díla?
  const moje = autorDilo(o, otazky);
  const cizi = [...new Set(stejnaEpocha.flatMap((x) => autorDilo(x, otazky)).map((p) => p.autor))];
  const mojiAutori = new Set(moje.map((p) => p.autor));
  for (const p of moje) {
    const spatne = [...new Set([...cizi, ...mojiAutori])].filter((a) => a !== p.autor);
    if (spatne.length >= 3) pool.push({ typ: 'autor', otazka: `Se kterým umělcem je spojeno „${p.dilo}“?`, spravne: p.autor, spatne, vysvetleni: `${p.autor}: ${p.dilo}` });
  }
  // 2) Ke které otázce (slohu / období) patří dílo z příkladů?
  const nazvy = stejnaEpocha.map((x) => x.kratkyNazev);
  if (nazvy.length >= 2) for (const p of o.priklady) {
    pool.push({ typ: 'sloh', otazka: `Ke kterému slohu nebo období patří „${p.text}“?`, spravne: o.kratkyNazev, spatne: nazvy, vysvetleni: `${p.text} patří k otázce ${o.cislo}. ${o.kratkyNazev}.` });
  }
  // 3) Ke které sekci (oboru) patří příklad?
  const sekce = [...new Set(o.sekce.map((s) => s.nadpis))];
  for (const p of o.priklady) {
    if (p.sekceIndex == null) continue;
    const spr = o.sekce[p.sekceIndex].nadpis;
    const spatne = sekce.filter((x) => x !== spr);
    if (spatne.length >= 2) pool.push({ typ: 'sekce', otazka: `Do které části otázky patří „${p.text}“?`, spravne: spr, spatne, vysvetleni: `${p.text} → ${spr}` });
  }
  return pool;
}
