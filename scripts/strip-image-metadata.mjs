/**
 * Strip metadata from the raster assets under `public/assets`.
 *
 * Camera and screenshot tools leave EXIF, IPTC, XMP and colour profiles behind,
 * which can carry author names, window titles, capture paths and timestamps
 * into a published page. Re-encoding drops them.
 *
 * Manual only: `npm run optimize-images`. It is never part of `build`, because
 * it rewrites files in place and needs a full `sharp` install.
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public", "assets");
const RASTER = new Set([".png", ".jpg", ".jpeg", ".webp"]);

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collect(full)));
      continue;
    }
    if (RASTER.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }

  return files;
}

async function stripMetadata(file) {
  const input = await readFile(file);
  const extension = path.extname(file).toLowerCase();
  const metadata = await sharp(input, { failOn: "none" }).metadata();

  const hasMetadata = Boolean(
    metadata.exif ||
    metadata.icc ||
    metadata.iptc ||
    metadata.xmp ||
    (metadata.orientation && metadata.orientation !== 1)
  );

  if (!hasMetadata) return false;

  // `rotate()` with no argument bakes the EXIF orientation into the pixels
  // before the tag is discarded, so a rotated photo is not left sideways.
  let pipeline = sharp(input, { failOn: "none" }).rotate();

  if (extension === ".png") {
    pipeline = pipeline.png({ compressionLevel: 9 });
  } else if (extension === ".webp") {
    pipeline = pipeline.webp({ quality: 90 });
  } else {
    pipeline = pipeline.jpeg({ quality: 85, mozjpeg: true });
  }

  const output = await pipeline.toBuffer();

  // Never grow a file or rewrite identical bytes just to drop a metadata block.
  if (output.length > input.length || output.equals(input)) return false;

  await writeFile(file, output);
  return true;
}

async function main() {
  if (process.env.CI || process.env.NETLIFY) {
    console.log("strip-image-metadata: skipped in CI/Netlify");
    return;
  }

  let files;
  try {
    files = await collect(ROOT);
  } catch {
    console.log("strip-image-metadata: no public/assets directory");
    return;
  }

  if (files.length === 0) {
    console.log("strip-image-metadata: no raster files found");
    return;
  }

  let stripped = 0;
  for (const file of files) {
    if (await stripMetadata(file)) {
      stripped += 1;
      console.log(
        `strip-image-metadata: cleaned ${path.relative(process.cwd(), file)}`
      );
    }
  }

  console.log(
    `strip-image-metadata: scanned ${files.length} file(s), cleaned ${stripped}`
  );
}

main().catch((error) => {
  console.error("strip-image-metadata: failed", error);
  process.exit(1);
});
