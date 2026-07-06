import fs from "node:fs";
import path from "node:path";

const pageMap = {
  "source/published-site/index.html": "index.html",
  "source/published-site/supermanual.html": "supermanual/index.html",
  "source/published-site/acesso.html": "acesso/index.html",
  "source/published-site/brincadeiras.html": "brincadeiras/index.html",
  "source/published-site/item.html": "item/index.html",
  "source/published-site/cantigas.html": "cantigas/index.html",
  "source/published-site/adivinhas.html": "adivinhas/index.html",
  "source/published-site/desafios.html": "desafios/index.html",
  "source/published-site/dobraduras.html": "dobraduras/index.html",
  "source/published-site/e-se.html": "e-se/index.html",
  "source/published-site/trava-linguas.html": "trava-linguas/index.html",
  "source/published-site/assets-app.js": "assets/js/app.js",
  "source/published-site/assets-generated-data.js": "assets/js/generated-data.js"
};

for (const [source, destination] of Object.entries(pageMap)) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

const replacements = [
  ["assets/styles.css", "/assets/css/styles.css"],
  ["assets/app.js", "/assets/js/app.js"],
  ["assets/generated-data.js", "/assets/js/generated-data.js"],
  ["assets/supermanual-logo.png", "/assets/images/supermanual-logo.png"],
  ["assets/aquarelada-logo.png", "/assets/images/aquarelada-logo.png"],
  ["assets/hero-brinquedos.png", "/assets/images/hero-brinquedos.png"],
  ["assets/app-icon-180.png", "/assets/icons/app-icon-180.png"],
  ["assets/app-icon-192.png", "/assets/icons/app-icon-192.png"],
  ["assets/app-icon-512.png", "/assets/icons/app-icon-512.png"],
  ["assets/pdfs/", "/assets/pdfs/"],
  ["assets/plays/", "/assets/plays/"],
  ["manifest.webmanifest", "/manifest.webmanifest"],
  ["acesso.html", "/acesso/"],
  ["brincadeiras.html", "/brincadeiras/"],
  ["cantigas.html", "/cantigas/"],
  ["adivinhas.html", "/adivinhas/"],
  ["desafios.html", "/desafios/"],
  ["dobraduras.html", "/dobraduras/"],
  ["e-se.html", "/e-se/"],
  ["trava-linguas.html", "/trava-linguas/"],
  ["item.html", "/item/"]
];

const editableExtensions = new Set([".html", ".js", ".css", ".webmanifest", ".json", ".xml"]);
const skipParts = new Set([".git", ".agents", "source"]);

function collectFiles(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (skipParts.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, files);
    } else if (editableExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

for (const file of collectFiles(".")) {
  let content = fs.readFileSync(file, "utf8");
  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }
  content = content.split('url("hero-brinquedos.png")').join('url("../images/hero-brinquedos.png")');
  fs.writeFileSync(file, content, "utf8");
}
