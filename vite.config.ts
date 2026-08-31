/* Editorial Radar runtime: static React report with a small storage proxy for lifecycle-safe generated assets. */
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { handlePilotUsers } from "./server/pilotUserApi.mjs";

function storageProxy(): Plugin {
  return {
    name: "manus-storage-proxy",
    configureServer(server) {
      server.middlewares.use("/manus-storage", async (req, res) => {
        const key = req.url?.replace(/^\//, "");
        if (!key) { res.writeHead(400); res.end("Missing storage key"); return; }
        const base = (process.env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, "");
        const token = process.env.BUILT_IN_FORGE_API_KEY;
        if (!base || !token) { res.writeHead(500); res.end("Storage proxy not configured"); return; }
        try {
          const url = new URL("v1/storage/presign/get", `${base}/`);
          url.searchParams.set("path", key);
          const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
          if (!response.ok) { res.writeHead(502); res.end("Storage backend error"); return; }
          const body = await response.json() as { url?: string };
          if (!body.url) { res.writeHead(502); res.end("Empty signed URL"); return; }
          res.writeHead(307, { Location: body.url, "Cache-Control": "no-store" });
          res.end();
        } catch { res.writeHead(502); res.end("Storage proxy error"); }
      });
    },
  };
}

function pilotUserApi(): Plugin {
  return {
    name: "pilot-user-api",
    configureServer(server) {
      server.middlewares.use("/api/pilot/users", (req, res) => { void handlePilotUsers(req, res); });
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), storageProxy(), pilotUserApi()],
  esbuild: { jsx: "automatic" },
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL || ""),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""),
  },
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "client", "src") } },
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  // jsPDF exposes an optional html() plugin that imports html2canvas. V59 uses
  // its direct PNG API only, so externalize that unused optional plugin rather
  // than bundling a second DOM-capture engine into the client.
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: { external: ["html2canvas"] },
  },
  server: { port: 3000, strictPort: false, host: true, allowedHosts: [".manuspre.computer", ".manus.computer", ".manus-asia.computer", "localhost", "127.0.0.1"] },
});
