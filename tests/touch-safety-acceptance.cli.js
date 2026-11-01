async (page) => {
  const baseURL=page.url();
  const results=[]; const check=(name,ok,detail='')=>results.push({name,pass:!!ok,detail});
  const mobileContext=await page.context().browser().newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});
  const p=await mobileContext.newPage();
  const c=await p.context().newCDPSession(p); await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  await p.emulateMedia({reducedMotion:'reduce'});
  await p.goto(baseURL);
  await p.screenshot({path:'output/playwright/08-mobile-start.png'});
  await p.locator('#browse-btn').tap();
  check('mobile initial render uses reduced-motion pause',await p.evaluate(()=>__dbg.TIME.scale===0));
  const state=()=>p.evaluate(()=>({theta:__dbg.cam.tTheta,radius:__dbg.cam.tRadius,focused:__dbg.focused?.name||null}));
  const touches=(points,type)=>c.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(([x,y,id])=>({x,y,id,radiusX:5,radiusY:5,force:1}))});
  const before=await state();
  await touches([[120,450,1]],'touchStart');await touches([[220,470,1]],'touchMove');await touches([],'touchEnd');
  check('trusted emulated single-finger drag rotates without selecting',Math.abs((await state()).theta-before.theta)>.1&&(await state()).focused===null);
  const pinch0=(await state()).radius;
  await touches([[150,450,1],[250,450,2]],'touchStart');
  await touches([[100,450,1],[300,450,2]],'touchMove');await touches([],'touchEnd');
  check('trusted emulated two-finger pinch zooms without selecting',(await state()).radius<pinch0*.8&&(await state()).focused===null);
  await touches([[150,450,1]],'touchStart');await touches([],'touchCancel');
  check('touch cancellation never selects',(await state()).focused===null);
  await p.getByRole('button',{name:'全景',exact:true}).tap();
  const nav0=await p.locator('#bar').evaluate(el=>el.scrollLeft);
  await touches([[280,814,1]],'touchStart');await touches([[60,814,1]],'touchMove');await touches([],'touchEnd');await p.waitForTimeout(200);
  check('horizontal touch swipe exposes more navigation controls',await p.locator('#bar').evaluate(el=>el.scrollLeft)>nav0);
  await p.getByRole('button',{name:'土星',exact:true}).tap();await p.waitForTimeout(1400);
  check('touch planet button selects Saturn',(await state()).focused==='土星');
  check('moon count includes a visible verification date',/2026-10-22/.test(await p.locator('#info .fact-note').textContent()));
  await p.screenshot({path:'output/playwright/09-mobile-touch-saturn.png'});
  await mobileContext.close();
  for(const [width,height] of [[320,568],[844,390]]){
    const s=await page.context().newPage();await s.setViewportSize({width,height});
    await s.goto(baseURL);
    await s.locator('#browse-btn').scrollIntoViewIfNeeded();
    const rect=await s.locator('#browse-btn').boundingBox();
    check(`${width}×${height} start exit stays reachable`,rect.x>=0&&rect.x+rect.width<=width&&rect.y>=0&&rect.y+rect.height<=height,rect);
    await s.screenshot({path:`output/playwright/10-start-${width}x${height}.png`});await s.close();
  }
  const a=await page.context().newPage();await a.route('**/textures/2k_mars.jpg',r=>r.abort());
  await a.goto(baseURL);await a.locator('#load-text').filter({hasText:'部分贴图加载失败'}).waitFor({timeout:15000});
  check('missing texture warns without preventing camera-free entry',await a.locator('#browse-btn').isEnabled());await a.locator('#browse-btn').click();await a.close();
  const w=await page.context().newPage();
  await w.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /^(experimental-)?webgl/.test(type)?null:get.call(this,type,...args);};});
  await w.goto(baseURL);await w.locator('#err-msg').waitFor({state:'visible'});
  check('unavailable WebGL has an actionable error and disabled entry',/无法创建三维视图/.test(await w.locator('#err-msg').textContent())&&await w.locator('#start-btn').isDisabled()&&await w.locator('#browse-btn').isDisabled());
  await w.screenshot({path:'output/playwright/11-webgl-unavailable.png'});await w.close();
  return {baseURL,boundary:'Chrome touch and mobile viewport emulation, not a physical phone or iOS Safari. Texture and WebGL failures are deliberately injected.',results,passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length};
}
