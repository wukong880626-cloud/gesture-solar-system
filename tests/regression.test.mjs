import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const source = html.split('<script type="module">')[1].split('</script>')[0];
function section(start, end) {
  assert.ok(source.includes(start) && source.includes(end), 'source markers exist');
  return source.slice(source.indexOf(start), source.indexOf(end));
}
class Element {
  constructor() { this.style = {}; this.listeners = {}; this.textContent = ''; this.disabled = false; }
  addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); }
  dispatch(type, values = {}) {
    const event = { type, button: 0, pointerId: 1, clientX: 10, clientY: 10, preventDefault() {}, ...values };
    for (const callback of this.listeners[type] || []) callback(event);
  }
  focus() { this.focused = true; }
  setPointerCapture() {}
}
const deferred = () => {
  let resolve;
  const promise = new Promise(r => resolve = r);
  return { promise, resolve };
};
function cameraHarness({ media, createModel, secure = true } = {}) {
  const elements = new Map();
  const element = id => { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); };
  const track = { stopped: false, stop() { this.stopped = true; }, addEventListener() {} };
  const stream = { getTracks: () => [track], getVideoTracks: () => [track] };
  const model = { closed: false, close() { this.closed = true; }, detectForVideo: () => ({ landmarks: [] }) };
  const video = Object.assign(element('video'), { srcObject: null, videoWidth: 640, videoHeight: 480, readyState: 2, currentTime: 1, play: async () => {}, pause() {} });
  const document = new Element();
  document.getElementById = element;
  const globalEvents = new Element();
  const context = vm.createContext({
    document, window: { isSecureContext: secure }, DOMException, console: { warn() {} },
    navigator: { mediaDevices: { getUserMedia: media || (async () => stream) } },
    video, camOverlay: {}, overlay: element('overlay'), hud: element('hud'), bar: element('bar'), errMsg: element('err-msg'), cursorEl: element('cursor'), canvas: element('scene'),
    landmarker: null, cameraState: 'off', cameraAttempt: 0, detectFrame: null, detectionErrors: 0, gestureMode: 'idle',
    lastRotPos: null, rotVelSample: null, zoomSm: null, zoomRef: null, cursorPx: null, handState: { h0: { pinching: true } }, cam: { vTheta: 1, vPhi: 1 },
    updateBar() {}, stopTour() {}, setHUD(text) { element('hud').textContent = text; }, processHands() {},
    addEventListener: globalEvents.addEventListener.bind(globalEvents),
    requestAnimationFrame: () => 1, cancelAnimationFrame() {}, performance: { now: () => 100 },
    loadVision: async () => ({ FilesetResolver: { forVisionTasks: async () => ({}) }, HandLandmarker: { createFromOptions: createModel || (async () => model) } }),
  });
  const code = section('async function startCamera(', '/* ============ 鼠标 / 触屏');
  // Substitute only the external module import, not camera lifecycle logic.
  vm.runInContext(code.replace("import('./vendor/mediapipe/vision_bundle.mjs')", 'loadVision()'), context);
  return { context, stream, track, model, element, document, globalEvents };
}
function pointerHarness() {
  const canvas = new Element();
  const picked = [];
  const context = vm.createContext({ canvas, Map, Math, downPos: null, wasPinch: false, pointerMoved: false, autoRotate: true,
    innerHeight: 800, cam: { tTheta: 0, tPhi: 1, tRadius: 175, vTheta: 0, vPhi: 0 }, clampPhi: p => Math.max(.12, Math.min(Math.PI - .12, p)),
    focusOn: p => picked.push(p), pickAt: () => 'planet' });
  vm.runInContext(section('const activePointers = new Map();', '/* ============ 主循环'), context);
  return { context, canvas, picked };
}

test('inline application JavaScript parses as an ES module', () => {
  const result = spawnSync(process.execPath, ['--input-type=module', '--check'], { input: source, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});
test('all referenced textures, model, WASM and local Three.js imports exist', () => {
  const textures = [...html.matchAll(/['"]([^'"\s]+\.(?:jpg|png))['"]/g)].map(m => m[1]);
  assert.ok(textures.length > 15);
  for (const name of textures) assert.ok(existsSync(resolve(root, 'textures', name)), name);
  for (const name of ['hand_landmarker.task', 'vision_bundle.mjs', 'wasm/vision_wasm_internal.js', 'wasm/vision_wasm_internal.wasm', 'wasm/vision_wasm_nosimd_internal.js', 'wasm/vision_wasm_nosimd_internal.wasm']) assert.ok(existsSync(resolve(root, 'vendor/mediapipe', name)), name);
  const visited = new Set();
  function visit(code, base) {
    for (const match of code.matchAll(/from\s*['"]([^'"]+)['"]/g)) {
      const spec = match[1];
      const path = spec === 'three' ? resolve(root, 'vendor/three/three.module.js') : spec.startsWith('three/addons/') ? resolve(root, 'vendor/three/examples/jsm', spec.slice(13)) : resolve(base, spec);
      assert.ok(existsSync(path), path);
      if (!visited.has(path)) { visited.add(path); visit(readFileSync(path, 'utf8'), dirname(path)); }
    }
  }
  visit(source, root);
  assert.ok(visited.size >= 10);
});
test('successful camera startup, then camera-free mode releases stream/model and state', async () => {
  const { context: c, track, model } = cameraHarness();
  await c.startGestures();
  assert.equal(c.cameraState, 'on');
  assert.equal(c.overlay.style.display, 'none');
  c.enterBrowseMode();
  assert.equal(track.stopped, true);
  assert.equal(model.closed, true);
  assert.equal(c.video.srcObject, null);
  assert.equal(c.cameraState, 'off');
  assert.equal(c.detectFrame, null);
  assert.equal(Object.keys(c.handState).length, 0);
});
test('model startup failure closes an already-open camera and offers retry', async () => {
  const { context: c, track, element } = cameraHarness({ createModel: async () => { throw Error('model missing'); } });
  await c.startGestures();
  assert.equal(track.stopped, true);
  assert.equal(c.cameraState, 'off');
  assert.equal(c.video.srcObject, null);
  assert.equal(element('start-btn').disabled, false);
  assert.match(c.errMsg.textContent, /vendor/);
});
test('permission denial is recoverable with a camera-free explanation', async () => {
  const { context: c } = cameraHarness({ media: async () => { throw new DOMException('Denied', 'NotAllowedError'); } });
  await c.startGestures();
  assert.equal(c.cameraState, 'off');
  assert.match(c.errMsg.textContent, /无摄像头/);
  assert.equal(c.video.srcObject, null);
});
test('insecure contexts never request camera access', async () => {
  let calls = 0;
  const { context: c } = cameraHarness({ secure: false, media: async () => { calls++; } });
  await c.startGestures();
  assert.equal(calls, 0);
  assert.match(c.errMsg.textContent, /HTTPS/);
});
test('cancelling while permission is pending stops a late stream and does not restart', async () => {
  const pending = deferred();
  const { context: c, stream, track } = cameraHarness({ media: () => pending.promise });
  const startup = c.startGestures();
  c.enterBrowseMode();
  pending.resolve(stream);
  await startup;
  assert.equal(track.stopped, true);
  assert.equal(c.cameraState, 'off');
  assert.equal(c.video.srcObject, null);
});
test('cancelling a pending model closes its late result without activating it', async () => {
  const pending = deferred();
  const { context: c, track, model } = cameraHarness({ createModel: () => pending.promise });
  const startup = c.startGestures();
  await new Promise(resolve => setImmediate(resolve));
  c.enterBrowseMode();
  pending.resolve(model);
  await startup;
  assert.equal(track.stopped, true);
  assert.equal(model.closed, true);
  assert.equal(c.landmarker, null);
  assert.equal(c.cameraState, 'off');
});
test('repeated camera clicks do not create concurrent starts', async () => {
  const pending = deferred(); let requests = 0;
  const { context: c, stream } = cameraHarness({ media: () => { requests++; return pending.promise; } });
  const startup = c.startGestures();
  await c.startGestures();
  assert.equal(requests, 1);
  pending.resolve(stream); await startup; c.stopGestures();
});
test('backgrounding the page closes the active camera', async () => {
  const { context: c, track, document } = cameraHarness();
  await c.startGestures(); document.hidden = true; document.dispatch('visibilitychange');
  assert.equal(track.stopped, true);
  assert.equal(c.cameraState, 'off');
});
test('fifteen consecutive inference errors stop capture rather than silently looping', async () => {
  const { context: c, model, track } = cameraHarness();
  await c.startGestures(); model.detectForVideo = () => { throw Error('GPU lost'); };
  for (let i = 0; i < 15; i++) { c.video.currentTime++; c.detectLoop(); }
  assert.equal(track.stopped, true);
  assert.equal(c.cameraState, 'off');
  assert.match(c.hud.textContent, /连续失败/);
});
test('ordinary pointer click selects; right-click does not', () => {
  const { canvas, picked } = pointerHarness();
  canvas.dispatch('pointerdown'); canvas.dispatch('pointerup'); assert.equal(picked.length, 1);
  canvas.dispatch('pointerdown', { button: 2 }); canvas.dispatch('pointerup', { button: 2 }); assert.equal(picked.length, 1);
});
test('dragging away and back is not mistaken for a click', () => {
  const { canvas, picked } = pointerHarness();
  canvas.dispatch('pointerdown'); canvas.dispatch('pointermove', { clientX: 100 }); canvas.dispatch('pointermove'); canvas.dispatch('pointerup');
  assert.equal(picked.length, 0);
});
test('pinch and pointer cancellation never select a planet', () => {
  const { canvas, picked } = pointerHarness();
  canvas.dispatch('pointerdown'); canvas.dispatch('pointerdown', { pointerId: 2, clientX: 100 });
  canvas.dispatch('pointerup', { pointerId: 2, clientX: 100 }); canvas.dispatch('pointerup');
  canvas.dispatch('pointerdown'); canvas.dispatch('pointercancel'); canvas.dispatch('pointerup');
  assert.equal(picked.length, 0);
});
test('wheel zoom remains positive even for extreme deltas', () => {
  const { canvas, context: c } = pointerHarness();
  canvas.dispatch('wheel', { deltaY: -100000, deltaMode: 0 });
  assert.ok(c.cam.tRadius > 0 && c.cam.tRadius < 175);
  canvas.dispatch('wheel', { deltaY: 100000, deltaMode: 0 });
  assert.ok(Math.abs(c.cam.tRadius - 175) < 1e-8);
});
test('pause stops automatic rotation, inertia, and tour, while preserving a zero speed', () => {
  let tourStops = 0;
  const c = vm.createContext({ TIME: { scale: 1 }, cam: { vTheta: 2, vPhi: 2 }, autoRotate: true, stopTour: () => tourStops++, updateBar() {} });
  vm.runInContext(section('function setSpeed(', "bar.addEventListener('click'"), c);
  c.setSpeed(0);
  assert.equal(c.TIME.scale, 0); assert.equal(c.autoRotate, false); assert.equal(c.cam.vTheta, 0); assert.equal(tourStops, 1);
});

test('canvas keyboard shortcuts rotate, zoom and pause without hijacking modifier chords', () => {
  const canvas = new Element();
  const c = vm.createContext({ canvas, cam: { tTheta: 0, tPhi: 1, tRadius: 175, vTheta: 1, vPhi: 1 }, autoRotate: true,
    TIME: { scale: 1 }, clampPhi: p => p, setSpeed(scale) { this.TIME.scale = scale; } });
  c.setSpeed = scale => c.TIME.scale = scale;
  vm.runInContext(section("canvas.addEventListener('keydown'", '/* ================= 手势控制'), c);
  canvas.dispatch('keydown', { key: 'ArrowLeft' }); assert.equal(c.cam.tTheta, .12);
  canvas.dispatch('keydown', { key: '+' }); assert.equal(c.cam.tRadius, 157.5);
  canvas.dispatch('keydown', { key: ' ' }); assert.equal(c.TIME.scale, 0);
  canvas.dispatch('keydown', { key: 'ArrowLeft', ctrlKey: true }); assert.equal(c.cam.tTheta, .12);
});
test('navigation updates preserve button nodes and expose current pressed state', () => {
  const bar = { children: [], querySelectorAll() { return this.children; }, set innerHTML(value) {
    this.children = [...value.matchAll(/<button\s+([^>]+)>([^<]*)<\/button>/g)].map(([, attrs, text]) => {
      const attributes = Object.fromEntries([...attrs.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(m => [m[1], m[2] ?? '']));
      const classes = new Set((attributes.class || '').split(' '));
      return { textContent: text, dataset: Object.fromEntries(Object.entries(attributes).filter(([key]) => key.startsWith('data-')).map(([key, value]) => [key.slice(5), value])),
        hasAttribute: key => key in attributes, setAttribute: (key, value) => attributes[key] = value, getAttribute: key => attributes[key],
        classList: { contains: key => classes.has(key), toggle: (key, active) => active ? classes.add(key) : classes.delete(key) } };
    });
  } };
  const c = vm.createContext({ bar, tourOrder: ['太阳', '水星', '金星', '地球', '月球', '火星', '木星', '土星', '天王星', '海王星'], focused: null, TIME: { scale: 1 }, cameraState: 'off', tourTimer: null });
  vm.runInContext(section('function updateBar()', 'function setSpeed('), c);
  c.updateBar(); assert.equal(bar.children.length, 17);
  const before = bar.children.slice();
  c.focused = { name: '地球' }; c.TIME.scale = 0; c.cameraState = 'on'; c.updateBar();
  assert.ok(before.every((button, i) => button === bar.children[i]));
  assert.equal(bar.children.find(button => button.dataset.go === '地球').getAttribute('aria-pressed'), 'true');
  assert.equal(bar.children.find(button => button.dataset.speed === '0').getAttribute('aria-pressed'), 'true');
  assert.equal(bar.children.at(-1).textContent, '关闭摄像头');
});

test('a gesture closing the camera preserves its status and schedules no further frame', async () => {
  const { context: c, model, track, document } = cameraHarness();
  await c.startGestures();
  let scheduled = 0;
  c.requestAnimationFrame = () => ++scheduled;
  c.getHand = () => ({ pinching: false });
  c.updatePinch = () => ({ tapped: true });
  c.drawHands = () => {};
  c.updateCursor = () => { c.cursorPx = [10, 10]; return null; };
  document.elementFromPoint = () => ({ closest: () => ({ click: () => c.enterBrowseMode('camera closed by gesture') }) });
  model.detectForVideo = () => ({ landmarks: [[]] });
  vm.runInContext(section('let lastDetectT = 0;', 'async function startCamera('), c);
  c.video.currentTime++;
  c.detectLoop();
  assert.equal(track.stopped, true);
  assert.equal(c.cameraState, 'off');
  assert.equal(c.hud.textContent, 'camera closed by gesture');
  assert.equal(c.detectFrame, null);
  assert.equal(scheduled, 0);
});
test('consecutive post-inference processing errors also reach the shutdown threshold', async () => {
  const { context: c, track } = cameraHarness();
  await c.startGestures();
  c.processHands = () => { throw Error('interaction processing failed'); };
  for (let i = 0; i < 15; i++) { c.video.currentTime++; c.detectLoop(); }
  assert.equal(track.stopped, true);
  assert.equal(c.cameraState, 'off');
  assert.match(c.hud.textContent, /连续失败/);
});
