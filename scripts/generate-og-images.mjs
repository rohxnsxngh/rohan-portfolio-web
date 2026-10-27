// Renders one 1200x630 social card per route into public/og/.
//
// Run with `npm run og`, never from `npm run build`: this drives the local
// Chrome binary and Vercel's build image has no browser. The PNGs are
// committed, so a deploy just serves them.
//
// Naming: the card for a route is public/og/<route path with slashes turned
// into dashes>.png, and "/" is "home". So /blog/yc-experience gets the file
// og/blog-yc-experience.png. See ogSlugForPath() below, which Seo.astro can
// reproduce in one line from Astro.url.pathname.

import { spawn } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = path.join(ROOT, "src", "content");
const OUT_DIR = path.join(ROOT, "public", "og");
const FONT_FILE = path.join(ROOT, "public", "fonts", "IBMPlexMono-Regular.woff2");

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// Rendered at 2x and downsampled, because 1x headless text on a black ground
// picks up visible fringing on the thin text-stroke the brand uses.
const WIDTH = 1200;
const HEIGHT = 630;
const SCALE = 2;

// Four at a time keeps every core busy without the machine paging; each
// Chrome here is a fresh process with its own profile.
const CONCURRENCY = 4;

const FOOTER_MARK = "rohxnsxngh.com";

// One entry per top-level route. `label` is the word the nav uses, which is
// not always the directory name (/project is "Projects", /blog is "Writing").
const SECTIONS = [
  { path: "/about", label: "About" },
  { path: "/experience", label: "Experience" },
  { path: "/project", label: "Projects" },
  { path: "/research", label: "Research" },
  { path: "/forge", label: "The Forge" },
  { path: "/blog", label: "Writing" },
  { path: "/art", label: "Art" },
  { path: "/contact", label: "Contact" },
];

// Which collection feeds which route, and what kicker its entries carry.
const COLLECTIONS = [
  { dir: "blog", base: "/blog", kicker: "Writing" },
  { dir: "project", base: "/project", kicker: "Projects" },
  { dir: "research", base: "/research", kicker: "Research" },
  { dir: "experience", base: "/experience", kicker: "Experience" },
];

const FORGE_EXPERIMENTS = [
  { path: "/forge/experiment-1", title: "Experiment 01" },
  { path: "/forge/experiment-2", title: "Experiment 02" },
  { path: "/forge/experiment-3", title: "Experiment 03" },
];

/** The og/ filename stem for a site path. Keep in sync with Seo.astro. */
export function ogSlugForPath(routePath) {
  const trimmed = routePath.replace(/^\/+|\/+$/g, "");
  return trimmed === "" ? "home" : trimmed.replace(/\//g, "-");
}

/**
 * Astro derives a collection slug from the filename: lowercased, whitespace
 * collapsed to dashes. The collection has both an uppercase "3D" and a
 * filename containing a literal space, so neither step is theoretical.
 */
function astroSlug(filename) {
  return filename
    .replace(/\.mdx?$/, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-_.~]/g, "");
}

/**
 * Enough YAML to read this repo's frontmatter: flat `key: value` pairs with
 * optional quotes. Lists and nested maps are skipped rather than parsed,
 * since nothing the card renders lives inside one.
 */
function readFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!match) return {};
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = /^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/.exec(line);
    if (!pair) continue;
    const value = pair[2].trim().replace(/^["'](.*)["']$/, "$1");
    if (value === "" || value.startsWith("[")) continue;
    data[pair[1]] = value;
  }
  return data;
}

/** "2026-09" and "2024-03-02" both become "SEP 2026". Never a month early. */
function formatCardDate(raw) {
  const match = /^(\d{4})-(\d{2})/.exec(String(raw ?? "").trim());
  if (!match) return "";
  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  ];
  return `${months[Number(match[2]) - 1]} ${match[1]}`;
}

async function collectRoutes() {
  const routes = [
    {
      path: "/",
      kicker: "Engineer • Builder • Creator",
      title: "Rohan Singh",
      // The homepage hero's own line, so the card and the page agree.
      subtitle: "Keep Building",
      meta: "",
    },
    // Section titles are one or two words set very large, which is a strong
    // enough card on its own; a strapline here would have to be copied out of
    // each page and would drift the first time one is reworded.
    ...SECTIONS.map((section) => ({
      path: section.path,
      kicker: "Rohan Singh",
      title: section.label,
      subtitle: "",
      meta: "",
    })),
    ...FORGE_EXPERIMENTS.map((experiment) => ({
      path: experiment.path,
      kicker: "The Forge",
      title: experiment.title,
      subtitle: "",
      meta: "",
    })),
  ];

  for (const collection of COLLECTIONS) {
    const dir = path.join(CONTENT_DIR, collection.dir);
    const files = (await readdir(dir)).filter((name) => /\.mdx?$/.test(name));
    for (const file of files.sort()) {
      const data = readFrontmatter(await readFile(path.join(dir, file), "utf8"));
      // An experience entry's `title` is a job title, which reads as half a
      // sentence on its own; the employer is the headline and the role is the
      // line under it. Everything else leads with its title and explains
      // itself with the description it already carries.
      const isRole = Boolean(data.company);
      routes.push({
        path: `${collection.base}/${astroSlug(file)}`,
        kicker: collection.kicker,
        title: (isRole ? data.company : data.title) || astroSlug(file),
        subtitle: (isRole ? data.title : data.description) || "",
        meta: formatCardDate(data.date),
      });
    }
  }

  return routes;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildHtml(route, fontDataUri) {
  return `<!doctype html>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: 'IBM Plex Mono';
    src: url('${fontDataUri}') format('woff2');
    font-weight: normal;
    font-style: normal;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  html, body {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    overflow: hidden;
    background: #000000;
  }

  .card {
    position: relative;
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    padding: 58px 68px 52px;
    display: flex;
    flex-direction: column;
    background: #000000;
    color: #ffffff;
    font-family: 'IBM Plex Mono', monospace;
    -webkit-font-smoothing: antialiased;
  }

  /* The same 100px lattice at 3% white the homepage hero lays over its 3D
     scene, so a card and the page it links to share a texture. Kept to hard
     1px lines and flat black elsewhere: a soft radial wash over near-black
     posterises into visible rings once the PNG is quantised, which is what
     made the first pass look like a debug screenshot. */
  .grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.055) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.055) 1px, transparent 1px);
    background-size: 100px 100px;
    background-position: -1px -1px;
  }

  .layer { position: relative; display: flex; flex-direction: column; height: 100%; }

  .kicker {
    flex: none;
    display: flex;
    align-items: center;
    gap: 20px;
    font-size: 18px;
    line-height: 1;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    white-space: nowrap;
    color: rgba(255, 255, 255, 0.72);
  }

  .kicker .rule { width: 54px; height: 3px; background: #ffffff; flex: none; }

  .body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 0;
    padding: 34px 0 30px;
  }

  .title {
    /* Both children opt out of flex shrinking. Left to the default the
       subtitle, being the only one with overflow:hidden, absorbs the whole
       overflow of a long title and collapses to nothing. */
    flex: none;
    max-width: 986px;
    font-size: 280px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.055em;
    text-transform: uppercase;
    color: #ffffff;
    /* The hero outlines its display type; on a card the same stroke is what
       pushes Chrome's synthetic bold the last step to the black weight the
       site reads as. */
    -webkit-text-stroke: 1.5px #ffffff;
    text-wrap: balance;
  }

  /* Two lines, then an ellipsis. Descriptions in the collections run to 230
     characters, which is a paragraph, not a card. */
  .subtitle {
    flex: none;
    max-width: 880px;
    margin-top: 26px;
    font-size: 23px;
    line-height: 1.42;
    letter-spacing: 0.01em;
    color: rgba(255, 255, 255, 0.56);
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .foot {
    flex: none;
    border-top: 1px solid rgba(255, 255, 255, 0.18);
    padding-top: 24px;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 40px;
    font-size: 17px;
    line-height: 1;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .foot .mark { color: rgba(255, 255, 255, 0.88); }
  .foot .meta { color: rgba(255, 255, 255, 0.42); letter-spacing: 0.26em; }
</style>

<div class="card">
  <div class="grid"></div>

  <div class="layer">
    <div class="kicker"><span class="rule"></span>${escapeHtml(route.kicker)}</div>

    <div class="body" id="body">
      <div class="title" id="title">${escapeHtml(route.title)}</div>
      ${route.subtitle ? `<div class="subtitle" id="subtitle">${escapeHtml(route.subtitle)}</div>` : ""}
    </div>

    <div class="foot">
      <span class="mark">${escapeHtml(FOOTER_MARK)}</span>
      <span class="meta">${escapeHtml(route.meta ?? "")}</span>
    </div>
  </div>
</div>

<script>
  // Titles run from "Art" to "How to Get a Software Engineering Internship as
  // a Mechanical Engineer". Picking a size per length in Node guesses; letting
  // the browser shrink until the real laid-out block fits its box is exact.
  function fit() {
    var box = document.getElementById('body');
    var title = document.getElementById('title');
    var subtitle = document.getElementById('subtitle');

    for (var size = 280; size >= 34; size -= 2) {
      title.style.fontSize = size + 'px';
      // Tracking tightens as the type grows, the way the hero's does across
      // its breakpoints, so a short title is never loosely set and a long one
      // never looks slack. It stops short of the hero's -0.1em: at that value
      // adjacent stems actually touch, which on a 1200px preview reads as a
      // rendering fault rather than as a deliberately tight setting.
      title.style.letterSpacing =
        (size >= 92 ? -0.055 : size >= 60 ? -0.04 : -0.03) + 'em';

      var used = title.scrollHeight + (subtitle ? subtitle.offsetHeight + 26 : 0);
      // Uppercase set at line-height 1 overflows its line boxes, and the
      // 1.5px stroke sits outside the glyph box on top of that, so measured
      // height runs short of inked height. Stopping at 90% of the box keeps
      // the last line clear of the footer rule instead of touching it.
      var fitsHeight = used <= box.clientHeight * 0.9;
      // Wrapped text makes scrollWidth equal clientWidth, so this only fires
      // on a word too long to break, such as a 20-character title set at the
      // starting size. Demanding any slack here would never be satisfiable
      // and would drive every multi-line title down to the floor.
      var fitsWidth = title.scrollWidth <= title.clientWidth;
      if (fitsHeight && fitsWidth) break;
    }
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fit);
  } else {
    fit();
  }
</script>
`;
}

/**
 * Headless Chrome writes the screenshot promptly and then, in --headless=new,
 * routinely fails to exit: waiting on the process turns a 2 second render
 * into a 60 second one. Wait for the PNG to appear and stop growing, then
 * kill it.
 */
async function screenshot(htmlPath, outPath, profileDir) {
  await rm(outPath, { force: true });

  const child = spawn(
    CHROME,
    [
      "--headless=new",
      `--screenshot=${outPath}`,
      `--window-size=${WIDTH},${HEIGHT}`,
      `--force-device-scale-factor=${SCALE}`,
      "--hide-scrollbars",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      // Its own profile, so this never contends with the Chrome the user has
      // open and never writes into their real one.
      `--user-data-dir=${profileDir}`,
      pathToFileURL(htmlPath).href,
    ],
    { stdio: "ignore" }
  );

  const deadline = Date.now() + 45_000;
  let previousSize = -1;

  try {
    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      let size = -1;
      try {
        size = (await stat(outPath)).size;
      } catch {
        // Not written yet.
      }
      if (size > 0 && size === previousSize) return;
      previousSize = size;
    }
    throw new Error(`Chrome never produced ${path.basename(outPath)}`);
  } finally {
    child.kill("SIGKILL");
  }
}

async function renderOne(route, workDir, fontDataUri) {
  const slug = ogSlugForPath(route.path);
  const htmlPath = path.join(workDir, `${slug}.html`);
  const rawPath = path.join(workDir, `${slug}.raw.png`);

  await writeFile(htmlPath, buildHtml(route, fontDataUri), "utf8");
  await screenshot(htmlPath, rawPath, path.join(workDir, `profile-${slug}`));

  const outPath = path.join(OUT_DIR, `${slug}.png`);
  const { size } = await sharp(rawPath)
    .resize(WIDTH, HEIGHT, { kernel: "lanczos3" })
    // The card is black, white and the greys between them, so an indexed
    // palette is lossless to the eye at a fraction of truecolour. There is no
    // gradient left to posterise.
    .png({ palette: true, colors: 64, dither: 0, effort: 10, compressionLevel: 9 })
    .toFile(outPath);

  return { slug, size };
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

async function main() {
  if (!existsSync(CHROME)) {
    throw new Error(`Chrome not found at ${CHROME}. This script only runs locally.`);
  }

  const fontDataUri = `data:font/woff2;base64,${(await readFile(FONT_FILE)).toString("base64")}`;
  const routes = await collectRoutes();

  await mkdir(OUT_DIR, { recursive: true });
  const workDir = await mkdtemp(path.join(tmpdir(), "og-cards-"));

  try {
    const results = await mapWithConcurrency(routes, CONCURRENCY, (route) =>
      renderOne(route, workDir, fontDataUri)
    );

    results.sort((a, b) => b.size - a.size);
    let total = 0;
    for (const result of results) {
      total += result.size;
      console.log(
        `${String(Math.round(result.size / 1024)).padStart(5)} KB  ${result.slug}.png`
      );
    }

    console.log(
      `\n${results.length} cards, ${Math.round(total / 1024)} KB total, ` +
        `largest ${Math.round(results[0].size / 1024)} KB (${results[0].slug}.png)`
    );

    // The point of the palette pass is staying inside what a link unfurler
    // will fetch without timing out; say so rather than letting it drift.
    const over = results.filter((result) => result.size > 120 * 1024);
    if (over.length > 0) {
      console.warn(`\n${over.length} card(s) over 120 KB:`);
      for (const result of over) {
        console.warn(`  ${result.slug}.png ${Math.round(result.size / 1024)} KB`);
      }
      process.exitCode = 1;
    }
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

await main();
