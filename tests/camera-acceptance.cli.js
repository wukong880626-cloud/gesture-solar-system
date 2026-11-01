async (page) => {
  const baseURL = page.url(), origin = new URL(baseURL).origin;
  const p = await page.context().newPage();
  const results = [], network = [], errors = [];
  const check = (name, ok, detail='') => results.push({name,pass:!!ok,detail});
  p.on('request', r => network.push({url:r.url(),method:r.method()}));
  p.on('pageerror', e => errors.push(e.message));
  // This replaces getUserMedia before application code runs. It never calls the
  // native API, requests permission, enumerates devices, or opens real hardware.
  await p.addInitScript(() => {
    window.__mediaMode='denied'; window.__requests=[]; window.__streams=[];
    window.__makeStream=()=>{
      const c=document.createElement('canvas'); c.width=640;c.height=480;
      const x=c.getContext('2d'); let i=0;
      const draw=()=>{ x.fillStyle='#18304d';x.fillRect(0,0,640,480);x.fillStyle='#ffe9a8';x.font='24px sans-serif';x.fillText('SYNTHETIC VIDEO — NO CAMERA',55,200);x.fillRect(i++%500,300,80,40); };
      draw(); const timer=setInterval(draw,100);const s=c.captureStream(10);
      s.getTracks().forEach(t=>{const stop=t.stop.bind(t);t.stop=()=>{clearInterval(timer);stop();};});
      window.__streams.push(s);return s;
    };
    navigator.mediaDevices.getUserMedia=async constraints=>{
      window.__requests.push(constraints);
      if(window.__mediaMode==='pending') return new Promise(r=>window.__resolveStream=()=>r(window.__makeStream()));
      if(window.__mediaMode==='stream') return window.__makeStream();
      throw new DOMException('Test-only camera failure',window.__mediaMode==='missing'?'NotFoundError':window.__mediaMode==='unreadable'?'NotReadableError':'NotAllowedError');
    };
  });
  const start = () => p.locator('#start-btn').click();
  const browse = () => p.locator('#browse-btn').click();
  const clear = () => p.evaluate(() => ({states:__streams.flatMap(s=>s.getTracks().map(t=>t.readyState)),src:document.querySelector('#video').srcObject===null,box:getComputedStyle(document.querySelector('#cam-box')).display}));
  await p.goto(baseURL);
  check('opening the app never requests camera', await p.evaluate(()=>__requests.length===0));
  for(const mode of ['missing','unreadable']){
    await p.evaluate(m=>__mediaMode=m,mode); await start();await p.locator('#err-msg').waitFor({state:'visible'});
    const message=await p.locator('#err-msg').textContent();
    check(`simulated ${mode} camera recovery`, (mode==='missing'?/未找到/:/不可用/).test(message)&&(await clear()).src,message);
  }
  await p.evaluate(()=>__mediaMode='pending');await start();
  check('starting from overlay keeps a camera-free exit', await p.locator('#browse-btn').isVisible());
  await browse();await p.evaluate(()=>__resolveStream());await p.waitForTimeout(200);
  check('cancel before stream arrives stops the late synthetic track', (await clear()).states.every(s=>s==='ended')&&(await clear()).src);
  await p.evaluate(()=>__mediaMode='pending');await p.locator('[data-camera]').click();
  check('in-scene pending request has cancel control', /取消/.test(await p.locator('[data-camera]').textContent()));
  await p.locator('[data-camera]').click();await p.evaluate(()=>__resolveStream());await p.waitForTimeout(200);
  check('in-scene cancellation also stops late track', (await clear()).states.every(s=>s==='ended')&&(await clear()).src);
  await p.route('**/hand_landmarker.task',r=>r.abort('failed'));
  await p.evaluate(()=>__mediaMode='stream');await p.locator('[data-camera]').click();
  await p.locator('#err-msg').waitFor({state:'visible',timeout:30000});
  check('real MediaPipe model-load failure releases synthetic stream', (await clear()).states.every(s=>s==='ended')&&(await clear()).src);
  await p.unroute('**/hand_landmarker.task');
  await p.evaluate(()=>__mediaMode='stream');await start();
  await p.getByRole('button',{name:'关闭摄像头',exact:true}).waitFor({state:'visible',timeout:45000});
  check('real local WASM/model initializes against synthetic video', await p.locator('#video').evaluate(v=>v.readyState>=2&&v.srcObject.getTracks().every(t=>t.readyState==='live')));
  await p.waitForTimeout(700);await p.screenshot({path:'output/playwright/07-synthetic-camera-model.png'});
  await p.getByRole('button',{name:'关闭摄像头',exact:true}).click();
  check('explicit close stops every synthetic track and clears video', (await clear()).states.every(s=>s==='ended')&&(await clear()).src&&(await clear()).box==='none');
  await p.locator('[data-camera]').click();await p.getByRole('button',{name:'关闭摄像头',exact:true}).waitFor({state:'visible',timeout:45000});
  // Chrome headless page switches may not change visibility. This is a
  // browser DOM event simulation, explicitly separate from a native tab switch.
  await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  check('simulated background event releases capture', (await clear()).states.every(s=>s==='ended')&&(await clear()).src);
  await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
  await p.waitForTimeout(250);
  check('foreground event never auto-restarts capture', (await clear()).states.every(s=>s==='ended')&&(await clear()).src);
  await p.locator('[data-camera]').click();await p.getByRole('button',{name:'关闭摄像头',exact:true}).waitFor({state:'visible',timeout:45000});
  await p.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide')));
  check('pagehide releases capture', (await clear()).states.every(s=>s==='ended')&&(await clear()).src);
  check('every request excludes microphone', await p.evaluate(()=>__requests.every(r=>r.audio===false)));
  check('no external network requests or video uploads', network.every(r=>r.url.startsWith(origin+'/'))&&network.every(r=>r.method==='GET'),network.filter(r=>!r.url.startsWith(origin+'/')||r.method!=='GET'));
  check('application resources stay within the deployment subdirectory',network.every(r=>r.url.startsWith(baseURL)||r.url===origin+'/favicon.ico'),network.map(r=>r.url));
  check('no unhandled application errors',errors.length===0,errors);
  const finalState=await clear();await p.close();
  return {baseURL,boundary:'Synthetic canvas.captureStream only; native getUserMedia never called. Background/pagehide events simulated. No real hand footage or hardware camera test.',results,finalState,passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length};
}
