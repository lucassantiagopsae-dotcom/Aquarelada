import fs from "node:fs";
import path from "node:path";

const skipParts = new Set([".git", ".agents", "source"]);
const textExtensions = new Set([".html", ".js", ".css", ".webmanifest", ".json", ".xml", ".md"]);

function walk(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (skipParts.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function unique(values) {
  return [...new Set(values)].sort();
}

const files = walk(".");
const textFiles = files.filter((file) => textExtensions.has(path.extname(file)));
const missingAssets = [];
const badTextFiles = [];
const absoluteRefs = [];

for (const file of textFiles) {
  const content = fs.readFileSync(file, "utf8");
  if (content.includes("\uFFFD")) {
    badTextFiles.push(file);
  }

  for (const match of content.matchAll(/(?:src|href)="([^"]+)"|url\("([^"]+)"\)/g)) {
    const ref = (match[1] || match[2] || "").split("?")[0];
    if (ref.startsWith("/")) absoluteRefs.push(ref);
  }
}

for (const ref of unique(absoluteRefs)) {
  if (ref.startsWith("/api/")) continue;
  if (/^https?:\/\//.test(ref)) continue;
  const localPath = path.join(".", ref);
  if (!fs.existsSync(localPath)) missingAssets.push(ref);
}

const dataFile = "assets/js/generated-data.js";
const pdfRefs = [];
if (fs.existsSync(dataFile)) {
  const content = fs.readFileSync(dataFile, "utf8");
  for (const match of content.matchAll(/"\/assets\/pdfs\/([^"]+\.pdf)"/g)) {
    pdfRefs.push(match[1]);
  }
}

const pdfFiles = new Set(
  fs.existsSync("assets/pdfs")
    ? fs.readdirSync("assets/pdfs").filter((name) => name.endsWith(".pdf"))
    : []
);
const missingPdfs = unique(pdfRefs.filter((ref) => !pdfFiles.has(ref)));

const result = {
  textFiles: textFiles.length,
  badTextFiles,
  absoluteRefs: unique(absoluteRefs).length,
  missingAssets: unique(missingAssets),
  pdfRefs: unique(pdfRefs).length,
  pdfFiles: pdfFiles.size,
  missingPdfs
};

console.log(JSON.stringify(result, null, 2));

if (badTextFiles.length || missingAssets.length) {
  process.exitCode = 1;
}
