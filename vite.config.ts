import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createHash } from "crypto";
import { VitePWA } from "vite-plugin-pwa";

// Production-only Content-Security-Policy <meta>. Inline scripts in index.html are
// allowed by hash, computed here so the policy can't drift out of sync with them.
// (Dev is skipped: Vite's dev server injects its own inline scripts.)
function csp(): Plugin {
  return {
    name: "csp",
    apply: "build",
    transformIndexHtml(html) {
      const hashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
        ([, js]) => `'sha256-${createHash("sha256").update(js).digest("base64")}'`,
      );
      const policy = [
        "default-src 'self'",
        `script-src 'self' ${hashes.join(" ")}`,
        // 'unsafe-inline' styles: React style={} attributes and the toast library need it.
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob:",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ");
      return html.replace("<head>", `<head>\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`);
    },
  };
}

export default defineConfig({
  server: {
    port: 8080,
  },
  plugins: [
    react(),
    csp(),
    // Installable + works offline. Uses our own public/manifest.webmanifest; the
    // service worker is registered from an external file, so the CSP needs no change.
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "script",
      manifest: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,webmanifest}"],
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com",
            handler: "CacheFirst",
            options: { cacheName: "google-fonts", expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
