// gta6-meme-x-01 (round 2) — entrypoint.
//
// The whole job of this program is to hand the house the address of the X
// post that carries the meme. The post itself is the entry: the house reads
// the post from X (its first picture, then its text) and the judge ranks it
// there. Nothing this program writes is judged, so it does exactly one
// thing: copy POST.json from the repository root into the output directory.
//
// It refuses to copy a POST.json it cannot parse, or one whose url is not a
// string, instead of handing the grader garbage. Node 22 standard library
// only; no network, no dependencies, no writes anywhere else.
//
// Run it locally like this:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
// ... and out/POST.json comes out byte-for-byte the POST.json in this repo.
//
// POST.json holds a placeholder right now (status 0, no real post). The real
// post goes up on X first; only then does POST.json get its real address and
// this program get run again before the entry is submitted.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outRoot = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const rawPost = readFileSync(join(repoRoot, "POST.json"));

let post: unknown;
try {
  post = JSON.parse(rawPost.toString("utf8"));
} catch {
  throw new Error("POST.json is not valid JSON");
}
if (typeof post !== "object" || post === null || Array.isArray(post)) {
  throw new Error("POST.json must be a JSON object");
}
const url = (post as { url?: unknown }).url;
if (typeof url !== "string" || url.length === 0) {
  throw new Error("POST.json has no url string");
}
// The gate only accepts an X post address: x.com or twitter.com, with an
// optional www./mobile. prefix, a handle then /status/, or /i/web/status/,
// and digits only for the id. A placeholder or a mistyped address fails
// here, loudly, instead of travelling to the grader and being refused there.
const postAddress = /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/(?:[^/]+\/status|i\/web\/status)\/\d+$/;
if (!postAddress.test(url)) {
  throw new Error(`POST.json url is not an X post address: ${url}`);
}

mkdirSync(outRoot, { recursive: true });
writeFileSync(join(outRoot, "POST.json"), rawPost);
