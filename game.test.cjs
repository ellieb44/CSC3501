const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function setup(){
 const elements={};const listeners={};let frame;
 function element(){return {textContent:'',hidden:false,children:[],classList:{add(){}},addEventListener(n,f){this[n]=f;},replaceChildren(){this.children=[];},append(b){this.children.push(b);},get firstElementChild(){return this.children[0];},focus(){},setPointerCapture(){}};}
 const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:()=>{}});
 const document={getElementById(id){return elements[id]??=(id==='game'?Object.assign(element(),{getContext:()=>ctx}):element());},createElement:element,addEventListener(){}};
 const sandbox={document,window:{addEventListener(n,f){listeners[n]=f;}},localStorage:{getItem:()=>0,setItem(){}},requestAnimationFrame:f=>frame=f,Math};
 vm.createContext(sandbox);vm.runInContext(fs.readFileSync('questions.js','utf8'),sandbox);
 const source=fs.readFileSync('game.js','utf8').replace('hud();requestAnimationFrame(frame);','globalThis.physics={set(v){if(v.y!==undefined)y=v.y;if(v.vy!==undefined)vy=v.vy;if(v.grounded!==undefined)grounded=v.grounded;if(v.platforms)platforms=v.platforms;if(v.gaps)gaps=v.gaps;},get(){return {y,vy,grounded,state,platforms:platforms.length,gaps:gaps.length};},step};hud();requestAnimationFrame(frame);');
 vm.runInContext(source.replace('if(v.platforms)platforms=v.platforms;','if(v.distance!==undefined)distance=v.distance;if(v.revives!==undefined)revives=v.revives;if(v.obstacles)obstacles=v.obstacles;if(v.platforms)platforms=v.platforms;').replace('step};hud()', 'step,updatePickups,heartDistance,loot(){return {revives,heartNumber,pickups};}};hud()'),sandbox);
 let time=0;function tick(n){for(let i=0;i<n;i++){time+=1000/60;frame(time);}}
 return {elements,listeners,tick,physics:sandbox.physics,correct:()=>vm.runInContext('cpuQuestions.find(q=>q.question===document.getElementById("title").textContent).correctAnswer',sandbox)};
}
test('collision freezes distance; correct answer preserves score; wrong answer requires zero restart',()=>{
 const s=setup(),e=s.elements;e.action.click();
 for(let i=0;i<2000&&e.overlay.hidden;i++)s.tick(1);
 assert.equal(e.overlay.hidden,false);assert.equal(e.answers.children.length,4);
 const score=e.score.textContent;assert.ok(Number(score)>0);s.tick(120);assert.equal(e.score.textContent,score);
 e.answers.children[s.correct()].click();e.action.click();assert.equal(e.score.textContent,score);assert.equal(e.overlay.hidden,true);
 for(let i=0;i<2000&&e.overlay.hidden;i++)s.tick(1);
 e.answers.children[(s.correct()+1)%4].click();assert.match(e.action.textContent,/Restart/);e.action.click();assert.equal(e.score.textContent,0);
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
 const s=setup();s.elements.start.click();s.physics.set({distance:4000});s.physics.updatePickups();
 assert.equal(s.physics.loot().pickups.length,0);assert.equal(s.physics.loot().heartNumber,2);
 s.physics.set({distance:5000,revives:2});s.physics.updatePickups();assert.equal(s.physics.loot().pickups.length,0);
 s.physics.set({distance:10000});s.physics.updatePickups();assert.equal(s.physics.loot().pickups[0].at,1100);
 s.physics.set({revives:3});s.physics.updatePickups();assert.equal(s.physics.loot().pickups.length,0);
});
test('home screen hides game and stats until Start, and waits without advancing',()=>{
 const s=setup(),e=s.elements;
 assert.equal(e.home.hidden,false);assert.equal(e.stage.hidden,true);assert.equal(e.hud.hidden,true);assert.equal(e.controls.hidden,true);
 s.tick(120);assert.equal(e.score.textContent,0);assert.equal(s.physics.get().state,'ready');
 e.start.click();assert.equal(e.home.hidden,true);assert.equal(e.stage.hidden,false);assert.equal(e.hud.hidden,false);assert.equal(e.controls.hidden,false);
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
 s.elements.answers.children[(s.correct()+1)%4].click();s.elements.action.click();
 assert.equal(s.physics.loot().heartNumber,1);assert.equal(s.physics.loot().revives,3);assert.equal(s.physics.loot().pickups.length,0);
});
