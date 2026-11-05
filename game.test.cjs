const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function setup(random=Math.random,captureDrawing=false,storage=new Map(),unlockAll=false){
 const drawing=[],drawnLabels=[];
 const testMath=Object.create(Math);testMath.random=random;
 const elements={};const listeners={};let frame;
 function element(){return {style:{},setAttribute(){},textContent:'',hidden:false,children:[],classList:{add(){},remove(){}},addEventListener(n,f){this[n]=f;},replaceChildren(){this.children=[];},append(b){this.children.push(b);},get firstElementChild(){return this.children[0];},focus(){},setPointerCapture(){}};}
 const ctx=new Proxy({fillText(text){if(captureDrawing)drawnLabels.push(text);},createLinearGradient:()=>({addColorStop(){}}),ellipse(...args){if(captureDrawing)drawing.push({args,color:this.fillStyle});}},{get:(o,k)=>k in o?o[k]:()=>{}});
 const document={getElementById(id){return elements[id]??=(['game','map-canvas'].includes(id)?Object.assign(element(),{getContext:()=>ctx}):element());},createElement:tag=>tag==='canvas'?Object.assign(element(),{getContext:()=>ctx}):element(),addEventListener(){}};
 const sandbox={document,window:{addEventListener(n,f){listeners[n]=f;}},localStorage:{getItem:key=>storage.get(key)??null,setItem(key,value){storage.set(key,String(value));}},Phaser:{CANVAS:1,Scale:{NONE:0},Scene:class{},Game:class{constructor(config){this.config=config;const scene=new config.scene[0]();scene.textures={addCanvas(){}};scene.add={image(){return {setOrigin(){}};}};scene.create();frame=time=>scene.update(time);}}},Math:testMath};
 vm.createContext(sandbox);vm.runInContext(fs.readFileSync('questions.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('journey.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('map-world.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dialogue.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('review.js','utf8'),sandbox);
 const source=fs.readFileSync('game.js','utf8').replace(/\r\n/g,'\n').replace('const UNLOCK_ALL_LEVELS=true;',`const UNLOCK_ALL_LEVELS=${unlockAll};`).replace('hud();\n// Start Phaser',`globalThis.physics={
 set(v){if(v.stageIndex!==undefined)stageIndex=v.stageIndex;if(v.spawnCount!==undefined)spawnCount=v.spawnCount;if(v.y!==undefined)y=v.y;if(v.vy!==undefined)vy=v.vy;if(v.grounded!==undefined)grounded=v.grounded;if(v.elapsed!==undefined)elapsed=v.elapsed;if(v.distance!==undefined)distance=v.distance;if(v.revives!==undefined)revives=v.revives;if(v.obstacles)obstacles=v.obstacles;if(v.platforms)platforms=v.platforms;if(v.gaps)gaps=v.gaps;},
 get(){return {y,vy,grounded,state,unlocked,bossActive:boss.active,bossHp:boss.hp,bossMaxHp:boss.maxHp,bossDeathTime:boss.deathTime,attempts,correctCount,platforms:platforms.length,gaps:gaps.length};},
 appearance(){return {bugs:bugLooks,color:stageData().color,wire:blendColor(stageData().color,stageData().background,.45)};},step,spawn,updatePickups,heartDistance,loot(){return {revives,heartNumber,pickups,obstacles,platforms,gaps};}
 };hud();\n// Start Phaser`);
 vm.runInContext(source,sandbox);
 let time=0;function tick(n){for(let i=0;i<n;i++){time+=1000/60;frame(time);}}
 function go(index){for(let n=0;n<420;n++)sandbox.physics.step(1/120);elements['map-nodes'].children[index].click();for(let n=0;n<2400;n++)sandbox.physics.step(1/120);elements['map-enter'].click();}
 return {elements,listeners,tick,go,drawing,drawnLabels,character:sandbox.window.cpuCharacter,world:sandbox.window.cpuMap,physics:sandbox.physics,review:sandbox.window.cpuReview,reviewCorrect:()=>vm.runInContext('[...cpuQuestions,...cpuBossQuestions].find(q=>q.question===document.getElementById("review-question").textContent).correctAnswer',sandbox),correct:()=>vm.runInContext('[...cpuQuestions,...cpuBossQuestions].find(q=>q.question===document.getElementById("title").textContent).correctAnswer',sandbox)};
}
function defeatBoss(s){
 assert.equal(s.physics.get().state,'boss-intro');s.elements.action.click();
 for(let i=0;i<8&&s.physics.get().bossActive;i++){
  assert.equal(s.physics.get().state,'boss-question');
  s.elements.answers.children[s.correct()].click();if(s.physics.get().bossHp===0)s.tick(60);s.elements.action.click();
 }
 assert.equal(s.physics.get().bossActive,false);
}
test('collision freezes distance; correct answer preserves score; wrong answer requires zero restart',()=>{
 const s=setup(),e=s.elements;e.action.click();
 for(let i=0;i<2000&&e.overlay.hidden;i++)s.tick(1);
 assert.equal(e.overlay.hidden,false);assert.equal(e.answers.children.length,4);
 const score=e.score.textContent;assert.ok(Number(score)>0);s.tick(120);assert.equal(e.score.textContent,score);
 e.answers.children[s.correct()].click();e.action.click();assert.equal(e.score.textContent,score);assert.equal(e.overlay.hidden,true);
 for(let i=0;i<2000&&e.overlay.hidden;i++)s.tick(1);
 e.answers.children[(s.correct()+1)%4].click();assert.match(e.action.textContent,/recovery/);e.action.click();e.answers.children[(s.correct()+1)%4].click();assert.match(e.action.textContent,/Retry/);e.action.click();assert.equal(e.score.textContent,0);
});
test('pause freezes score and speed; resume advances gradually',()=>{
 const s=setup(),e=s.elements;e.action.click();s.tick(60);const score=e.score.textContent,speed=e.speed.textContent;
 s.listeners.keydown({code:'KeyP',repeat:false});s.tick(120);assert.equal(e.score.textContent,score);assert.equal(e.speed.textContent,speed);
 e.action.click();s.tick(30);assert.ok(Number(e.score.textContent)>Number(score));assert.ok(parseFloat(e.speed.textContent)<1.1);
});
test('descending onto a block lands safely and allows another jump',()=>{
 const s=setup();s.elements.action.click();
 s.physics.set({y:460,vy:300,grounded:false,platforms:[{x:200,w:180,h:64}]});
 s.physics.step(1/60);
 assert.equal(s.physics.get().y,464);assert.equal(s.physics.get().grounded,true);assert.equal(s.physics.get().state,'running');
 s.listeners.keydown({code:'Space',repeat:false,preventDefault(){}});s.physics.step(1/120);
 assert.ok(s.physics.get().vy<0);assert.ok(s.physics.get().y<464);
});
test('falling between blocks offers a revive and clears terrain after a correct answer',()=>{
 const s=setup();s.elements.action.click();
 s.physics.set({y:527,vy:300,grounded:false,gaps:[{x:180,w:130}],platforms:[{x:310,w:180,h:64}]});
 for(let i=0;i<10;i++)s.physics.step(1/120);
 assert.equal(s.physics.get().state,'quiz');assert.equal(s.elements.answers.children.length,4);
 assert.equal(s.elements.hearts.children.filter(h=>h.className==='heart lost').length,1);
 s.elements.answers.children[s.correct()].click();
 s.elements.action.click();assert.equal(s.physics.get().state,'running');assert.equal(s.physics.get().gaps,0);assert.equal(s.physics.get().platforms,0);assert.equal(s.physics.get().y,528);
});
test('three correct revives are allowed, fourth crash ends round, restart restores hearts',()=>{
 const s=setup(),e=s.elements;e.action.click();
 function hitGap(){s.physics.set({y:540,vy:300,grounded:false,gaps:[{x:180,w:150}]});s.physics.step(1/120);}
 for(let i=1;i<=3;i++){
  hitGap();assert.equal(s.physics.get().state,'quiz');
  assert.equal(e.hearts.children.filter(h=>h.className==='heart lost').length,i);
  const score=e.score.textContent;s.tick(30);assert.equal(e.score.textContent,score);
  e.answers.children[s.correct()].click();e.action.click();assert.equal(s.physics.get().state,'running');
  assert.equal(e.hearts.children.filter(h=>h.className==='heart lost').length,i);
 }
 hitGap();assert.equal(s.physics.get().state,'over');assert.equal(e.answers.children.length,0);assert.match(e.title.textContent,/No revives/);
 e.action.click();assert.equal(e.hearts.children.filter(h=>h.className==='heart').length,3);assert.equal(e.score.textContent,0);
});
test('hitting a block from the side triggers the CPU check rather than landing',()=>{
 const s=setup();s.elements.action.click();s.physics.set({platforms:[{x:245,w:180,h:64}]});s.physics.step(1/120);
 assert.equal(s.physics.get().state,'quiz');assert.equal(s.elements.answers.children.length,4);
});
test('floating steps support elevated landings but leave open air underneath',()=>{
 const s=setup();s.elements.action.click();
 s.physics.set({y:372,vy:300,grounded:false,platforms:[{x:200,w:140,h:152,thickness:20}]});
 s.physics.step(1/60);assert.equal(s.physics.get().y,376);assert.equal(s.physics.get().grounded,true);
 s.physics.set({y:528,vy:0,grounded:true});s.physics.step(1/120);
 assert.equal(s.physics.get().state,'running');assert.equal(s.physics.get().y,528);
});
test('mounted transistor collides at platform height, not on the floor below',()=>{
 const s=setup();s.elements.action.click();
 s.physics.set({obstacles:[{x:225,w:32,h:40,base:418,block:true}]});
 s.physics.step(1/120);assert.equal(s.physics.get().state,'running');
 s.physics.set({y:376,vy:0,grounded:false});s.physics.step(1/120);
 assert.equal(s.physics.get().state,'quiz');
});
test('heart milestones follow the requested formula and preview before 500 m',()=>{
 const s=setup();s.elements.action.click();
 s.physics.set({revives:2});
 assert.deepEqual([1,2,3,4,5].map(s.physics.heartDistance),[500,1100,1700,2300,2900]);
 s.physics.set({distance:3900});s.physics.updatePickups();assert.equal(s.physics.loot().pickups.length,0);
 s.physics.set({distance:4000});s.physics.updatePickups();assert.equal(s.physics.loot().pickups.length,1);assert.equal(s.physics.loot().pickups[0].at,500);
});
test('full hearts skip scheduled pickups without shifting later milestones',()=>{
 const s=setup();s.elements.action.click();s.physics.set({distance:4000});s.physics.updatePickups();
 assert.equal(s.physics.loot().pickups.length,0);assert.equal(s.physics.loot().heartNumber,2);
 s.physics.set({distance:5000,revives:2});s.physics.updatePickups();assert.equal(s.physics.loot().pickups.length,0);
 s.physics.set({distance:10000});s.physics.updatePickups();assert.equal(s.physics.loot().pickups[0].at,1100);
 s.physics.set({revives:3});s.physics.updatePickups();assert.equal(s.physics.loot().pickups.length,0);
});
test('home screen hides game and stats until Start, and waits without advancing',()=>{
 const s=setup(),e=s.elements;
 assert.equal(e.home.hidden,false);assert.equal(e.stage.hidden,true);assert.equal(e.hud.hidden,true);assert.equal(e.controls.hidden,true);
 s.tick(120);assert.equal(e.score.textContent,0);assert.equal(s.physics.get().state,'ready');
 e.start.click();assert.equal(s.physics.get().state,'intro');e.action.click();assert.equal(s.physics.get().state,'map-transition');s.tick(210);assert.equal(s.physics.get().state,'map');s.go(0);assert.equal(s.physics.get().state,'lesson');e.action.click();assert.equal(e.home.hidden,true);assert.equal(e.stage.hidden,false);assert.equal(e.hud.hidden,false);assert.equal(e.controls.hidden,false);
 s.tick(30);assert.ok(Number(e.score.textContent)>0);
});
test('collecting restores one heart, caps at three, and cannot be collected twice',()=>{
 const s=setup();s.elements.action.click();s.physics.set({distance:5000,revives:1});s.physics.updatePickups();
 assert.equal(s.physics.loot().revives,2);assert.equal(s.physics.loot().pickups.length,0);
 s.physics.updatePickups();assert.equal(s.physics.loot().revives,2);
 s.physics.set({distance:11000,revives:3});s.physics.updatePickups();assert.equal(s.physics.loot().revives,3);
 s.physics.set({distance:17000,revives:0});s.physics.updatePickups();assert.equal(s.physics.loot().revives,1);
});
test('missed hearts do not heal and restart resets the pickup schedule',()=>{
 const s=setup();s.elements.action.click();s.physics.set({distance:5000,revives:1,y:300,grounded:false});s.physics.updatePickups();
 assert.equal(s.physics.loot().revives,1);assert.equal(s.physics.loot().pickups.length,1);
 s.physics.set({distance:5400});s.physics.updatePickups();assert.equal(s.physics.loot().pickups.length,0);
 s.physics.set({y:540,gaps:[{x:180,w:150}]});s.physics.step(1/120);
 s.elements.answers.children[(s.correct()+1)%4].click();s.elements.action.click();s.elements.answers.children[(s.correct()+1)%4].click();s.elements.action.click();
 assert.equal(s.physics.loot().heartNumber,1);assert.equal(s.physics.loot().revives,3);assert.equal(s.physics.loot().pickups.length,0);
});

test('map locks future levels and finishing each route unlocks the next',()=>{const s=setup(),e=s.elements;e.start.click();e.action.click();s.tick(210);for(let level=0;level<6;level++){assert.equal(s.physics.get().state,'map');assert.equal(e['map-nodes'].children[level].disabled,false);if(level<5)assert.equal(e['map-nodes'].children[level+1].disabled,true);s.go(level);e.action.click();s.physics.set({elapsed:30+level*30});s.physics.step(1/120);defeatBoss(s);assert.equal(s.physics.get().state,level===5?'won':'cleared');e.action.click();}assert.match(e['map-status'].textContent,/finally go home/);});
test('story fades in and out automatically then reveals the map without running',()=>{const s=setup(),e=s.elements;e.start.click();for(let i=0;i<145;i++)s.physics.step(1/120);for(let i=0;i<60;i++)s.physics.step(1/120);const fadeIn=Number(e.overlay.style.opacity);assert.ok(fadeIn>0&&fadeIn<1);for(let i=0;i<600;i++)s.physics.step(1/120);assert.ok(Number(e.overlay.style.opacity)<fadeIn);for(let i=0;i<3500;i++)s.physics.step(1/120);assert.equal(s.physics.get().state,'map');assert.equal(e.score.textContent,0);assert.equal(e.stage.hidden,true);});
test('wrong encounter answer explains the concept and recovery can preserve a run',()=>{const s=setup(),e=s.elements;e.action.click();s.physics.set({y:540,gaps:[{x:180,w:150}]});s.physics.step(1/120);e.answers.children[(s.correct()+1)%4].click();assert.equal(s.physics.get().state,'review');s.tick(120);assert.ok(e.feedback.textContent.length>30);e.action.click();e.answers.children[s.correct()].click();e.action.click();assert.equal(s.physics.get().state,'running');});

test('return confirmation freezes a level and cancel preserves its progress',()=>{const s=setup(),e=s.elements;e.action.click();s.tick(30);const score=e.score.textContent;e['back-map'].click();assert.equal(s.physics.get().state,'confirm-leave');assert.equal(e['leave-confirm'].hidden,false);s.tick(120);assert.equal(e.score.textContent,score);s.listeners.keydown({code:'KeyP',repeat:false});assert.equal(s.physics.get().state,'confirm-leave');e['stay-level'].click();assert.equal(s.physics.get().state,'running');assert.equal(e['leave-confirm'].hidden,true);assert.equal(e.score.textContent,score);s.tick(15);assert.ok(Number(e.score.textContent)>Number(score));});
test('confirming return preserves unlocked levels and re-entry resets the current attempt',()=>{const s=setup(),e=s.elements;e.start.click();e.action.click();s.tick(210);s.go(0);e.action.click();s.physics.set({elapsed:60});s.physics.step(1/120);defeatBoss(s);e.action.click();s.go(1);e.action.click();s.physics.set({revives:1});s.physics.step(1/120);e['back-map'].click();e['leave-level'].click();assert.equal(s.physics.get().state,'map');assert.equal(e['map-nodes'].children[1].disabled,false);assert.equal(e['map-nodes'].children[2].disabled,true);assert.equal(e['level-toolbar'].hidden,true);s.go(1);assert.equal(e.score.textContent,Math.floor((620*30-26000*(1-Math.exp(-.3)))*.92/10));assert.equal(s.physics.loot().revives,3);assert.equal(s.physics.get().state,'lesson');});
test('cancel return preserves an unanswered quiz and Escape dismisses confirmation',()=>{const s=setup(),e=s.elements;e.action.click();s.physics.set({y:540,gaps:[{x:180,w:150}]});s.physics.step(1/120);const question=e.title.textContent,answers=e.answers.children;e['back-map'].click();e['leave-confirm'].keydown({code:'Escape',preventDefault(){}});assert.equal(s.physics.get().state,'quiz');assert.equal(e.title.textContent,question);assert.equal(e.answers.children,answers);e.answers.children[s.correct()].click();e.action.click();assert.equal(s.physics.get().state,'running');});

test('audio changes composition for every location and mute silences effects',()=>{const elements={},notes=[];let pulse,context;const parameter=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){},setTargetAtTime(value){this.value=value;}});class AudioContext{constructor(){this.currentTime=0;this.state='running';this.destination={};context=this;}resume(){return Promise.resolve();}createGain(){return {gain:parameter(),connect(){}};}createOscillator(){const oscillator={frequency:{value:0},connect(){},start(){notes.push(this.frequency.value);},stop(){}};return oscillator;}}const document={hidden:false,addEventListener(name,fn){this[name]=fn;},getElementById(id){return elements[id]??={addEventListener(name,fn){this[name]=fn;},setAttribute(){}};}};const sandbox={document,window:{AudioContext},setInterval(fn){pulse=fn;return 1;}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('sound.js','utf8'),sandbox);const audio=sandbox.window.cpuAudio;audio.start();const phrases=[];for(const scene of ['home','map',0,1,2,3,4,5]){audio.setScene(scene);const start=notes.length;for(let n=0;n<16;n++){context.currentTime+=1;pulse();}phrases.push(JSON.stringify(notes.slice(start)));}assert.equal(new Set(phrases).size,8);const interactionStart=notes.length;document.click({target:{closest:()=>({disabled:false,closest:()=>null})}});assert.ok(notes.length>interactionStart);const disabledStart=notes.length;document.click({target:{closest:()=>({disabled:true})}});assert.equal(notes.length,disabledStart);const before=notes.length;audio.effect('stuck');assert.ok(notes.length>before);elements.music.click();const muted=notes.length;audio.effect('arrival');audio.voice();context.currentTime++;pulse();assert.equal(notes.length,muted);elements.music.click();context.currentTime++;pulse();assert.ok(notes.length>muted);});
test('opening renderer draws all cutscene phases without changing gameplay',()=>{const s=setup();const context=new Proxy({}, {get:(o,k)=>k in o?o[k]:()=>{}});const sandbox={document:{getElementById:()=>null},window:{}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('opening.js','utf8'),sandbox);for(let phase=0;phase<5;phase++)for(const time of [0,1,2.8,4])sandbox.window.cpuOpening.draw(context,1280,720,phase,time);assert.equal(s.physics.get().state,'ready');});

test('map travel is gradual, follows unlock limits, and Enter starts only near a landmark',()=>{const s=setup(),e=s.elements;e.start.click();e.action.click();s.tick(210);const initial=s.world.inspect();s.listeners.keydown({code:'ArrowRight',preventDefault(){}});for(let i=0;i<1200;i++)s.physics.step(1/120);s.listeners.keyup({code:'ArrowRight',preventDefault(){}});assert.equal(s.world.inspect().distance,initial.distance);s.go(0);e.action.click();s.physics.set({elapsed:60});s.physics.step(1/120);defeatBoss(s);e.action.click();s.listeners.keydown({code:'KeyD',preventDefault(){}});for(let i=0;i<60;i++)s.physics.step(1/120);s.listeners.keyup({code:'KeyD',preventDefault(){}});assert.ok(s.world.inspect().distance>0);assert.equal(s.world.inspect().nearby,-1);e['map-enter'].click();assert.equal(s.physics.get().state,'map');const stopped=s.world.inspect().distance;for(let i=0;i<120;i++)s.physics.step(1/120);assert.equal(s.world.inspect().distance,stopped);s.listeners.keydown({code:'ArrowRight',preventDefault(){}});for(let i=0;i<1200;i++)s.physics.step(1/120);s.listeners.keyup({code:'ArrowRight',preventDefault(){}});assert.equal(s.world.inspect().nearby,1);s.listeners.keydown({code:'Enter',repeat:false,preventDefault(){}});assert.equal(s.physics.get().state,'lesson');assert.match(e.title.textContent,/CONTROL UNIT/);});
test('destination selection walks to the component and never starts a level remotely',()=>{const s=setup(),e=s.elements;e.start.click();e.action.click();assert.equal(s.physics.get().state,'map-transition');s.tick(210);e['map-nodes'].children[0].click();assert.equal(s.physics.get().state,'map');e['map-enter'].click();assert.equal(s.physics.get().state,'lesson');});

test('dialogue reveals letters with blips, can finish immediately, and cancels old text',()=>{const elements={};let voices=0;const doc={hidden:false,getElementById(id){return elements[id]??={textContent:'',setAttribute(){},addEventListener(n,f){this[n]=f;}};}};const sandbox={document:doc,window:{cpuAudio:{voice(){voices++;}}}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dialogue.js','utf8'),sandbox);const d=sandbox.window.cpuDialogue,el=doc.getElementById('description');d.write(el,'Hello, computer.');assert.equal(el.textContent,'');d.update(.03);assert.ok(el.textContent.length>0&&el.textContent.length<15);assert.ok(voices>0);el.click();assert.equal(el.textContent,'Hello, computer.');const quiet=voices;d.update(1);assert.equal(voices,quiet);d.write(el,'Old line');d.write(el,'New line');for(let i=0;i<120;i++)d.update(1/120);assert.equal(el.textContent,'New line');d.write(el,'Cancelled');d.clear();el.textContent='Next screen';d.update(5);assert.equal(el.textContent,'Next screen');sandbox.window.matchMedia=()=>({matches:true});d.write(el,'Instant with reduced motion');assert.equal(el.textContent,'Instant with reduced motion');});

test('start keeps the bedroom visible until the fade covers the layout swap',()=>{const s=setup(),e=s.elements;e.start.click();assert.equal(e.home.hidden,false);assert.equal(e.stage.hidden,true);for(let i=0;i<36;i++)s.physics.step(1/120);assert.ok(Number(e['scene-curtain'].style.opacity)>0);assert.equal(e.home.hidden,false);for(let i=0;i<48;i++)s.physics.step(1/120);assert.equal(e.home.hidden,true);assert.equal(e.stage.hidden,false);assert.ok(Number(e['scene-curtain'].style.opacity)>.8);for(let i=0;i<80;i++)s.physics.step(1/120);assert.equal(e['scene-curtain'].hidden,true);assert.equal(s.physics.get().state,'intro');assert.equal(e.score.textContent,0);});
test('camera finishes aligned with the monitor and balances its render transforms',()=>{let depth=0;const scales=[];const context=new Proxy({save(){depth++;},restore(){depth--;assert.ok(depth>=0);},scale(x,y){scales.push([x,y]);}},{get:(o,k)=>k in o?o[k]:()=>{}});const sandbox={document:{getElementById:()=>null},window:{}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('opening.js','utf8'),sandbox);sandbox.window.cpuOpening.draw(context,1280,720,2,5.8);assert.equal(depth,0);assert.ok(scales.some(([x,y])=>Math.abs(x-320/41)<.00001&&Math.abs(y-180/26)<.00001));});

test('levels last 30 seconds plus 30 seconds per subsequent level',()=>{
 const s=setup(),e=s.elements;e.start.click();e.action.click();s.tick(210);
 for(let level=0;level<6;level++){
  s.go(level);e.action.click();
  const duration=30+level*30;
  const expectedSpeed=[.92,1.02,1.12,1.22,1.32,1.42][level];
  s.physics.step(1/120);assert.ok(Math.abs(parseFloat(e.speed.textContent)-expectedSpeed)<.02);
  s.physics.set({elapsed:0,distance:Number(e.score.textContent)*10});
  for(let tick=0;tick<duration*120-1;tick++){
   s.physics.set({obstacles:[],platforms:[],gaps:[],y:528,vy:0,grounded:true});
   s.physics.step(1/120);
  }
  assert.equal(s.physics.get().state,'running',`level ${level+1} ended early`);
  s.physics.step(1/120);
  assert.equal(s.physics.get().state,'boss-intro');
  assert.equal(s.physics.get().bossMaxHp,level+3);
  assert.equal(s.physics.get().unlocked,level);
  defeatBoss(s);
  assert.equal(s.physics.get().state,level===5?'won':'cleared');
  assert.match(e.chapter.textContent,/100%/);e.action.click();
 }
});

test('Space does not activate quiz answers or the continue button',()=>{
 const s=setup();s.elements.action.click();
 s.physics.set({obstacles:[{x:225,w:38,h:46}]});s.physics.step(1/120);
 assert.equal(s.physics.get().state,'quiz');
 let prevented=0;
 for(const type of ['keydown','keyup'])s.listeners[type]({code:'Space',preventDefault(){prevented++;}});
 assert.equal(prevented,2);assert.equal(s.physics.get().state,'quiz');
 s.elements.answers.children[s.correct()].click();
 s.listeners.keydown({code:'Space',preventDefault(){prevented++;}});
 assert.equal(prevented,3);assert.equal(s.physics.get().state,'saved');
});
test('popup hazards stay hidden at a distance and rise as the player approaches',()=>{
 const s=setup();s.elements.action.click();
 const hazard={x:1000,w:48,h:54,block:true,popup:true,rise:0};
 s.physics.set({obstacles:[hazard]});s.physics.step(1/120);
 assert.equal(hazard.rise,0);
 hazard.x=600;s.physics.step(1/120);assert.ok(hazard.rise>0);
 for(let i=0;i<30;i++)s.physics.step(1/120);
 assert.equal(hazard.rise,1);assert.equal(s.physics.get().state,'running');
 hazard.x=225;s.physics.step(1/120);assert.equal(s.physics.get().state,'quiz');
});

test('sky hazards fall on approach, pause with the game, and stop at the floor',()=>{
 const s=setup();s.elements.action.click();
 const hazard={x:1000,w:42,h:46,falling:true,base:-30,fallSpeed:0,dropping:false};
 s.physics.set({obstacles:[hazard]});s.physics.step(1/120);assert.equal(hazard.base,-30);
 hazard.x=850;s.physics.step(1/120);assert.ok(hazard.base>-30);
 s.listeners.keydown({code:'KeyP',repeat:false});const base=hazard.base;
 s.physics.step(1);assert.equal(hazard.base,base);s.elements.action.click();
 for(let i=0;i<150;i++){hazard.x=850;s.physics.step(1/120);}
 assert.equal(hazard.base,570);
});
test('wire decks support the player and their central break remains lethal',()=>{
 const s=setup();s.elements.action.click();
 s.physics.set({y:479,vy:200,grounded:false,platforms:[{x:180,w:150,h:48,thickness:18,wire:true}],gaps:[{x:200,w:400}]});
 s.physics.step(1/120);assert.equal(s.physics.get().grounded,true);assert.equal(s.physics.get().y,480);
 s.physics.set({y:540,vy:200,grounded:false,platforms:[{x:100,w:80,h:48,thickness:18,wire:true},{x:320,w:150,h:48,thickness:18,wire:true}]});
 s.physics.step(1/120);assert.equal(s.physics.get().state,'quiz');
});


test('walking across both wire curves and deck never costs a revive',()=>{
 const s=setup();s.elements.action.click();
 const platforms=[],begin=280,ramp=200,deck=300;
 for(let i=0;i<40;i++){
  const t=(i+.5)/40,height=48*t*t*(3-2*t);
  platforms.push({x:begin+i*5,w:5.5,h:height,thickness:18,wire:true,ramp:true});
  platforms.push({x:begin+ramp+deck+i*5,w:5.5,h:48-height,thickness:18,wire:true,ramp:true});
 }
 platforms.push({x:begin+ramp,w:deck,h:48,thickness:18,wire:true});
 s.physics.set({platforms,gaps:[{x:begin+ramp,w:deck}],obstacles:[]});
 let climbed=false;
 for(let i=0;i<290;i++){
  s.physics.set({obstacles:[]});s.physics.step(1/120);
  assert.equal(s.physics.get().state,'running',`wire hit at step ${i}`);
  if(s.physics.get().y<485)climbed=true;
 }
 assert.ok(climbed);assert.equal(s.physics.get().y,528);
 assert.equal(s.physics.loot().revives,3);
});

test('each level has a distinct palette and fifteen valid topic-specific questions',()=>{
 const bank={};vm.createContext(bank);
 vm.runInContext(fs.readFileSync('questions.js','utf8')+fs.readFileSync('journey.js','utf8')+';globalThis.bank={questions:cpuQuestions,stages:cpuStages};',bank);
 const {questions,stages}=bank.bank;
 assert.equal(questions.length,90);assert.equal(new Set(stages.map(s=>s.color)).size,6);
 assert.equal(new Set(stages.map(s=>s.background)).size,6);
 assert.equal(new Set(questions.map(q=>q.question)).size,90);
 for(const stage of stages){
  assert.equal(stage.ids.length,15);
  for(const id of stage.ids){
   const q=questions[id];assert.equal(q.topic,stage.name);assert.equal(q.options.length,4);
   assert.equal(new Set(q.options).size,4);assert.ok(q.correctAnswer>=0&&q.correctAnswer<4);assert.ok(q.explanation.length>20);
  }
 }
});
test('quiz exhausts its topic pool before repeating a question',()=>{
 const s=setup();s.elements.action.click();const seen=[];
 for(let i=0;i<16;i++){
  s.physics.set({revives:3,y:540,vy:300,grounded:false,gaps:[{x:180,w:150}],obstacles:[]});
  s.physics.step(1/120);assert.equal(s.physics.get().state,'quiz');
  seen.push(s.elements.title.textContent);
  s.elements.answers.children[s.correct()].click();s.elements.action.click();
 }
 assert.equal(new Set(seen.slice(0,15)).size,15);
 assert.notEqual(seen[14],seen[15]);
});

test('boss answers damage the bug, wrong answers cost revives, and leaving can be canceled',()=>{
 const s=setup(),e=s.elements;e.action.click();s.physics.set({elapsed:60});s.physics.step(1/120);
 assert.equal(s.physics.get().state,'boss-intro');assert.equal(s.physics.get().bossHp,3);
 assert.equal(e['boss-status'].hidden,false);assert.equal(s.physics.get().unlocked,0);
 e.action.click();const score=e.score.textContent;
 let prevented=0;s.listeners.keydown({code:'Space',preventDefault(){prevented++;}});
 assert.equal(prevented,1);assert.equal(s.physics.get().state,'boss-question');
 const question=e.title.textContent;e['back-map'].click();s.physics.step(1);e['stay-level'].click();
 assert.equal(e.title.textContent,question);assert.equal(s.physics.get().state,'boss-question');
 e.answers.children[(s.correct()+1)%4].click();assert.equal(s.physics.loot().revives,2);
 assert.equal(s.physics.get().bossHp,3);assert.equal(s.physics.get().state,'boss-result');
 s.physics.step(1);assert.equal(e.score.textContent,score);e.action.click();
 e.answers.children[s.correct()].click();assert.equal(s.physics.get().bossHp,2);
 e.answers.children[s.correct()].click();assert.equal(s.physics.get().bossHp,2);
 assert.equal(e['boss-health'].value,2);assert.equal(s.physics.get().unlocked,0);
});
test('losing a boss fight retries the same locked level with fresh hearts',()=>{
 const s=setup(),e=s.elements;e.action.click();s.physics.set({elapsed:60,revives:0});s.physics.step(1/120);
 e.action.click();e.answers.children[(s.correct()+1)%4].click();
 assert.equal(s.physics.get().state,'boss-over');assert.equal(s.physics.get().unlocked,0);
 e.action.click();assert.equal(s.physics.get().state,'lesson');assert.equal(s.physics.get().bossActive,false);
 assert.equal(s.physics.loot().revives,3);assert.equal(e['boss-status'].hidden,true);
});
test('boss banks stay on topic and increase in difficulty with enough unique challenges',()=>{
 const bank={};vm.createContext(bank);vm.runInContext(fs.readFileSync('questions.js','utf8')+';globalThis.bossBank=cpuBossQuestions;',bank);
 assert.equal(bank.bossBank.length,48);assert.equal(new Set(bank.bossBank.map(q=>q.question)).size,48);
 for(let stage=0;stage<6;stage++){
  const questions=bank.bossBank.filter(q=>q.stage===stage);assert.equal(questions.length,8);
  for(const q of questions){assert.equal(q.difficulty,stage+1);assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(q.correctAnswer>=0&&q.correctAnswer<4);}
 }
});
test('back-to-back transistors form compact jumpable groups with more in later levels',()=>{
 for(const [stage,count] of [[0,2],[2,3],[4,4]]){
  const s=setup(()=>.99);s.elements.action.click();s.physics.set({stageIndex:stage,spawnCount:1,elapsed:9});
  s.physics.spawn();const group=s.physics.loot().obstacles;assert.equal(group.length,count);
  for(let i=1;i<group.length;i++)assert.equal(group[i].x-group[i-1].x,40);
  assert.ok(group.at(-1).x+group.at(-1).w-group[0].x<160);
 }
});

test('each level has a distinct bug silhouette and a wire color derived from its palette',()=>{
 const s=setup(),bugs=s.physics.appearance().bugs;
 assert.equal(bugs.length,6);assert.equal(new Set(bugs.map(rows=>rows.join(''))).size,6);
 const wireColors=[];
 for(let stage=0;stage<6;stage++){
  s.physics.set({stageIndex:stage});const look=s.physics.appearance();
  assert.match(look.wire,/^#[0-9a-f]{6}$/);wireColors.push(look.wire);
  for(const row of bugs[stage])assert.equal(row.length,10);
 }
 assert.equal(new Set(wireColors).size,6);
});
test('defeated boss animates into a persistent splat and freezes while leaving is confirmed',()=>{
 const s=setup(Math.random,true),e=s.elements;e.action.click();s.physics.set({elapsed:60});s.physics.step(1/120);e.action.click();
 for(let i=0;i<3;i++){
  e.answers.children[s.correct()].click();if(i<2)e.action.click();
 }
 assert.equal(s.physics.get().state,'boss-defeated');assert.equal(s.physics.get().bossHp,0);
 s.tick(60);assert.ok(s.physics.get().bossDeathTime>.8);
 assert.ok(s.drawing.some(({args})=>args[1]===565&&args[2]>=80));
 e['back-map'].click();const time=s.physics.get().bossDeathTime;s.physics.step(1);
 assert.equal(s.physics.get().bossDeathTime,time);e['stay-level'].click();
 assert.equal(s.physics.get().state,'boss-defeated');e.action.click();assert.equal(s.physics.get().state,'cleared');
});

function practice(s,count){
 for(let i=0;i<count;i++){
  s.elements['review-answers'].children[s.reviewCorrect()].click();
  s.elements['review-next'].click();
 }
}
test('review serves ten distinct random questions per batch and preserves the map position',()=>{
 const s=setup(),e=s.elements;e.start.click();e.action.click();s.tick(210);
 const position=s.world.inspect().distance;e['review-tab'].click();
 assert.equal(s.physics.get().state,'practice');assert.equal(e['map-panel'].hidden,true);
 const seen=[];
 for(let i=0;i<10;i++){
  assert.match(e['review-count'].textContent,new RegExp(`Question ${i+1} / 10`));
  seen.push(e['review-question'].textContent);
  e['review-answers'].children[s.reviewCorrect()].click();
  if(i<9)e['review-next'].click();
 }
 assert.equal(new Set(seen).size,10);assert.match(e['review-feedback'].textContent,/Batch complete: 10 \/ 10 correct/);
 assert.equal(e['review-next'].textContent,'Start 10 new questions');e['review-next'].click();
 assert.match(e['review-count'].textContent,/Question 1 \/ 10/);assert.equal(e['review-next'].disabled,true);
 const question=e['review-question'].textContent;e['review-next'].click();assert.equal(e['review-question'].textContent,question);
 assert.equal(s.physics.get().unlocked,0);s.listeners.keydown({code:'ArrowRight'});s.tick(30);
 assert.equal(s.world.inspect().distance,position);e['map-tab'].click();assert.equal(s.physics.get().state,'map');
});
test('ten correct practice answers earn one coin, with wrong answers and double clicks earning none',()=>{
 const s=setup(),e=s.elements;
 e['review-answers'].children[(s.reviewCorrect()+1)%4].click();assert.equal(s.review.getProgress(),0);
 e['review-next'].click();practice(s,9);assert.equal(s.review.getCoins(),0);assert.equal(s.review.getProgress(),9);
 e['review-answers'].children[s.reviewCorrect()].click();assert.equal(s.review.getCoins(),1);assert.equal(s.review.getProgress(),0);
 e['review-answers'].children[s.reviewCorrect()].click();assert.equal(s.review.getCoins(),1);assert.equal(s.review.getProgress(),0);
});
test('coins and partial progress survive reload and malformed stored data is ignored',()=>{
 const storage=new Map(),s=setup(Math.random,false,storage);practice(s,13);
 const reload=setup(Math.random,false,storage);assert.equal(reload.review.getCoins(),1);assert.equal(reload.review.getProgress(),3);
 assert.equal(reload.review.spendCoin(),true);assert.equal(reload.review.spendCoin(),false);
 const again=setup(Math.random,false,storage);assert.equal(again.review.getCoins(),0);assert.equal(again.review.getProgress(),3);
 for(const value of ['bad json','{"coins":-4,"progress":20}','{"coins":1.5,"progress":-1}']){
  const invalid=setup(Math.random,false,new Map([['cpuEscapePractice',value]]));assert.equal(invalid.review.getCoins(),0);assert.equal(invalid.review.getProgress(),0);
 }
});
test('a coin skips a run or recovery question once without increasing answer accuracy',()=>{
 const s=setup(),e=s.elements;practice(s,20);e.action.click();
 function crash(){s.physics.set({y:540,vy:300,grounded:false,gaps:[{x:180,w:150}]});s.physics.step(1/120);}
 crash();assert.equal(e['skip-question'].hidden,false);assert.equal(e['skip-question'].disabled,false);
 e['skip-question'].click();assert.equal(s.physics.get().state,'running');assert.equal(s.review.getCoins(),1);
 assert.equal(s.physics.get().attempts,0);assert.equal(s.physics.get().correctCount,0);
 e['skip-question'].click();assert.equal(s.review.getCoins(),1);
 crash();e.answers.children[(s.correct()+1)%4].click();e.action.click();
 e['skip-question'].click();assert.equal(s.physics.get().state,'running');assert.equal(s.review.getCoins(),0);
 assert.equal(s.physics.get().attempts,1);assert.equal(s.physics.get().correctCount,0);
});
test('a boss skip spends one coin for one damage and cannot be spent on answered or confirmation screens',()=>{
 const s=setup(),e=s.elements;practice(s,10);e.action.click();s.physics.set({elapsed:60});s.physics.step(1/120);e.action.click();
 e['back-map'].click();e['skip-question'].click();assert.equal(s.review.getCoins(),1);e['stay-level'].click();
 e['skip-question'].click();assert.equal(s.review.getCoins(),0);assert.equal(s.physics.get().bossHp,2);
 assert.equal(s.physics.get().attempts,0);assert.equal(s.physics.get().correctCount,0);assert.equal(s.physics.get().state,'boss-result');
 e['skip-question'].click();assert.equal(s.physics.get().bossHp,2);
 e.action.click();assert.equal(e['skip-question'].disabled,true);e['skip-question'].click();assert.equal(s.physics.get().bossHp,2);
});

test('free play passes the story endpoint, ends on collision, and restarts at zero',()=>{
 const s=setup(),e=s.elements;
 e['free-play-tab'].click();assert.equal(e['free-play-panel'].hidden,false);assert.equal(e['map-panel'].hidden,true);
 e['free-play-start'].click();
 s.physics.set({elapsed:61,distance:25000});s.physics.step(1/120);
 assert.equal(s.physics.get().state,'running');assert.equal(s.physics.get().bossActive,false);
 assert.match(e.chapter.textContent,/ENDLESS/);assert.equal(e.hearts.hidden,true);
 s.physics.set({obstacles:[{x:220,w:48,h:54}]});s.physics.step(1/120);
 assert.equal(s.physics.get().state,'over');assert.equal(e.answers.children.length,0);
 assert.match(e.description.textContent+e.title.textContent,/caught|Distance/);
 e.action.click();assert.equal(e.score.textContent,0);assert.equal(s.physics.get().state,'running');
});

test('free play high score persists separately and returning selects its tab',()=>{
 const storage=new Map(),s=setup(Math.random,false,storage),e=s.elements;
 e['free-play-start'].click();s.physics.set({distance:4321});s.physics.step(1/120);
 assert.equal(storage.get('cpuEscapeFreeBest'),'432');assert.equal(storage.has('cpuEscapeBest'),false);
 e['back-map'].click();e['leave-level'].click();
 assert.equal(e['free-play-panel'].hidden,false);assert.equal(e['free-play-best'].textContent,'432 m');
 const reload=setup(Math.random,false,storage);reload.elements['free-play-tab'].click();
 assert.equal(reload.elements['free-play-best'].textContent,'432 m');
 reload.elements['free-play-start'].click();assert.equal(reload.elements.best.textContent,'BEST 432 m');
});

test('electrical arc pulses, freezes on pause, and can be jumped over',()=>{
 const s=setup(),e=s.elements;e['free-play-start'].click();
 s.physics.set({spawnCount:6});s.physics.spawn();
 const arc=s.physics.loot().obstacles.find(o=>o.arc);assert.ok(arc);assert.equal(arc.w,64);
 s.physics.step(1/120);assert.ok(arc.age>0);
 s.listeners.keydown({code:'KeyP',repeat:false});const age=arc.age;s.physics.step(1/60);assert.equal(arc.age,age);
 e.action.click();
 s.physics.set({y:420,vy:0,grounded:false,obstacles:[{x:220,w:64,h:68,arc:true,age:Math.PI/10}]});
 s.physics.step(1/120);assert.equal(s.physics.get().state,'running');
 s.physics.set({y:528,vy:0,grounded:true});s.physics.step(1/120);assert.equal(s.physics.get().state,'over');
});

test('low tunnel permits running but jumping into its ceiling ends either mode immediately',()=>{
 for(const free of [false,true]){
  const s=setup(),e=s.elements;if(free)e['free-play-start'].click();else e.action.click();
  s.physics.set({spawnCount:10});s.physics.spawn();
  const tunnel=s.physics.loot().obstacles.find(o=>o.tunnel);assert.ok(tunnel);
  tunnel.x=200;
  for(let i=0;i<6;i++)s.physics.step(1/120);
  assert.equal(s.physics.get().state,'running');assert.equal(s.physics.loot().revives,3);
  s.listeners.keydown({code:'Space',repeat:false,preventDefault(){}});
  for(let i=0;i<15&&s.physics.get().state==='running';i++)s.physics.step(1/120);
  assert.equal(s.physics.get().state,'over');assert.equal(e.answers.children.length,0);
  assert.match(e.title.textContent,/tunnel ceiling/);
 }
});


test('shop spends coins once, equips owned styles freely, and restores purchases after reload',()=>{
 const storage=new Map([['cpuEscapePractice',JSON.stringify({coins:6,progress:0})]]);
 const s=setup(Math.random,false,storage),e=s.elements;e['shop-tab'].click();
 assert.equal(e['shop-panel'].hidden,false);assert.equal(e['shop-items'].children.length,5);
 const original=s.character.palette().c;
 e['shop-items'].children[1].children[2].click();
 assert.equal(s.review.getCoins(),4);assert.equal(s.character.palette().c,'#a8ffd5');
 e['shop-items'].children[0].children[2].click();assert.equal(s.character.palette().c,original);
 e['shop-items'].children[1].children[2].click();assert.equal(s.review.getCoins(),4);
 s.physics.set({stageIndex:5});assert.equal(s.character.palette().c,'#a8ffd5');
 const reload=setup(Math.random,false,storage);assert.equal(reload.character.palette().c,'#a8ffd5');
 assert.equal(reload.review.getCoins(),4);reload.elements['shop-tab'].click();
 assert.equal(reload.elements['shop-items'].children[1].children[2].textContent,'Equipped');
});

test('shop blocks unaffordable purchases and ignores invalid saved styles',()=>{
 const storage=new Map([['cpuEscapeCharacter',JSON.stringify({owned:['missing'],equipped:'missing'})]]);
 const s=setup(Math.random,false,storage),e=s.elements;e['shop-tab'].click();
 assert.equal(s.character.palette().c,'#a8bbdb');
 const buy=e['shop-items'].children[4].children[2];assert.equal(buy.disabled,true);
 buy.click();assert.equal(s.review.getCoins(),0);assert.equal(s.character.palette().c,'#a8bbdb');
 assert.equal(s.review.spendCoins(-1),false);assert.equal(s.review.spendCoins(0.5),false);
});


test('temporary testing unlock makes every map destination available',()=>{
 const s=setup(Math.random,false,new Map(),true),e=s.elements;
 e.start.click();e.action.click();s.tick(210);
 assert.equal(s.physics.get().unlocked,5);
 for(const node of e['map-nodes'].children)assert.equal(node.disabled,false);
 s.go(5);assert.equal(s.physics.get().state,'lesson');assert.match(e.title.textContent,/CLOCK/);
});


test('every level renders scenery for its own component',()=>{
 const s=setup(Math.random,true);s.elements.action.click();
 const landmarks=['CENTRAL PROCESSOR','DECODER','REGISTER FILE / IMMEDIATE ACCESS','OPERAND A','HOT DATA / SHORTER PATHS','OSCILLATOR'];
 for(let stage=0;stage<6;stage++){
  s.drawnLabels.length=0;s.physics.set({stageIndex:stage});s.tick(1);
  assert.ok(s.drawnLabels.includes(landmarks[stage]),landmarks[stage]);
  assert.ok(!s.drawnLabels.includes(landmarks[(stage+1)%6]));
 }
});

test('logic gate sequences require consecutive jumps and are clearable at low and high speeds',()=>{
 for(const stage of [0,5]){
  const s=setup(),e=s.elements;e['free-play-start'].click();
  s.physics.set({stageIndex:stage,spawnCount:8,elapsed:1});s.physics.step(1/120);s.physics.spawn();
  const gates=s.physics.loot().obstacles.filter(o=>o.logicGate);
  assert.equal(gates.length,3+Math.floor(stage/2));assert.equal(gates.slice(0,3).map(o=>o.logicGate).join(','),'AND,OR,NOT');
  const jumped=new Set();
  for(let n=0;n<1500;n++){
   const next=gates.find(o=>!jumped.has(o));
   const speed=parseFloat(e.speed.textContent)*360;
   if(next&&next.x<=262+speed*.18&&s.physics.get().grounded){
    jumped.add(next);s.listeners.keydown({code:'Space',repeat:false,preventDefault(){}});
    s.physics.step(1/120);s.listeners.keyup({code:'Space',preventDefault(){}});
   }else s.physics.step(1/120);
   assert.equal(s.physics.get().state,'running');
   if(gates.at(-1).x+54<220)break;
  }
  assert.equal(jumped.size,gates.length);assert.ok(gates.at(-1).x+54<220);
 }
});


test('free play uses unlabeled computer scenery while story keeps its CPU theme',()=>{
 const s=setup(Math.random,true);s.elements['free-play-start'].click();s.drawnLabels.length=0;s.tick(1);
 for(const label of ['CPU','FETCH / DECODE / EXECUTE','CENTRAL PROCESSOR','INSTRUCTION BUS'])assert.ok(!s.drawnLabels.includes(label));
 s.elements['back-map'].click();s.elements['leave-level'].click();s.elements['map-tab'].click();s.go(0);
 s.drawnLabels.length=0;s.tick(1);assert.ok(s.drawnLabels.includes('CPU'));assert.ok(s.drawnLabels.includes('CENTRAL PROCESSOR'));
});

test('boss finishing shot arrives before melting and cannot be skipped with Finish level',()=>{
 const s=setup(Math.random,true),e=s.elements;e.action.click();s.physics.set({elapsed:30});s.physics.step(1/120);e.action.click();
 for(let hit=0;hit<3;hit++){e.answers.children[s.correct()].click();if(hit<2)e.action.click();}
 assert.equal(e.overlay.hidden,true);e.action.click();assert.equal(s.physics.get().state,'boss-defeated');
 s.drawing.length=0;s.tick(10);
 assert.ok(s.physics.get().bossDeathTime<.28);
 assert.ok(!s.drawing.some(({args})=>args[1]===565&&args[2]>=60));
 s.tick(20);assert.ok(s.physics.get().bossDeathTime>.28);
 assert.ok(s.drawing.some(({args})=>args[1]===565&&args[2]>=60));assert.equal(e.overlay.hidden,true);
 s.tick(30);assert.equal(e.overlay.hidden,false);e.action.click();assert.equal(s.physics.get().state,'cleared');
});


test('curved wire rises from overlapping ground, has one jumpable middle break, and returns to ground',()=>{
 for(const stage of [0,5]){
  const s=setup(),e=s.elements;e['free-play-start'].click();
  s.physics.set({stageIndex:stage,spawnCount:4,elapsed:1});s.physics.step(1/120);s.physics.spawn();
  const wires=s.physics.loot().platforms,pit=s.physics.loot().gaps[0];
  const decks=wires.filter(p=>!p.ramp);assert.equal(decks.length,2);
  assert.ok(wires[0].x<pit.x);assert.ok(wires.at(-1).x+wires.at(-1).w>pit.x+pit.w);
  assert.ok(decks[1].x>decks[0].x+decks[0].w);
  let jumped=false,climbed=false;
  for(let n=0;n<1800;n++){
   const speed=parseFloat(e.speed.textContent)*360;
   if(!jumped&&decks[0].x+decks[0].w<=262+speed*.18&&s.physics.get().grounded){
    jumped=true;s.listeners.keydown({code:'Space',repeat:false,preventDefault(){}});
    s.physics.step(1/120);s.listeners.keyup({code:'Space',preventDefault(){}});
   }else s.physics.step(1/120);
   assert.equal(s.physics.get().state,'running');
   if(!jumped&&s.physics.get().grounded&&s.physics.get().y<460)climbed=true;
   if(wires.at(-1).x+wires.at(-1).w<220&&s.physics.get().grounded)break;
  }
  assert.ok(climbed);assert.ok(jumped);assert.equal(s.physics.get().y,528);
 }
});
