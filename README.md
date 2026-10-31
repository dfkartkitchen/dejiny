# Dějiny výtvarné kultury – maturitní web 2026/27

Vzdělávací web pro studenty, kteří se připravují na profilovou maturitu z Dějin výtvarné kultury. Vytvořilo [DFK Studio](https://dfkstudio.cz).
Připravuje na profilovou maturitu z Dějin výtvarné kultury: 30 otázek, časová osa, kartičky, mini kvízy, režim zkoušení a režim projektoru. Funguje i offline (PWA).

**Stack:** Astro 5 (statický výstup) · písma Fraunces + Instrument Sans · vanilla JS · GSAP + ScrollTrigger · Lenis · sharp · Workbox (@vite-pwa/astro)

---

## Rychlý start

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # výstup do dist/
npm run preview    # náhled sestaveného webu
```

Vyžaduje Node.js 20 nebo novější.

## Co dělá `npm run build`

1. **`npm run data`** – `scripts/build-data.mjs` rozparsuje `obsah.md` do `src/data/otazky.json`
   (30 otázek, sekce, tučná zvýraznění, příklady). Validace ověří, že se neztratilo žádné slovo; při chybě build zastaví.
2. **`npm run images`** – `scripts/build-images.mjs`
   - vezme ilustraci z `podklady/obrazky/qNN.png`, nebo ji **stáhne z odkazu v `obrazky.json`**,
   - vyrobí AVIF + WebP v šířkách 640 / 1280 / 1920, OG obrázek 1200×630 a rozmazaný placeholder (LQIP),
   - stáhne videa z `podklady/videa/seznam.json` do `public/video/`,
   - když obrázek nejde získat, vytvoří **dočasný zástupný obrázek** v barvě epochy (web se dá sestavit i bez sítě).
3. **`astro build`** – 64 statických stránek, manifest a service worker.

První build trvá několik minut (převod 30 obrázků do AVIF). Další buildy hotové obrázky přeskočí.

## Nasazení

### Netlify (doporučeno)
1. Nahraj projekt do repozitáře na GitHubu.
2. Netlify → **Add new site → Import an existing project** → vyber repozitář.
3. Nastavení se načte z `netlify.toml` (build `npm run build`, složka `dist`, Node 22). Potvrď **Deploy**.
4. Ilustrace a videa se při buildu stáhnou z Higgsfieldu automaticky.

### Vercel
1. Vercel → **Add New → Project** → importuj repozitář.
2. Nastavení se načte z `vercel.json`. Potvrď **Deploy**.

### Vlastní doména
Nastav proměnnou prostředí `SITE_URL` (např. `https://dejiny.dfkstudio.cz`). Používá se pro kanonické adresy a odkazy na náhledové obrázky při sdílení.

## Struktura projektu

```
obsah.md                 texty otázek (zdroj pravdy – úpravy dělej tady)
obrazky.json             odkazy na 30 ilustrací (Higgsfield)
podklady/
  higgsfield-video-prompty.md   prompty pro videa
  videa/seznam.json              vygenerovaná videa + nastavení pro případné přegenerování
scripts/
  build-data.mjs         obsah.md → src/data/otazky.json
  build-images.mjs       obrázky a videa
  build-icons.mjs        ikony aplikace (spustit ručně: npm run icons)
  export-preview.mjs     náhled s relativními cestami (sdílení bez serveru)
src/
  data/                  generovaná data
  lib/data.js            pomocné funkce
  lib/studium.js         generování kartiček a kvízů z textu
  layouts/Base.astro     hlavička, SEO, OG, motiv, projektor
  pages/                 úvod + osa, přehled, otazka/[slug], kviz/[slug], karticky, zkouseni
  scripts/app.js         Lenis, scroll animace, postup studia, offline
  styles/global.css      vizuální styl (barvy epoch, typografie, komponenty)
```

## Úprava obsahu

- **Text otázky:** uprav `obsah.md` (zachovej strukturu `## N. Název`, `**O čem to je:**`, `###` / tučné nadpisy sekcí, odrážky, `**Příklady k zapamatování:**`) a spusť `npm run build`.
- **Nová ilustrace:** ulož ji jako `podklady/obrazky/qNN.png` (16:9) nebo změň odkaz v `obrazky.json` a smaž `public/img/qNN-*`.
- **Videa v top kvalitě:** vygeneruj je znovu podle `podklady/videa/seznam.json` (stejné vstupy, `mode: pro`), nahraď `url` a smaž starý soubor v `public/video/`.

## Funkce

| Funkce | Kde | Poznámka |
| --- | --- | --- |
| Časová osa | úvod | desktop vodorovná (scroll), mobil svislá; akcent podle epochy; videa epoch na pozadí |
| Stránka otázky | `/otazka/…/` | Ken Burns + parallax, perex, sekce, otočné štítky, čas čtení, postup studia |
| Přehled | `/prehled/` | filtr epoch, fulltext bez diakritiky |
| Režim zkoušení | `/zkouseni/` | losování, 2 + 2 min, skrytá osnova, Wake Lock |
| Kartičky | `/karticky/` | 372 kartiček z tučných pojmů, filtr otázka/epocha |
| Mini kvíz | `/kviz/…/` | 5 otázek: umělec, sloh, obor; distraktory ze stejné epochy |
| Postup studia | všude | Neumím / Opakuji / Umím v `localStorage`, ukazatel „X/30“ |
| Projektor | klávesa **P** nebo tlačítko | větší písmo, bez animací, šipky ← → |
| Offline | PWA | všechny stránky + obrázky 640/1280 AVIF v cache |

Všechny animace respektují `prefers-reduced-motion`.

## Kontrola kvality (mobil, Lighthouse 12)

| Stránka | Výkon | Přístupnost | Best practices | SEO |
| --- | --- | --- | --- | --- |
| Úvod | 93 | 100 | 100 | 100 |
| Otázka | 96 | 100 | 100 | 100 |
| Přehled | 100 | 100 | 100 | 100 |
| Kvíz | 96 | 100 | 100 | 100 |

Měřeno se zástupnými obrázky. Se skutečnými ilustracemi doporučuju měření zopakovat po nasazení.
