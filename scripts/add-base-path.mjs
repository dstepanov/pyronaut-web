/**
 * Prefixes root-absolute URLs in the built HTML with BASE_PATH so the site
 * works on a GitHub Pages project page (https://<user>.github.io/<repo>/).
 *
 * Run after `astro build`:  BASE_PATH=/pyronaut-web node scripts/add-base-path.mjs
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const base = (process.env.BASE_PATH ?? "").replace(/\/$/, "");
if (!base) {
  console.log("BASE_PATH not set — leaving dist/ untouched.");
  process.exit(0);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

let rewritten = 0;
for (const file of walk("dist")) {
  if (!file.endsWith(".html")) continue;
  const html = readFileSync(file, "utf8");
  // href="/x", src="/x", and og content="/x" — but never protocol-relative "//".
  const out = html
    .replace(/(href|src|content)="\/(?!\/)/g, `$1="${base}/`)
    // Astro redirect pages: <meta http-equiv="refresh" content="0;url=/...">
    .replace(/content="(\d+);\s*url=\/(?!\/)/g, `content="$1;url=${base}/`);
  if (out !== html) {
    writeFileSync(file, out);
    rewritten += 1;
  }
}
console.log(`Prefixed ${base} in ${rewritten} HTML files.`);
