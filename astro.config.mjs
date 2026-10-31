import { defineConfig } from 'astro/config';
import AstroPWA from '@vite-pwa/astro';

// Adresa webu po nasazení – změň podle skutečné domény (Netlify / Vercel / vlastní).
const SITE =
  process.env.SITE_URL || // vlastní doména (nastav v Netlify/Vercel → Environment variables)
  process.env.URL || // Netlify
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) || // Vercel
  'https://dejiny-vytvarne-kultury.netlify.app';

export default defineConfig({
  site: SITE,
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
  integrations: [
    AstroPWA({
      registerType: 'autoUpdate',
      injectRegister: false, // registrace je v src/scripts/app.js
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Dějiny výtvarné kultury – maturita 2026/27',
        short_name: 'Dějiny umění',
        description: '30 maturitních otázek z Dějin výtvarné kultury: časová osa, kartičky, kvízy a režim zkoušení.',
        lang: 'cs',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#f4efe6',
        theme_color: '#1d1a16',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // nová verze webu převezme otevřené stránky hned (žádné „staré písmo“ z cache)
        skipWaiting: true,
        clientsClaim: true,
        // předem uložit styly, skripty, písma, ikony a obrázky (AVIF 640 + 1280 px).
        // Stránky (HTML) se NEukládají předem – načítají se vždy čerstvé ze sítě (viz runtimeCaching níže),
        // takže po nasazení nové verze nikdo neuvidí starou podobu webu.
        globPatterns: ['**/*.{css,js,svg,woff2,png}', 'img/*-{640,1280}.avif'],
        globIgnores: ['**/node_modules/**', 'icons/icon-maskable-512.png'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: null,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // stránky: vždy nejdřív ze sítě, uložená kopie jen bez internetu (offline učení)
            urlPattern: ({ request, url }) =>
              request.mode === 'navigate' || (url.origin === self.location.origin && !/\.[a-z0-9]+$/i.test(url.pathname)),
            handler: 'NetworkFirst',
            options: { cacheName: 'stranky', networkTimeoutSeconds: 4, expiration: { maxEntries: 120 } },
          },
          {
            // ostatní velikosti / formáty obrázků se uloží při prvním zobrazení
            urlPattern: ({ url }) => url.pathname.startsWith('/img/'),
            handler: 'CacheFirst',
            options: { cacheName: 'obrazky', expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 180 } },
          },
        ],
      },
    }),
  ],
});
