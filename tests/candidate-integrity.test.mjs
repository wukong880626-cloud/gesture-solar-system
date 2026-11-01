import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(resolve(root, 'candidate.json'), 'utf8'));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

test('accepted candidate fingerprint is self-consistent', () => {
  const entries = Object.entries(manifest.runtime_files).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
  assert.equal(sha256(JSON.stringify(Object.fromEntries(entries))), manifest.candidate_id);
  assert.equal(manifest.runtime_index_sha256, manifest.runtime_files['index.html']);
});

test('official runtime matches the accepted preview byte for byte', () => {
  const preview = resolve(root, 'preview', manifest.candidate_id.slice(0, 12));
  const previewManifest = JSON.parse(readFileSync(resolve(preview, 'candidate.json'), 'utf8'));
  assert.equal(previewManifest.candidate_id, manifest.candidate_id);
  assert.deepEqual(previewManifest.runtime_files, manifest.runtime_files);
  for (const [path, hash] of Object.entries(manifest.runtime_files)) {
    assert.equal(sha256(readFileSync(resolve(root, path))), hash, `official ${path}`);
    assert.equal(sha256(readFileSync(resolve(preview, path))), hash, `preview ${path}`);
  }
});
