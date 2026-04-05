import sharp from "sharp";
import { readdir, stat, mkdir, copyFile } from "node:fs/promises";
import { join, dirname } from "node:path";

const SRC_DIR = "frog-images-src";
const OUT_DIR = "frog-images-optimized";
const CONCURRENCY = 20;

// Lossless re-compression for already-indexed PNGs
const INDEXED_PNG_OPTS = {
  compressionLevel: 9,
  effort: 10,
  palette: true,
  quality: 100,
};

// Palette quantization for RGBA _c variant PNGs
const RGBA_PNG_OPTS = {
  compressionLevel: 9,
  effort: 10,
  palette: true,
  quality: 80,
  dither: 1.0,
};

async function optimizeImage(srcPath, outPath, pngOpts) {
  await mkdir(dirname(outPath), { recursive: true });

  const srcStat = await stat(srcPath);

  await sharp(srcPath).png(pngOpts).toFile(outPath);

  const outStat = await stat(outPath);

  // If output is larger, keep the original
  if (outStat.size >= srcStat.size) {
    await copyFile(srcPath, outPath);
    return { srcPath, srcSize: srcStat.size, outSize: srcStat.size, savings: 0, pct: "0.0" };
  }

  const savings = srcStat.size - outStat.size;
  const pct = ((savings / srcStat.size) * 100).toFixed(1);
  return { srcPath, srcSize: srcStat.size, outSize: outStat.size, savings, pct };
}

async function processWithConcurrency(tasks, concurrency) {
  const results = [];
  const executing = new Set();

  for (const task of tasks) {
    const p = task().then((r) => {
      executing.delete(p);
      return r;
    });
    executing.add(p);
    results.push(p);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

async function main() {
  const startTime = Date.now();
  const subdirs = ["square", "wide"];
  const tasks = [];
  let hadError = false;

  for (const subdir of subdirs) {
    const srcSubdir = join(SRC_DIR, subdir);
    const outSubdir = join(OUT_DIR, subdir);
    const files = (await readdir(srcSubdir)).filter((f) => f.endsWith(".png"));

    for (const file of files) {
      const srcPath = join(srcSubdir, file);
      const outPath = join(outSubdir, file);
      const isRgba = subdir === "wide" && file.endsWith("_c.png");
      const opts = isRgba ? RGBA_PNG_OPTS : INDEXED_PNG_OPTS;

      tasks.push(() =>
        optimizeImage(srcPath, outPath, opts).catch((err) => {
          console.error(`  FAIL: ${srcPath} — ${err.message}`);
          hadError = true;
          return null;
        })
      );
    }
  }

  console.log(`Processing ${tasks.length} images...\n`);
  const results = (await processWithConcurrency(tasks, CONCURRENCY)).filter(Boolean);

  for (const subdir of subdirs) {
    const group = results.filter((r) => r.srcPath.includes(subdir));
    const srcTotal = group.reduce((s, r) => s + r.srcSize, 0);
    const outTotal = group.reduce((s, r) => s + r.outSize, 0);
    const saved = srcTotal - outTotal;
    const pct = srcTotal > 0 ? ((saved / srcTotal) * 100).toFixed(1) : "0.0";
    console.log(`${subdir}/: ${group.length} files`);
    console.log(`  Before: ${formatBytes(srcTotal)}`);
    console.log(`  After:  ${formatBytes(outTotal)}`);
    console.log(`  Saved:  ${formatBytes(saved)} (${pct}%)\n`);
  }

  const totalSrc = results.reduce((s, r) => s + r.srcSize, 0);
  const totalOut = results.reduce((s, r) => s + r.outSize, 0);
  const totalSaved = totalSrc - totalOut;
  const totalPct = totalSrc > 0 ? ((totalSaved / totalSrc) * 100).toFixed(1) : "0.0";
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`Total: ${formatBytes(totalSrc)} → ${formatBytes(totalOut)}`);
  console.log(`Saved: ${formatBytes(totalSaved)} (${totalPct}%)`);
  console.log(`Done in ${elapsed}s`);

  if (hadError) process.exit(1);
}

main();
