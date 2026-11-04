const {test,expect}=require('@playwright/test');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const gameUrl=pathToFileURL(path.resolve(__dirname,'../index.html')).href;
async function boot(page){
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(gameUrl);
 await page.waitForFunction(()=>window.cpuGame?.isRunning&&cpuGame.scene.isActive('CpuEscape'));
 return errors;
}
async function enterCPU(page){
 await page.click('#start');await page.click('#action');
 await expect(page.locator('#world-map')).toBeVisible();
 await expect(page.locator('#map-enter')).toBeEnabled();await page.click('#map-enter');
 await expect(page.locator('#title')).toHaveText('CPU');await page.click('#action');
}
test('Phaser owns the renderer and scene without changing the canvas layout',async({page})=>{
 const errors=await boot(page);
 const runtime=await page.evaluate(()=>({version:Phaser.VERSION,type:cpuGame.renderer.type,
  canvas:cpuGame.canvas===document.getElementById('game'),
  texture:cpuGame.textures.exists('cpu-artwork'),
  image:cpuGame.scene.getScene('CpuEscape').children.list[0].type}));
 expect(runtime).toEqual({version:'4.2.1',type:1,canvas:true,texture:true,image:'Image'});
 await expect(page.locator('#stage canvas')).toHaveCount(1);
 await enterCPU(page);
 await expect.poll(()=>page.locator('#score').textContent()).not.toBe('0');
 const bounds=await page.locator('#game').boundingBox();expect(bounds.width).toBeLessThan(1151);
 expect(bounds.height).toBeLessThan(650);expect(errors).toEqual([]);
 await page.evaluate(()=>cpuGame.loop.stop());
 const score=await page.locator('#score').textContent();await page.waitForTimeout(150);
 await expect(page.locator('#score')).toHaveText(score);
});
test('jump, pause, quiz focus, and map controls retain their behavior',async({page})=>{
 const errors=await boot(page);await enterCPU(page);
 const playerTop=()=>page.evaluate(()=>{
  const data=cpuGame.textures.get('cpu-artwork').context.getImageData(231,300,1,269).data;
  for(let y=0;y<269;y++)if(data[y*4]===168&&data[y*4+1]===255&&data[y*4+2]===213)return y+300;
  return 570;
 });
 const floorTop=await playerTop();
 const canvas=await page.locator('#game').boundingBox();
 await page.mouse.move(canvas.x+canvas.width/2,canvas.y+canvas.height/2);await page.mouse.down();
 await expect.poll(playerTop).toBeLessThan(floorTop-20);await page.mouse.up();
 await page.keyboard.press('KeyP');await expect(page.locator('#title')).toHaveText('Catch your breath.');
 const pausedScore=await page.locator('#score').textContent();await page.waitForTimeout(150);
 await expect(page.locator('#score')).toHaveText(pausedScore);await page.click('#action');
 await expect(page.locator('#answers button')).toHaveCount(4,{timeout:15000});
 const quizScore=await page.locator('#score').textContent();
 await page.keyboard.press('Space');await expect(page.locator('#answers button:disabled')).toHaveCount(0);
 await page.waitForTimeout(100);await expect(page.locator('#score')).toHaveText(quizScore);
 const correct=await page.evaluate(()=>cpuQuestions.find(q=>q.question===document.getElementById('title').textContent).correctAnswer);
 await page.locator('#answers button').nth(correct).click();
 await page.keyboard.press('Space');await expect(page.locator('#overlay')).toBeVisible();
 await page.click('#action');await expect(page.locator('#overlay')).toBeHidden();
 await page.click('#back-map');await expect(page.locator('#leave-confirm')).toBeVisible();
 await page.click('#stay-level');await expect(page.locator('#leave-confirm')).toBeHidden();
 await page.click('#back-map');await page.click('#leave-level');
 await expect(page.locator('#world-map')).toBeVisible();expect(errors).toEqual([]);
});
test('mobile canvas and map controls retain the original responsive layout',async({page})=>{
 await page.setViewportSize({width:390,height:844});const errors=await boot(page);await enterCPU(page);
 const bounds=await page.locator('#game').boundingBox();
 expect(bounds.x).toBeGreaterThanOrEqual(0);expect(bounds.x+bounds.width).toBeLessThanOrEqual(390);
 expect(bounds.width/bounds.height).toBeCloseTo(.8,1);
 await page.click('#back-map');await expect(page.locator('#stay-level')).toBeVisible();
 await page.click('#leave-level');await expect(page.locator('#world-map')).toBeVisible();expect(errors).toEqual([]);
});

// Serve an instrumented copy in this test only, so the real boss UI can be
// exercised without waiting through every run. No test hooks ship in the game.
async function bootBossFixture(page){
 const fs=require('node:fs');const root=path.resolve(__dirname,'..');
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('http://cpu.test/**',async route=>{
  const relative=new URL(route.request().url()).pathname.slice(1)||'index.html';
  const file=path.resolve(root,relative);
  if(!file.startsWith(root+path.sep)){await route.abort();return;}
  if(relative==='game.js'){
   const source=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n').replace('hud();\n// Start Phaser',
    'window.__bossTest={begin(index){unlocked=Math.max(unlocked,index);enterLevel(index);resume();elapsed=stageDuration(index);step(STEP);}};hud();\n// Start Phaser');
   await route.fulfill({contentType:'text/javascript',body:source});
  }else await route.fulfill({path:file});
 });
 await page.goto('http://cpu.test/index.html');
 await page.waitForFunction(()=>window.cpuGame?.isRunning&&cpuGame.scene.isActive('CpuEscape'));
 return errors;
}
test('boss health, turnaround, answers, defeat, and final victory work in Phaser',async({page})=>{
 const errors=await bootBossFixture(page);
 for(const stage of [0,5]){
  await page.evaluate(stage=>window.__bossTest.begin(stage),stage);
  await expect(page.locator('#stage')).toHaveClass(/boss-mode/);
  await expect(page.locator('#boss-hp')).toHaveText(`BUG: ${stage+3} / ${stage+3} HP`);
  await page.click('#action');
  const arena=await page.locator('#game').boundingBox(),questions=await page.locator('#overlay').boundingBox();
  expect(arena.x+arena.width).toBeLessThanOrEqual(questions.x+1);
  for(let hp=stage+3;hp>0;hp--){
   await expect(page.locator('#answers button')).toHaveCount(4);
   await page.keyboard.press('Space');await expect(page.locator('#answers button:disabled')).toHaveCount(0);
   const correct=await page.evaluate(()=>cpuBossQuestions.find(q=>q.question===document.getElementById('title').textContent).correctAnswer);
   await page.locator('#answers button').nth(correct).click();
   await expect(page.locator('#boss-health')).toHaveJSProperty('value',hp-1);
   if(hp===stage+3&&stage===0)await page.screenshot({path:test.info().outputPath('boss-hit.png')});
   if(hp===1){await expect(page.locator('#action')).toHaveText('Finish level');await page.screenshot({path:test.info().outputPath(`boss-splat-${stage}.png`)});}
   await page.click('#action');
  }
  await expect(page.locator('#stage')).not.toHaveClass(/boss-mode/);
  await expect(page.locator('#title')).toHaveText(stage===5?'The boy is finally home.':'CPU complete!');
 }
 expect(errors).toEqual([]);
});
test('boss fight remains usable on a small screen',async({page})=>{
 await page.setViewportSize({width:390,height:844});const errors=await bootBossFixture(page);
 await page.evaluate(()=>window.__bossTest.begin(0));await page.click('#action');
 await expect(page.locator('#boss-status')).toBeVisible();
 const arena=await page.locator('#game').boundingBox(),questions=await page.locator('#overlay').boundingBox();
 expect(arena.y+arena.height).toBeLessThanOrEqual(questions.y+1);
 await page.screenshot({path:test.info().outputPath('boss-mobile-dock.png')});
 const correct=await page.evaluate(()=>cpuBossQuestions.find(q=>q.question===document.getElementById('title').textContent).correctAnswer);
 await page.locator('#answers button').nth(correct).click();
 await expect(page.locator('#boss-hp')).toHaveText('BUG: 2 / 3 HP');await page.click('#action');
 await expect(page.locator('#answers button:disabled')).toHaveCount(0);
 await page.click('#back-map');await page.click('#stay-level');
 await expect(page.locator('#boss-status')).toBeVisible();expect(errors).toEqual([]);
});

async function openReview(page){
 await page.click('#start');await page.click('#action');await page.click('#review-tab');
 await expect(page.locator('#review-panel')).toBeVisible();
}
async function practiceCorrectly(page,count){
 for(let i=0;i<count;i++){
  const correct=await page.evaluate(()=>[...cpuQuestions,...cpuBossQuestions].find(q=>q.question===document.getElementById('review-question').textContent).correctAnswer);
  await page.locator('#review-answers button').nth(correct).click();await page.click('#review-next');
 }
}
test('review earns persistent coins and spends them on real run and boss questions',async({page})=>{
 const errors=await bootBossFixture(page);await openReview(page);
 await expect(page.locator('#review-panel select')).toHaveCount(0);
 await expect(page.locator('#review-count')).toContainText('Question 1 / 10');
 await expect(page.locator('#review-next')).toBeDisabled();
 await practiceCorrectly(page,13);await expect(page.locator('#review-coins')).toHaveText('Coins: 1');
 await expect(page.locator('#review-progress-text')).toHaveText('3 / 10 correct');
 await page.reload();await page.waitForFunction(()=>window.cpuGame?.isRunning);await openReview(page);
 await expect(page.locator('#review-coins')).toHaveText('Coins: 1');
 await expect(page.locator('#review-progress-text')).toHaveText('3 / 10 correct');
 await practiceCorrectly(page,7);
 await expect(page.locator('#review-coins')).toHaveText('Coins: 2');
 await page.click('#map-tab');await page.click('#map-enter');await page.click('#action');
 await expect(page.locator('#answers button')).toHaveCount(4,{timeout:15000});
 await expect(page.locator('#skip-question')).toBeEnabled();await page.click('#skip-question');
 await expect(page.locator('#overlay')).toBeHidden();await expect(page.locator('#game-coins')).toHaveText('Coins: 1');
 await page.evaluate(()=>window.__bossTest.begin(0));await page.click('#action');await page.click('#skip-question');
 await expect(page.locator('#boss-health')).toHaveJSProperty('value',2);
 await expect(page.locator('#game-coins')).toHaveText('Coins: 0');await page.click('#action');
 await expect(page.locator('#skip-question')).toBeDisabled();expect(errors).toEqual([]);
});
test('mobile review batches and practice answers fit the viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});const errors=await boot(page);await openReview(page);
 await expect(page.locator('#review-panel select')).toHaveCount(0);
 await expect(page.locator('#review-count')).toContainText('Question 1 / 10');
 await practiceCorrectly(page,1);await expect(page.locator('#review-progress-text')).toHaveText('1 / 10 correct');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
 await page.screenshot({path:test.info().outputPath('review-mobile.png'),fullPage:true});
 await page.click('#map-tab');await expect(page.locator('#map-panel')).toBeVisible();expect(errors).toEqual([]);
});
