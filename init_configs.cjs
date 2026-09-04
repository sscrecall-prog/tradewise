const fs = require('fs');
const path = require('path');

const baseDir = __dirname;

// tsconfig.json
fs.writeFileSync(path.join(baseDir, 'tsconfig.json'), JSON.stringify({
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}, null, 2));

// tsconfig.node.json
fs.writeFileSync(path.join(baseDir, 'tsconfig.node.json'), JSON.stringify({
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}, null, 2));

// vite.config.ts
fs.writeFileSync(path.join(baseDir, 'vite.config.ts'), `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
});
`);

// postcss.config.js
fs.writeFileSync(path.join(baseDir, 'postcss.config.js'), `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`);

// tailwind.config.js
fs.writeFileSync(path.join(baseDir, 'tailwind.config.js'), `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          card: 'var(--color-bg-card)',
          elevated: 'var(--color-bg-elevated)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        border: {
          subtle: 'var(--color-border)',
        },
        brand: {
          positive: '#35C98A',
          negative: '#F05D5E',
          warning: '#F2B84B',
          accent: '#C9A227',
          accentHover: '#E0B530',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}
`);

// index.html
fs.writeFileSync(path.join(baseDir, 'index.html'), `<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/logo.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#090A0F" />
    <meta name="description" content="TRADEWISE — Beginner Indian Stock Market Trading Companion. Learn, Plan, Practice, Journal, Analyze, Improve." />
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <title>TRADEWISE | Indian Stock Market Trading Companion</title>
  </head>
  <body class="bg-bg-primary text-text-primary antialiased selection:bg-brand-accent/20 selection:text-brand-accent min-h-screen font-sans">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);

// Create public directory and assets
const publicDir = path.join(baseDir, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// manifest.webmanifest
fs.writeFileSync(path.join(publicDir, 'manifest.webmanifest'), JSON.stringify({
  "name": "TRADEWISE — Indian Stock Market Trading Companion",
  "short_name": "TRADEWISE",
  "description": "Learn, Plan, Practice, Journal, Analyze, Improve.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#090A0F",
  "theme_color": "#090A0F",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}, null, 2));

// logo.svg
fs.writeFileSync(path.join(publicDir, 'logo.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#C9A227" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 3v18h18" />
  <path d="m19 9-5 5-4-4-3 3" />
  <circle cx="19" cy="9" r="2" fill="#C9A227" />
</svg>`);

// sw.js (PWA service worker)
fs.writeFileSync(path.join(publicDir, 'sw.js'), `const CACHE_NAME = 'tradewise-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/logo.svg',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => caches.match('/index.html'));
    })
  );
});
`);

console.log('Configs and Public assets created successfully');
