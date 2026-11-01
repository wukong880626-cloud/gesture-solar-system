import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const base = new URL('https://wukong880626-cloud.github.io/gesture-solar-system/');

test('runtime assets resolve inside the GitHub Pages project subdirectory', () => {
  const imports = JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
  const paths = Object.values(imports).filter(path => !path.endsWith('/'));
  paths.push(html.match(/import\(['"]([^'"]*vision_bundle\.mjs)['"]\)/)[1]);
  paths.push(html.match(/modelAssetPath:\s*['"]([^'"]+)['"]/)[1]);
  const wasm = html.match(/forVisionTasks\(['"]([^'"]+)['"]\)/)[1];
  for (const file of ['vision_wasm_internal.js', 'vision_wasm_internal.wasm', 'vision_wasm_nosimd_internal.js', 'vision_wasm_nosimd_internal.wasm']) paths.push(`${wasm}/${file}`);
  paths.push(...[...html.matchAll(/['"]([^'"\s]+\.(?:jpg|png))['"]/g)].map(m => `textures/${m[1]}`));
  assert.ok(paths.length > 20);
  for (const path of paths) {
    const url = new URL(path, base);
    assert.equal(url.origin, base.origin, path);
    assert.ok(url.pathname.startsWith(base.pathname), `escaped project path: ${path}`);
    const localPath = decodeURIComponent(url.pathname.slice(base.pathname.length));
    assert.ok(existsSync(resolve(root, localPath)), path);
  }
  for (const path of Object.values(imports).filter(path => path.endsWith('/'))) {
    assert.ok(new URL(path, base).pathname.startsWith(base.pathname), path);
    assert.ok(existsSync(resolve(root, path)), path);
  }
});
