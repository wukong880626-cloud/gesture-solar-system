import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'output/playwright');
mkdirSync(out, { recursive: true });
const cli = process.env.PLAYWRIGHT_CLI || 'playwright-cli';
const session = process.env.PLAYWRIGHT_SESSION || 'solar-acceptance';
const baseURL = process.env.SOLAR_BASE_URL || 'http://127.0.0.1:8766/';
const command = cli.endsWith('.js') ? process.execPath : cli;
const prefix = cli.endsWith('.js') ? [cli] : [];
function run(...args) {
  const r = spawnSync(command, [...prefix, `-s=${session}`, ...args], { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  if (r.error) throw r.error;
  return { ...r, output: (r.stdout || '') + (r.stderr || '') };
}
const summaries = [];
try {
  const launch = run('open', baseURL, ...(process.env.PLAYWRIGHT_CONFIG ? ['--config', process.env.PLAYWRIGHT_CONFIG] : ['--browser', 'chrome']));
  if (launch.status !== 0) throw Error(launch.output);
  for (const name of ['browser-acceptance', 'camera-acceptance', 'touch-safety-acceptance']) {
    const r = run('run-code', '--filename', `tests/${name}.cli.js`);
    writeFileSync(resolve(out, `${name}.log`), r.output);
    const match = r.output.match(/^### Result\r?\n([^\r\n]+)/m);
    if (r.status !== 0 || !match) throw Error(`${name} could not finish; see output/playwright/${name}.log`);
    const result = JSON.parse(match[1]);
    summaries.push({ suite: name, ...result });
    writeFileSync(resolve(out, `${name}.json`), JSON.stringify(result, null, 2) + '\n');
    console.log(`${name}: ${result.passed} passed, ${result.failed} failed`);
    if (result.failed) process.exitCode = 1;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  writeFileSync(resolve(out, 'acceptance-results.json'), JSON.stringify(summaries, null, 2) + '\n');
  run('close'); // Only this named, isolated session is closed.
}
