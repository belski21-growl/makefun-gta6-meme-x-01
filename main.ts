// gta6-meme-x-01 entry: this program's whole job is to hand POST.json to the
// grader. The post itself is the entry — the house reads it from X (its first
// picture and its text) — so this file copies POST.json from the repository
// root into the output directory and does nothing else. No network, no
// dependencies, Node 22 standard library only.
//
// POST.json currently holds a placeholder address (status 0): the real post
// goes up on X first, then POST.json is replaced with its address and this
// program is run again before submitting.
//
// Local check:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
// ... then out/POST.json is byte-for-byte the POST.json from this repo.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const post = readFileSync(join(botDir, 'POST.json'));
// Fail fast on a malformed POST.json instead of copying garbage to /output:
// the gate refuses anything that is not a JSON object with a url string.
const parsed = JSON.parse(post.toString('utf8')) as { url?: unknown };
if (typeof parsed.url !== 'string' || parsed.url.length === 0) {
  throw new Error('POST.json has no url string');
}
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, 'POST.json'), post);
