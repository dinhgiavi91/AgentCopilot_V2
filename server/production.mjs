import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { handlePilotUsers } from "./pilotUserApi.mjs";

const port = Number(process.env.PORT || 3000);
const publicDir = path.resolve(process.cwd(), "dist", "public");
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

function safePath(requestPath) {
  const normalized = path.posix.normalize(requestPath).replace(/^\/+/, "");
  const resolved = path.resolve(publicDir, normalized || "index.html");
  return resolved.startsWith(publicDir) ? resolved : null;
}

const server = createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url || "/", "http://localhost").pathname;
    if (pathname === "/api/pilot/users") {
      await handlePilotUsers(req, res);
      return;
    }
    const requestedFile = safePath(pathname);
    const fallbackFile = path.join(publicDir, "index.html");
    let filePath = requestedFile;

    try {
      if (!filePath || !(await stat(filePath)).isFile()) filePath = fallbackFile;
    } catch {
      filePath = fallbackFile;
    }

    const body = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream",
      "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
    });
    res.end(body);
  } catch (error) {
    console.error("[Agent Copilot] Static server error", error);
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Internal Server Error");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`[Agent Copilot] Static server listening on port ${port}`);
});
