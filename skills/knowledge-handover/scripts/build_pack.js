#!/usr/bin/env node
/*
 * Build a Knowledge Pack from knowledge.json (or a pasted save block) plus images.
 *
 *   node build_pack.js <knowledge.json | save-block.txt> [--images DIR] [--out DIR] [--no-zip]
 *
 * Writes <out>/<pack_id>/ and <out>/knowledge-handover_<pack_id>_<date>.zip
 * Prints warnings (missing images, broken branches, unconfirmed safety steps).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const core = require('./pack-core.js');

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

const input = process.argv[2];
if (!input || input.startsWith('--')) {
  console.error('Usage: node build_pack.js <knowledge.json | save-block.txt> [--images DIR] [--out DIR] [--no-zip]');
  process.exit(2);
}
const imagesDir = arg('--images', null);
const outDir = arg('--out', '.');
const noZip = process.argv.includes('--no-zip');

const here = __dirname;
const template = fs.readFileSync(path.join(here, '..', 'assets', 'start-here.template.html'), 'utf8');
const fontsCss = fs.readFileSync(path.join(here, '..', 'assets', 'fonts', 'poppins-prompt.css'), 'utf8');

let parsed;
try {
  parsed = core.parseSave(fs.readFileSync(input, 'utf8'));
} catch (e) {
  console.error('Could not read the pack: ' + e.message);
  process.exit(1);
}

const images = {};
if (imagesDir) {
  for (const name of fs.readdirSync(imagesDir)) {
    if (/\.(jpe?g|png|gif|webp)$/i.test(name)) images[name] = new Uint8Array(fs.readFileSync(path.join(imagesDir, name)));
  }
}

const result = core.build(parsed.pack, images, { template, fontsCss });
for (const f of result.files) {
  const p = path.join(outDir, f.path);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, typeof f.data === 'string' ? f.data : Buffer.from(f.data));
}
let zipPath = null;
if (!noZip) {
  zipPath = path.join(outDir, result.zipName);
  fs.writeFileSync(zipPath, Buffer.from(core.zip(result.files)));
}

const total = result.files.reduce((s, f) => s + (typeof f.data === 'string' ? Buffer.byteLength(f.data) : f.data.length), 0);
console.log('Pack ' + result.root + ' v' + (result.pack.version || 1) + (parsed.blocks > 1 ? ' (merged from ' + parsed.blocks + ' blocks)' : ''));
console.log('  folder: ' + path.join(outDir, result.root));
if (zipPath) console.log('  zip:    ' + zipPath);
console.log('  files:  ' + result.files.length + ', ' + Math.round(total / 1024) + ' KB');
if (result.warnings.length) {
  console.log('Warnings:');
  result.warnings.forEach((w) => console.log('  - ' + w));
}
