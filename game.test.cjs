const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function setup(){
 const elements={};const listeners={};let frame;
 function element(){return {style:{},setAttribute(){},textContent:'',hidden:false,children:[],classList:{add(){},remove(){}},addEventListener(n,f){this[n]=f;},replaceChildren(){this.children=[];},append(b){this.children.push(b);},get firstElementChild(){return this.children[0];},focus(){},setPointerCapture(){}};}
 const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:()=>{}});
 const document={getElementById(id){return elements[id]??=(['game','map-canvas'].includes(id)?Object.assign(element(),{getContext:()=>ctx}):element());},createElement:element,addEventListener(){}};
 const sandbox={document,window:{addEventListener(n,f){listeners[n]=f;}},localStorage:{getItem:()=>0,setItem(){}},requestAnimationFrame:f=>frame=f,Math};
 vm.createContext(sandbox);vm.runInContext(fs.readFileSync('questions.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('journey.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('map-world.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dialogue.js','utf8'),sandbox);
 const source=fs.readFileSync('game.js','utf8').replace('hud();requestAnimationFrame(frame);','globalThis.physics={set(v){if(v.y!==undefined)y=v.y;if(v.vy!==undefined)vy=v.vy;if(v.grounded!==undefined)grounded=v.grounded;if(v.platforms)platforms=v.platforms;if(v.gaps)gaps=v.gaps;},get(){return {y,vy,grounded,state,platforms:platforms.length,gaps:gaps.length};},step};hud();requestAnimationFrame(frame);');
 vm.runInContext(source.replace('if(v.platforms)platforms=v.platforms;','if(v.distance!==undefined)distance=v.distance;if(v.revives!==undefined)revives=v.revives;if(v.obstacles)obstacles=v.obstacles;if(v.platforms)platforms=v.platforms;').replace('step};hud()', 'step,updatePickups,heartDistance,loot(){return {revives,heartNumber,pickups};}};hud()'),sandbox);
 let time=0;function tick(n){for(let i=0;i<n;i++){time+=1000/60;frame(time);}}
 function go(index){for(let n=0;n<420;n++)sandbox.physics.step(1/120);elements['map-nodes'].children[index].click();for(let n=0;n<2400;n++)sandbox.physics.step(1/120);elements['map-enter'].click();}
 return {elements,listeners,tick,go,world:sandbox.window.cpuMap,physics:sandbox.physics,correct:()=>vm.runInContext('cpuQuestions.find(q=>q.question===document.getElementById("title").textContent).correctAnswer',sandbox)};
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

test('map locks future levels and finishing each route unlocks the next',()=>{const s=setup(),e=s.elements;e.start.click();e.action.click();s.tick(210);for(let level=0;level<6;level++){assert.equal(s.physics.get().state,'map');assert.equal(e['map-nodes'].children[level].disabled,false);if(level<5)assert.equal(e['map-nodes'].children[level+1].disabled,true);s.go(level);e.action.click();s.physics.set({distance:(level+1)*6000});s.physics.step(1/120);assert.equal(s.physics.get().state,level===5?'won':'cleared');e.action.click();}assert.match(e['map-status'].textContent,/finally go home/);});
test('story fades in and out automatically then reveals the map without running',()=>{const s=setup(),e=s.elements;e.start.click();for(let i=0;i<145;i++)s.physics.step(1/120);for(let i=0;i<60;i++)s.physics.step(1/120);const fadeIn=Number(e.overlay.style.opacity);assert.ok(fadeIn>0&&fadeIn<1);for(let i=0;i<600;i++)s.physics.step(1/120);assert.ok(Number(e.overlay.style.opacity)<fadeIn);for(let i=0;i<3500;i++)s.physics.step(1/120);assert.equal(s.physics.get().state,'map');assert.equal(e.score.textContent,0);assert.equal(e.stage.hidden,true);});
test('wrong encounter answer explains the concept and recovery can preserve a run',()=>{const s=setup(),e=s.elements;e.action.click();s.physics.set({y:540,gaps:[{x:180,w:150}]});s.physics.step(1/120);e.answers.children[(s.correct()+1)%4].click();assert.equal(s.physics.get().state,'review');s.tick(120);assert.ok(e.feedback.textContent.length>30);e.action.click();e.answers.children[s.correct()].click();e.action.click();assert.equal(s.physics.get().state,'running');});

test('return confirmation freezes a level and cancel preserves its progress',()=>{const s=setup(),e=s.elements;e.action.click();s.tick(30);const score=e.score.textContent;e['back-map'].click();assert.equal(s.physics.get().state,'confirm-leave');assert.equal(e['leave-confirm'].hidden,false);s.tick(120);assert.equal(e.score.textContent,score);s.listeners.keydown({code:'KeyP',repeat:false});assert.equal(s.physics.get().state,'confirm-leave');e['stay-level'].click();assert.equal(s.physics.get().state,'running');assert.equal(e['leave-confirm'].hidden,true);assert.equal(e.score.textContent,score);s.tick(15);assert.ok(Number(e.score.textContent)>Number(score));});
test('confirming return preserves unlocked levels and re-entry resets the current attempt',()=>{const s=setup(),e=s.elements;e.start.click();e.action.click();s.tick(210);s.go(0);e.action.click();s.physics.set({distance:6000});s.physics.step(1/120);e.action.click();s.go(1);e.action.click();s.physics.set({distance:7000,revives:1});s.physics.step(1/120);e['back-map'].click();e['leave-level'].click();assert.equal(s.physics.get().state,'map');assert.equal(e['map-nodes'].children[1].disabled,false);assert.equal(e['map-nodes'].children[2].disabled,true);assert.equal(e['level-toolbar'].hidden,true);s.go(1);assert.equal(e.score.textContent,600);assert.equal(s.physics.loot().revives,3);assert.equal(s.physics.get().state,'lesson');});
test('cancel return preserves an unanswered quiz and Escape dismisses confirmation',()=>{const s=setup(),e=s.elements;e.action.click();s.physics.set({y:540,gaps:[{x:180,w:150}]});s.physics.step(1/120);const question=e.title.textContent,answers=e.answers.children;e['back-map'].click();e['leave-confirm'].keydown({code:'Escape',preventDefault(){}});assert.equal(s.physics.get().state,'quiz');assert.equal(e.title.textContent,question);assert.equal(e.answers.children,answers);e.answers.children[s.correct()].click();e.action.click();assert.equal(s.physics.get().state,'running');});

test('audio changes composition for every location and mute silences effects',()=>{const elements={},notes=[];let pulse,context;const parameter=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){},setTargetAtTime(value){this.value=value;}});class AudioContext{constructor(){this.currentTime=0;this.state='running';this.destination={};context=this;}resume(){return Promise.resolve();}createGain(){return {gain:parameter(),connect(){}};}createOscillator(){const oscillator={frequency:{value:0},connect(){},start(){notes.push(this.frequency.value);},stop(){}};return oscillator;}}const document={hidden:false,addEventListener(name,fn){this[name]=fn;},getElementById(id){return elements[id]??={addEventListener(name,fn){this[name]=fn;},setAttribute(){}};}};const sandbox={document,window:{AudioContext},setInterval(fn){pulse=fn;return 1;}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('sound.js','utf8'),sandbox);const audio=sandbox.window.cpuAudio;audio.start();const phrases=[];for(const scene of ['home','map',0,1,2,3,4,5]){audio.setScene(scene);const start=notes.length;for(let n=0;n<16;n++){context.currentTime+=1;pulse();}phrases.push(JSON.stringify(notes.slice(start)));}assert.equal(new Set(phrases).size,8);const interactionStart=notes.length;document.click({target:{closest:()=>({disabled:false,closest:()=>null})}});assert.ok(notes.length>interactionStart);const disabledStart=notes.length;document.click({target:{closest:()=>({disabled:true})}});assert.equal(notes.length,disabledStart);const before=notes.length;audio.effect('stuck');assert.ok(notes.length>before);elements.music.click();const muted=notes.length;audio.effect('arrival');audio.voice();context.currentTime++;pulse();assert.equal(notes.length,muted);elements.music.click();context.currentTime++;pulse();assert.ok(notes.length>muted);});
test('opening renderer draws all cutscene phases without changing gameplay',()=>{const s=setup();const context=new Proxy({}, {get:(o,k)=>k in o?o[k]:()=>{}});const sandbox={document:{getElementById:()=>null},window:{}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('opening.js','utf8'),sandbox);for(let phase=0;phase<5;phase++)for(const time of [0,1,2.8,4])sandbox.window.cpuOpening.draw(context,1280,720,phase,time);assert.equal(s.physics.get().state,'ready');});

test('map travel is gradual, follows unlock limits, and Enter starts only near a landmark',()=>{const s=setup(),e=s.elements;e.start.click();e.action.click();s.tick(210);const initial=s.world.inspect();s.listeners.keydown({code:'ArrowRight',preventDefault(){}});for(let i=0;i<1200;i++)s.physics.step(1/120);s.listeners.keyup({code:'ArrowRight',preventDefault(){}});assert.equal(s.world.inspect().distance,initial.distance);s.go(0);e.action.click();s.physics.set({distance:6000});s.physics.step(1/120);e.action.click();s.listeners.keydown({code:'KeyD',preventDefault(){}});for(let i=0;i<60;i++)s.physics.step(1/120);s.listeners.keyup({code:'KeyD',preventDefault(){}});assert.ok(s.world.inspect().distance>0);assert.equal(s.world.inspect().nearby,-1);e['map-enter'].click();assert.equal(s.physics.get().state,'map');const stopped=s.world.inspect().distance;for(let i=0;i<120;i++)s.physics.step(1/120);assert.equal(s.world.inspect().distance,stopped);s.listeners.keydown({code:'ArrowRight',preventDefault(){}});for(let i=0;i<1200;i++)s.physics.step(1/120);s.listeners.keyup({code:'ArrowRight',preventDefault(){}});assert.equal(s.world.inspect().nearby,1);s.listeners.keydown({code:'Enter',repeat:false,preventDefault(){}});assert.equal(s.physics.get().state,'lesson');assert.match(e.title.textContent,/CONTROL UNIT/);});
test('destination selection walks to the component and never starts a level remotely',()=>{const s=setup(),e=s.elements;e.start.click();e.action.click();assert.equal(s.physics.get().state,'map-transition');s.tick(210);e['map-nodes'].children[0].click();assert.equal(s.physics.get().state,'map');e['map-enter'].click();assert.equal(s.physics.get().state,'lesson');});

test('dialogue reveals letters with blips, can finish immediately, and cancels old text',()=>{const elements={};let voices=0;const doc={hidden:false,getElementById(id){return elements[id]??={textContent:'',setAttribute(){},addEventListener(n,f){this[n]=f;}};}};const sandbox={document:doc,window:{cpuAudio:{voice(){voices++;}}}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dialogue.js','utf8'),sandbox);const d=sandbox.window.cpuDialogue,el=doc.getElementById('description');d.write(el,'Hello, computer.');assert.equal(el.textContent,'');d.update(.03);assert.ok(el.textContent.length>0&&el.textContent.length<15);assert.ok(voices>0);el.click();assert.equal(el.textContent,'Hello, computer.');const quiet=voices;d.update(1);assert.equal(voices,quiet);d.write(el,'Old line');d.write(el,'New line');for(let i=0;i<120;i++)d.update(1/120);assert.equal(el.textContent,'New line');d.write(el,'Cancelled');d.clear();el.textContent='Next screen';d.update(5);assert.equal(el.textContent,'Next screen');sandbox.window.matchMedia=()=>({matches:true});d.write(el,'Instant with reduced motion');assert.equal(el.textContent,'Instant with reduced motion');});

test('start keeps the bedroom visible until the fade covers the layout swap',()=>{const s=setup(),e=s.elements;e.start.click();assert.equal(e.home.hidden,false);assert.equal(e.stage.hidden,true);for(let i=0;i<36;i++)s.physics.step(1/120);assert.ok(Number(e['scene-curtain'].style.opacity)>0);assert.equal(e.home.hidden,false);for(let i=0;i<48;i++)s.physics.step(1/120);assert.equal(e.home.hidden,true);assert.equal(e.stage.hidden,false);assert.ok(Number(e['scene-curtain'].style.opacity)>.8);for(let i=0;i<80;i++)s.physics.step(1/120);assert.equal(e['scene-curtain'].hidden,true);assert.equal(s.physics.get().state,'intro');assert.equal(e.score.textContent,0);});
test('camera finishes aligned with the monitor and balances its render transforms',()=>{let depth=0;const scales=[];const context=new Proxy({save(){depth++;},restore(){depth--;assert.ok(depth>=0);},scale(x,y){scales.push([x,y]);}},{get:(o,k)=>k in o?o[k]:()=>{}});const sandbox={document:{getElementById:()=>null},window:{}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('opening.js','utf8'),sandbox);sandbox.window.cpuOpening.draw(context,1280,720,2,5.8);assert.equal(depth,0);assert.ok(scales.some(([x,y])=>Math.abs(x-320/41)<.00001&&Math.abs(y-180/26)<.00001));});
