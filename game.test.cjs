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
 vm.createContext(sandbox);vm.runInContext(fs.readFileSync('questions.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('game.js','utf8'),sandbox);
 let time=0;function tick(n){for(let i=0;i<n;i++){time+=1000/60;frame(time);}}
 return {elements,listeners,tick,correct:()=>vm.runInContext('cpuQuestions.find(q=>q.question===document.getElementById("title").textContent).correctAnswer',sandbox)};
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
