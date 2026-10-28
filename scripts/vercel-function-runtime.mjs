/**
 * Pins every emitted Vercel function to the Node.js runtime the build ran on.
 *
 * Why this is a post-build script: @astrojs/vercel 7 only knows Node 18 and 20.
 * On any other major it logs a warning and writes `nodejs18.x` into each
 * function's .vc-config.json, a runtime Vercel no longer offers, so the deploy
 * fails even though the build succeeded. Node 20 was discontinued on Vercel on
 * October 1 2026 and the project now builds on 24 (package.json `engines`).
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';

const FUNCTIONS_DIR = new URL('../.vercel/output/functions/', import.meta.url);
const RUNTIME = `nodejs${process.versions.node.split('.')[0]}.x`;

const entries = await readdir(FUNCTIONS_DIR, { recursive: true });
for (const entry of entries.filter((name) => name.endsWith('.vc-config.json'))) {
  const file = new URL(entry, FUNCTIONS_DIR);
  const config = JSON.parse(await readFile(file, 'utf8'));
  if (config.runtime === RUNTIME) continue;
  console.log(`[vercel-function-runtime] ${entry}: ${config.runtime} -> ${RUNTIME}`);
  config.runtime = RUNTIME;
  await writeFile(file, JSON.stringify(config, null, '\t'));
}
