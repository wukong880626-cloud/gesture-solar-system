async (page) => {
  const baseURL = page.url();
  await page.goto(baseURL);
  await page.getByRole('button', { name: '🖐️ 无摄像头模式（鼠标 / 触屏 / 键盘）', exact: true }).click();
  const results = [];
  const check = (name, ok, detail = '') => { results.push({ name, pass: !!ok, detail }); };
  const settle = () => page.waitForTimeout(350);
  const read = () => page.evaluate(() => ({ focused: __dbg.focused?.name || null, radius: __dbg.cam.tRadius, theta: __dbg.cam.tTheta, speed: __dbg.TIME.scale, active: document.activeElement?.textContent, activeId: document.activeElement?.id }));
  await page.getByRole('button', { name: '暂停动画', exact: true }).click();
  await settle();
  const rot = () => page.evaluate(() => __dbg.clickable.map(p => p.mesh.rotation.y));
  const r0 = await rot(); await page.waitForTimeout(450);
  check('pause freezes Sun and every selectable planet rotation', JSON.stringify(r0) === JSON.stringify(await rot()));
  await page.getByRole('button', { name: '地球', exact: true }).click();
  check('planet selection and focus retention', (await read()).focused === '地球' && (await read()).active === '地球');
  await page.keyboard.press('Enter');
  check('Enter retains the same focused navigation button', (await read()).active === '地球');
  await page.keyboard.press('Tab');
  check('Tab follows navigation order', (await read()).active === '月球');
  await page.keyboard.press('Space');
  check('Space activates a navigation button', (await read()).focused === '月球');
  await page.keyboard.press('Escape'); await settle();
  check('Escape returns to overview', (await read()).focused === null);
  await page.locator('#scene').focus();
  const k0 = await read(); await page.keyboard.press('ArrowLeft'); await page.keyboard.press('+');
  const k1 = await read();
  check('canvas arrow and plus shortcuts', Math.abs(k1.theta - k0.theta - .12) < .001 && k1.radius < k0.radius);
  await page.keyboard.press('Space'); check('canvas Space resumes', (await read()).speed === 1);
  await page.keyboard.press('Space'); check('canvas Space pauses', (await read()).speed === 0);
  const t0 = (await read()).theta;
  await page.mouse.move(500, 360); await page.mouse.down(); await page.mouse.move(640, 410, { steps: 5 }); await page.mouse.move(500, 360, { steps: 5 }); await page.mouse.up();
  check('drag out and back never selects', (await read()).focused === null);
  await page.mouse.move(500, 360); await page.mouse.down(); await page.mouse.move(600, 400, { steps: 5 }); await page.mouse.up();
  check('mouse drag rotates', Math.abs((await read()).theta - t0) > .1);
  const w0 = (await read()).radius; await page.mouse.wheel(0, -240); await settle();
  check('wheel zooms in', (await read()).radius < w0);
  await page.mouse.wheel(0, 240); await settle(); check('wheel zooms out', Math.abs((await read()).radius - w0) < .01);
  await page.getByRole('button', { name: '全景', exact: true }).click(); await page.waitForTimeout(1400);
  await page.mouse.click(640, 360);
  check('actual canvas ray picking selects the Sun', (await read()).focused === '太阳');
  await page.screenshot({ path: 'output/playwright/04-sun-picked.png' });
  for (const name of ['太阳', '水星', '金星', '地球', '月球', '火星', '木星', '土星', '天王星', '海王星']) {
    await page.getByRole('button', { name, exact: true }).click();
    check(`navigation selects ${name}`, (await read()).focused === name && await page.locator('#info').getAttribute('aria-hidden') === 'false');
  }
  await page.getByRole('button', { name: '🎬 巡游', exact: true }).click();
  check('tour starts', await page.locator('[data-tour]').getAttribute('aria-pressed') === 'true');
  await page.getByRole('button', { name: '暂停动画', exact: true }).click();
  check('pause cancels tour', await page.locator('[data-tour]').getAttribute('aria-pressed') === 'false');
  for (const [width, height, tag] of [[390,844,'mobile'],[320,568,'small-mobile'],[844,390,'landscape'],[768,1024,'tablet']]) {
    await page.setViewportSize({ width, height });
    await page.getByRole('button', { name: '土星', exact: true }).click(); await settle();
    const layout = await page.evaluate(() => {
      const box = id => { const r = document.getElementById(id).getBoundingClientRect(); return { x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height }; };
      return { info:box('info'), bar:box('bar'), width:innerWidth,height:innerHeight, overflow:document.documentElement.scrollWidth > innerWidth };
    });
    check(`${tag} knowledge card stays inside viewport`, layout.info.x >= 0 && layout.info.right <= width && layout.info.bottom < layout.bar.y && !layout.overflow, layout);
    if (height <= 560) check(`${tag} help does not obscure knowledge card`, await page.locator('#help').isHidden());
    await page.locator('[data-camera]').focus();
    await settle();
    const control = await page.locator('[data-camera]').evaluate(el => { const r=el.getBoundingClientRect(); return {left:r.left,right:r.right,width:innerWidth}; });
    check(`${tag} keyboard exposes far-right controls`, control.left>=0 && control.right<=width, control);
    await page.locator('#scene').focus();
    await page.screenshot({ path:`output/playwright/05-${tag}.png` });
  }
  await page.setViewportSize({width:1280,height:720});
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Browser.setPermission', { permission:{name:'camera'}, setting:'denied', origin:new URL(baseURL).origin });
  await page.getByRole('button',{name:'📷 开启手势',exact:true}).click();
  await page.locator('#err-msg').waitFor({state:'visible'});
  check('native browser camera permission denied is recoverable', /未获允许/.test(await page.locator('#err-msg').textContent()) && await page.locator('#video').evaluate(v=>v.srcObject===null));
  await page.screenshot({path:'output/playwright/06-native-camera-denied.png'});
  await page.getByRole('button',{name:'🖐️ 无摄像头模式（鼠标 / 触屏 / 键盘）',exact:true}).click();
  check('denied camera returns to keyboard browsing', (await read()).activeId==='scene');
  const gl = await page.locator('#scene').evaluate(el=>{ const gl=el.getContext('webgl2'), e=gl.getExtension('WEBGL_debug_renderer_info'); return {version:gl.getParameter(gl.VERSION),renderer:e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),lost:gl.isContextLost()}; });
  return { baseURL, browser:page.context().browser().version(), userAgent:await page.evaluate(()=>navigator.userAgent), webgl:gl, results, passed:results.filter(r=>r.pass).length, failed:results.filter(r=>!r.pass).length };
}
