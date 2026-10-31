# Higgsfield – videa pro web „Dějiny výtvarné kultury“

Materiál na pohyblivý vizuál webu: úvodní smyčka, 30 krátkých videí k otázkám (scroll animace), přechody epoch, animace losování lístku a textury.
Všechno navazuje na hotové ilustrace (styl muzejního dioramatu), aby web působil jako jeden celek.

---

## 0. Společná pravidla (platí pro všechna videa)

**Technické parametry**

| Parametr | Hodnota |
| --- | --- |
| Režim | **Image-to-video** všude, kde je start frame = hotová ilustrace `qNN.png` (konzistence!) |
| Poměr stran | 16:9 (hlavní). Hero navíc 9:16 pro mobil. |
| Rozlišení | 1080p (web si sám udělá 720p a 1080p verze) |
| Délka | 5 s (otázky), 8–10 s (hero smyčka), 3–4 s (přechody, lístek) |
| Snímková frekvence | 24 fps |
| Zvuk | žádný (web přehrává ztlumeně) |
| Kamera | **pomalá, plynulá, bez otřesů, bez střihů**; jeden pohyb na celé video |
| Konec videa | statický, klidný záběr (poslední snímek se na webu „zastaví“ při doscrollování) |

**Pohybový stylový dovětek** – přidej na konec každého promptu:

```
Handcrafted museum diorama, miniature scale model, soft studio lighting, shallow depth of field, rich textures of paper, plaster, stone and wood. Very slow smooth camera movement, steady gimbal, no camera shake, no cuts, no morphing of architecture, objects keep their shape, subtle ambient motion only, cinematic, 24fps, no text, no logos, no people's faces in close-up.
```

**Negativní prompt** (pokud ho model podporuje):

```
fast motion, zoom burst, camera shake, flicker, warping, melting objects, morphing, text, letters, watermark, logo, extra limbs, distorted faces, cuts, scene change, oversaturated
```

**Pojmenování výstupů:** `hero-16x9.mp4`, `hero-9x16.mp4`, `q01.mp4` … `q30.mp4`, `epocha-1.mp4` … `epocha-6.mp4`, `listek.mp4`, `textura-papir.mp4`, `textura-prach.mp4`.
Ulož je do složky `podklady/videa/`. Převod pro web (komprese, verze pro scrubbing) udělám já.

---

## 1. Hero – „galerijní stěna“ (úvodní smyčka)

Pozadí úvodní obrazovky. Běží ztlumeně ve smyčce za velkým nadpisem → musí být **tmavší, klidné a s volným místem uprostřed** pro text.

**Varianta A – text-to-video (doporučeno), 16:9, 10 s, smyčka**

```
A long dim museum gallery wall seen frontally, thirty small framed miniature dioramas arranged in a salon-style grid, each frame lit one after another by a soft warm spotlight that slowly travels from left to right, like time moving from prehistory to the present, the frames contain tiny scenes: a cave with bison paintings, a pyramid, a Greek temple, a Gothic cathedral, a Renaissance dome, a Baroque column, an iron and glass hall, a cubist still life, a modern villa, a pop art wall, warm paper-white wall, deep shadows, generous empty dark space in the center of the composition for a title, seamless loop: the last frame matches the first frame.
```
\+ pohybový stylový dovětek.

**Varianta B – 9:16 pro mobil, 8 s, smyčka**

```
Vertical view of a tall museum wall with a column of small framed miniature dioramas, a soft warm spotlight slowly glides downward from frame to frame, from a prehistoric cave at the top to a contemporary art installation at the bottom, dust particles floating in the light beam, dark paper-white wall, empty calm area in the upper third for a title, seamless loop.
```
\+ pohybový stylový dovětek.

> Tip: když Higgsfield nedá perfektní smyčku, stačí mi 10 s bez smyčky – udělám na webu prolínání konce do začátku (crossfade).

---

## 2. Videa k otázkám (30×, image-to-video, 5 s)

**Použití na webu:** úvodní celoplošný obraz každé otázky. Video se **neposouvá samo, ale podle scrollu** (scroll-scrub): jak student roluje dolů, kamera pomalu najíždí do dioramatu. Na mobilu se šetřením dat a při `prefers-reduced-motion` se zobrazí jen statická ilustrace.

**Postup:** Start frame = `qNN.png`. Prompt = pohyb kamery + jeden jemný ambientní pohyb + stylový dovětek.
Kamera ve všech videích: **pomalý dolly-in (najetí) o cca 15 %, lehký paralaxní posun popředí vůči pozadí.**

| # | Prompt (anglicky – vlož celý řádek + dovětek) |
| --- | --- |
| 01 | Slow dolly-in toward the cave wall, the campfire flickers gently and its warm light breathes across the ochre bison paintings, a few sparks rise, the clay figurine in the foreground stays still. |
| 02 | Slow dolly-in between the pyramid and the ziggurat, golden hour sun slowly lowers, fine sand drifts across the desert floor, heat haze shimmers softly on the horizon. |
| 03 | Slow dolly-in and slight rise toward the marble temple, olive leaves tremble in a light sea breeze, sunlight glints on the sea, the athlete statue and amphora remain still. |
| 04 | Slow dolly-in toward the domed temple, the beam of light through the oculus slowly shifts across the floor, tiny figures of carriages move slowly along the aqueduct road. |
| 05 | Slow dolly-in under the golden dome, candle flames flicker, gold mosaic tesserae sparkle as light moves across them, faint incense smoke drifts upward. |
| 06 | Slow dolly-in toward the snowy rotunda, gentle snowfall, tiny monks walk slowly along the path, the illuminated manuscript pages in the foreground stir slightly. |
| 07 | Slow dolly-in down the Gothic nave, colored light from the rose window slowly travels across the stone floor, dust motes glitter in the colored beams. |
| 08 | Slow dolly-in toward the castle and cathedral on the hill, morning river mist drifts slowly under the stone bridge, dawn light warms the towers, gold background of the panel painting glints. |
| 09 | Slow dolly-in across the workshop table toward the wooden dome model, afternoon light slides slowly across the perspective drawing, dust floats in the window beam. |
| 10 | Slow dolly-in toward the marble figure emerging from the block, fine marble dust floats in the air, the sketches on the wall flutter slightly, canal water shimmers through the window. |
| 11 | Slow dolly-in into the arcaded courtyard, soft clouds pass over the sgraffito facade casting moving shadows, the globe in the cabinet of curiosities turns very slowly. |
| 12 | Slow dolly-in toward the curved Baroque facade, the golden spotlight slowly intensifies on the marble sculpture, the drapery seems to catch the light as it shifts. |
| 13 | Slow dolly-in toward the still life on the table, the single shaft of light slowly widens and reveals the pearl and the silver jug, the rococo swing in the side sways gently. |
| 14 | Slow dolly-in across the cobblestone square toward the Holy Trinity column, morning mist slowly lifts, the fountains trickle softly, gilded sculptures catch the first sun. |
| 15 | Slow dolly-in toward the neoclassical portico, leaves move gently in the landscape park, light passes slowly over the smooth marble lovers, distant neo-Gothic castle in soft haze. |
| 16 | Very slow dolly-in behind the lone wanderer, the sea of fog below drifts and rolls slowly, the sunrise sky glows a little brighter, the wanderer remains completely still. |
| 17 | Slow dolly-in through the iron and glass hall, soft steam rises from the locomotive, light beams through the glass roof shift slowly, the daguerreotype camera stays still. |
| 18 | Slow dolly-in toward the village chapel, wheat sways gently in the wind, linden leaves move softly, clouds drift slowly in the overcast sky. |
| 19 | Slow dolly-in toward the theatre on the embankment at dusk, the river reflects the warm lights, the golden stars on the roof catch the last light, lamps along the embankment softly glow on. |
| 20 | Slow dolly-in toward the arched bridge, water lilies float and ripple gently, dappled light flickers on the water, the pointillist corner slowly shimmers with colored dots. |
| 21 | Slow dolly-in into the scene, the starry sky slowly swirls, the cypress sways like a flame, jungle leaves move gently, colors stay bold and painterly. |
| 22 | Slow dolly-in toward the woman framed by floral ornaments, the long hair and lilies move gently as if underwater, light passes across the stained glass and gold leaf. |
| 23 | Slow dolly-in, the geometric facets of the still life slowly rotate a few degrees, the concentric color circles pulse very gently, speed lines drift in the background. |
| 24 | Slow dolly-in across the empty piazza, the long shadows slowly stretch, the spiral tower model turns very slowly on its base, the mannequin stays still. |
| 25 | Slow dolly-in across the architectural composition, light slides from the cubist facade to the functionalist villa, clouds drift around the TV tower on the mountain peak. |
| 26 | Slow lateral dolly along the table of architectural models, soft studio light slides over the white shells and the titanium curves, water flows under the cantilevered house. |
| 27 | Slow dolly-in into the collage landscape, paper cut-outs shift slightly on different depth layers like a paper theatre, ink texture slowly blooms on the paper. |
| 28 | Slow dolly-in into the gallery space, the kinetic mobile turns slowly, the floating color rectangles softly glow, light ripples on the pink salt lake through the window. |
| 29 | Slow dolly-in toward the fragile bronze figures, the heart-shaped light above the castle softly pulses, the escalator moves slowly in the background, the performer stays still. |
| 30 | Slow dolly-in through the contemporary museum hall, the TV screens flicker softly, the artificial sun glows through the haze, porcelain seeds on the floor catch the light. |

---

## 3. Přechody epoch (6×, 3–4 s)

Krátké klipy pro časovou osu: když student při scrollu přejde do nové epochy, za nadpisem epochy proběhne „přechod“. Text-to-video, 16:9, **tmavé, abstraktní, s místem pro velký nadpis vlevo**.

| Epocha | Prompt |
| --- | --- |
| 1 Pravěk a starověk (okr) | Close-up of rough ochre cave rock and sandstone texture, a warm torchlight slowly sweeps across it from left to right, floating dust, dark background, empty space on the left. |
| 2 Středověk (lapis) | Deep lapis-blue stained glass light slowly spreading across an old stone floor, gold leaf particles floating in the beam, dark background, empty space on the left. |
| 3 Renesance (terakota) | Terracotta brick wall and a fine perspective grid drawn in red chalk slowly appearing across it, warm afternoon light, dark background, empty space on the left. |
| 4 Baroko (zlato) | Dramatic chiaroscuro: a golden spotlight slowly reveals swirling gilded stucco ornaments from darkness, dark background, empty space on the left. |
| 5 19. století (patina) | Green copper patina surface of a bronze sculpture and iron rivets, steam softly drifting, soft gaslight glow passing over it, dark background, empty space on the left. |
| 6 20. století (signální červená) | A bold signal-red plane slides across a white gallery wall, sharp geometric shadows, clean minimal light, empty space on the left. |

\+ stylový dovětek (u č. 6 můžeš vynechat „diorama“ a nechat jen „minimal gallery installation“).

---

## 4. Režim zkoušení – „losování lístku“ (4 s)

Hraje při kliknutí na **Náhodná otázka / Režim zkoušení**. Image-to-video nebo text-to-video, 16:9, **končí statickým záběrem lístku bez textu** (číslo otázky dopíše web).

```
Top-down view of an old wooden museum card catalogue drawer filled with cream paper index cards, a hand gently pulls one card up out of the drawer and places it flat on a dark green felt table under a warm desk lamp, the card is blank, the camera slowly settles and the final second is completely still.
```
\+ stylový dovětek.

---

## 5. Textury a efekty (smyčky, přes obsah s nízkou průhledností)

| Soubor | Prompt | Použití |
| --- | --- | --- |
| `textura-prach.mp4` (8 s, smyčka) | Tiny dust particles floating slowly in a soft beam of light on a pure black background, very subtle, seamless loop. | Režim „screen“ přes hero a obrazy otázek. |
| `textura-papir.mp4` (6 s, smyčka) | Extreme macro of warm off-white handmade paper fibers, very slowly shifting soft light, seamless loop. | Jemné pozadí sekcí (opacita ~5 %). |
| `svetlo-reflektor.mp4` (6 s) | A soft warm museum spotlight slowly sweeps across an empty paper-white wall from left to right, pure and minimal. | Přechod mezi úvodem a časovou osou. |

---

## 6. Statické doplňky (generate_image, 16:9 nebo podle poznámky)

| Soubor | Prompt | Použití |
| --- | --- | --- |
| `og-hlavni.png` (1200×630) | Museum gallery wall with small framed miniature dioramas spanning art history from a prehistoric cave to a pop art installation, warm spotlights, generous empty paper-white area on the left for a title. | Náhled při sdílení hlavní stránky. |
| `ikona.png` (1:1, 1024) | A single small framed miniature diorama of a classical column on a warm paper-white background, centered, simple bold silhouette, readable at small size. | Ikona PWA / záložka. |
| `prazdny-stav.png` (4:3) | An empty museum plinth with a small brass label, soft spotlight, paper-white wall. | Hledání bez výsledků. |

---

## 7. Jak to web použije (pro tebe na kontrolu)

- **Hero:** `<video autoplay muted loop playsinline>`, plakát = statický obrázek, na mobilu verze 9:16 v 720p. Video se načítá až po zobrazení textu (neblokuje rychlost).
- **Otázky:** video `qNN` se převede na verzi, kde je každý snímek klíčový (plynulé posouvání tam a zpět) a GSAP ScrollTrigger posouvá `currentTime` podle scrollu. Cíl je do ~1,5 MB na video.
- **Přechody epoch a lístek:** přehrají se jednou, pak zůstane poslední snímek.
- **Šetrnost:** při `prefers-reduced-motion`, úsporném režimu dat nebo v režimu projektoru se videa nenačítají vůbec. Místo nich se ukáže statická ilustrace.
- **Offline (PWA):** do cache jdou jen statické obrázky. Videa se kvůli velikosti ukládají jen u otázek, které student otevřel.

**Pořadí generování podle priority:** 1) hero 16:9 → 2) videa k otázkám 01–30 → 3) lístek → 4) přechody epoch → 5) textury.

---

## 8. Prezentační video webu (Kling 4.0, 25 s, 16:9, jeden záběr)

Jedno souvislé video, které ukazuje, jak web vypadá při scrollu: úvod, časová osa a průřez všemi epochami a otázkami.

**Nastavení:** model Kling 4.0 · mode `reference-to-video` · 25 s · 16:9 · 1080p (≈ 81 kreditů; text-to-video v 720p ≈ 56 kreditů).
**Reference (až 7 obrázků):** q01, q07, q09, q14, q20, q30 (+ volitelně q16), aby video drželo styl tvých ilustrací.

```
One continuous 25-second shot, no cuts: a cinematic screen-capture of a premium educational art history website being scrolled smoothly from top to bottom, framed full-screen 16:9, like an elegant digital museum exhibition catalogue.

0–3 s: Warm paper-white page with subtle paper grain and thin hairline rules. Thirty small framed miniature museum diorama illustrations glide in from all sides and settle into a neat salon-style gallery wall mosaic, behind a large elegant serif headline block. Soft gallery spotlight.

3–6 s: The page scrolls down to a slim horizontal timeline made of six colored segments – ochre, lapis blue, terracotta, gold, patina green and signal red – with small round dots for each question; a glowing marker slides along it.

6–21 s: Smooth continuous scroll through the eras. Each question appears as a wide full-bleed diorama illustration with slow Ken Burns zoom and gentle parallax, followed by clean text panels and small museum label cards that fade and rise into view. The thin accent lines and dots change color with each era:
ochre – a prehistoric cave with bison paintings, pyramids and a ziggurat, a white Greek temple, a Roman aqueduct;
lapis blue – glittering Byzantine gold mosaics, a Romanesque rotunda in snow, a Gothic nave lit by a rose window, a Gothic castle above a stone bridge;
terracotta – a Florentine workshop with a dome model, a marble figure emerging from stone, a sgraffito Renaissance courtyard;
gold – a curved Baroque colonnade, a chiaroscuro still life with a pearl, a Baroque Holy Trinity column on a square;
patina green – a neoclassical portico, a wanderer above a sea of fog, an iron and glass hall, a theatre with a golden roof, a water lily pond, a swirling starry sky, an Art Nouveau floral woman;
signal red – a cubist still life dissolving into colored circles, an empty piazza with long shadows, a white modernist villa, a gallery of dripped paint, a contemporary museum with TV screens and an artificial sun.

21–25 s: Several museum label cards flip over in 3D one after another, small colored progress dots light up, then the view gently pulls back to an overview grid of thirty illustrated cards. The final second is completely still.

Style: handcrafted museum diorama illustrations, miniature scale models, soft studio lighting, warm paper-white and deep charcoal palette, refined minimal editorial layout, generous white space, elegant slow easing, smooth 24fps motion. Typography is shown only as soft blurred serif headline blocks and fine gray text lines, no readable words.
No camera shake, no cuts, no glitches, no warping, no morphing of the illustrations, no readable text, no letters, no logos, no watermark, no mouse cursor, no device frame.
```

**Tipy:**
- Kdyby se v obraze objevovalo rozsypané písmo, zkrať prompt na úseky 0–6 s a 6–25 s a smaž výčet motivů. Reference mu styl dodají samy.
- Výsledek se hodí jako ukázka na sociální sítě, do prezentace pro školu nebo jako náhled webu. Na samotném webu ho nepotřebujeme.
