import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ancorado no próprio arquivo: `npm run dev` funciona de qualquer diretório
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const root = path.join(projectRoot, "public");
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
  ".xml": "application/xml; charset=utf-8",
  ".mp4": "video/mp4",
  ".webm": "video/webm"
};

function loadLocalEnv() {
  const envPath = path.join(projectRoot, ".env.local");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (!key || process.env[key] != null) continue;
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function sendJson(response, payload, status = 200) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function handleLocalMetaCapi(request, response) {
  if (request.method !== "POST") {
    sendJson(response, { error: "Metodo nao permitido" }, 405);
    return;
  }

  try {
    const body = await readJsonBody(request);
    const { POST } = await import("./api/meta-capi.js");
    const apiRequest = new Request("http://127.0.0.1:4177/api/meta-capi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.headers["user-agent"] || "",
        Cookie: request.headers.cookie || ""
      },
      body: JSON.stringify(body)
    });
    const apiResponse = await POST(apiRequest);
    const text = await apiResponse.text();
    response.writeHead(apiResponse.status, { "Content-Type": "application/json; charset=utf-8" });
    response.end(text);
  } catch (error) {
    sendJson(response, { error: "Erro local em /api/meta-capi" }, 500);
    console.error("Erro local em /api/meta-capi:", error && error.message);
  }
}

loadLocalEnv();

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
  if (request.url?.startsWith("/api/meta-capi")) {
    handleLocalMetaCapi(request, response);
    return;
  }

  if (request.url?.startsWith("/api/leads") && request.method === "POST") {
    request.resume();
    sendJson(response, { ok: true, local: true });
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
