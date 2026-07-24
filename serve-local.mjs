import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".xml": "application/xml; charset=utf-8"
};

function mapUrl(url) {
  const parsed = new URL(url, "http://localhost");
  let pathname = decodeURIComponent(parsed.pathname);

  if (pathname === "/") return "index.html";
  if (pathname === "/supermanual" || pathname === "/supermanual/") {
    return "supermanual/index.html";
  }
  if (pathname.startsWith("/supermanual/")) {
    pathname = pathname.replace(/^\/supermanual/, "") || "/";
  }

  const relative = pathname.replace(/^\//, "");
  if (!relative) return "index.html";
  if (relative.endsWith("/")) return `${relative}index.html`;
  if (relative.endsWith(".html")) {
    const clean = relative.replace(/\.html$/, "");
    return clean === "index" ? "index.html" : `${clean}/index.html`;
  }
  if (!path.extname(relative)) return `${relative}/index.html`;
  return relative;
}

http.createServer((request, response) => {
  if (request.url?.startsWith("/api/leads") && request.method === "POST") {
    request.resume();
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ ok: true, local: true }));
    return;
  }

  const relative = mapUrl(request.url || "/");
  const file = path.resolve(root, relative);
  const inRoot = file === root || file.startsWith(root + path.sep);

  if (!inRoot || !fs.existsSync(file)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": types[path.extname(file)] || "application/octet-stream"
  });
  fs.createReadStream(file).pipe(response);
}).listen(4177, "127.0.0.1");
