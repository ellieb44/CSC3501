/* Fixed timestep keeps movement and collisions independent of render FPS. */
(() => {
'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const ui=Object.fromEntries(['overlay','eyebrow','title','description','answers','feedback','action','score','best','speed'].map(id=>[id,document.getElementById(id)]));
const W=1280,H=720,FLOOR=570,SIZE=42,X=220,STEP=1/120;
canvas.width=W;canvas.height=H;
let state='ready',distance=0,elapsed=0,speed=360,best=0,y=FLOOR-SIZE,vy=0,angle=0,held=false,buffer=0,obstacles=[],nextSpawn=850,invincible=0,lastQuestion=-1,accumulator=0,previous=0,action=start;
try{best=Number(localStorage.getItem('cpuEscapeBest'))||0;}catch{}
function hud(){ui.score.textContent=Math.floor(distance/10);ui.best.textContent=`BEST ${best} m`;ui.speed.textContent=`${(speed/360).toFixed(2)}× SPEED`;}
function save(){best=Math.max(best,Math.floor(distance/10));try{localStorage.setItem('cpuEscapeBest',String(best));}catch{}}
function modal(label,title,description,button,callback){held=false;buffer=0;ui.overlay.hidden=false;ui.eyebrow.textContent=label;ui.title.textContent=title;ui.description.textContent=description;ui.answers.replaceChildren();ui.feedback.textContent='';ui.action.textContent=button;ui.action.hidden=!button;action=callback;if(button)ui.action.focus();}
function resume(){state='running';held=false;buffer=0;ui.overlay.hidden=true;}
function start(){distance=0;elapsed=0;speed=360;y=FLOOR-SIZE;vy=0;angle=0;obstacles=[];nextSpawn=850;invincible=0;resume();hud();}
ui.action.addEventListener('click',()=>action?.());
function pause(){if(state!=='running')return;state='paused';modal('CIRCUIT / PAUSED','Catch your breath.','Your distance and speed are preserved.','Resume →',resume);}
function crash(){
 if(state!=='running')return;state='quiz';save();hud();
 let index=Math.floor(Math.random()*cpuQuestions.length);if(index===lastQuestion)index=(index+1)%cpuQuestions.length;lastQuestion=index;
 const q=cpuQuestions[index];
 modal('COLLISION / CPU CHECK',q.question,`Run saved at ${Math.floor(distance/10)} m. Correct: continue. Wrong: restart from zero.`,'',null);
 q.options.forEach((option,i)=>{const b=document.createElement('button');b.textContent=`${String.fromCharCode(65+i)}. ${option}`;b.addEventListener('click',()=>{
  if(state!=='quiz')return;const correct=i===q.correctAnswer;state=correct?'saved':'over';
  [...ui.answers.children].forEach((button,n)=>{button.disabled=true;if(n===q.correctAnswer)button.classList.add('correct');});if(!correct)b.classList.add('wrong');
  ui.eyebrow.textContent=correct?'CPU CHECK / PASSED':'CPU CHECK / FAILED';ui.feedback.textContent=(correct?'Correct! Run preserved. ':'Run ended. ')+q.explanation;
  ui.action.hidden=false;ui.action.textContent=correct?'Continue run →':'Restart from 0 m →';
  action=correct?()=>{obstacles=obstacles.filter(o=>o.x>X+speed*1.3);nextSpawn=Math.max(nextSpawn,distance+speed*1.6);y=FLOOR-SIZE;vy=0;angle=0;invincible=.8;resume();}:start;ui.action.focus();
 });ui.answers.append(b);});ui.answers.firstElementChild.focus();
}
function press(){if(state==='running'){held=true;buffer=.12;}}
window.addEventListener('keydown',e=>{if(['Space','ArrowUp','KeyW'].includes(e.code)){e.preventDefault();if(!e.repeat)press();}if(e.code==='KeyP'&&!e.repeat){if(state==='paused')resume();else pause();}});
window.addEventListener('keyup',e=>{if(['Space','ArrowUp','KeyW'].includes(e.code))held=false;});
canvas.addEventListener('pointerdown',e=>{e.preventDefault();canvas.setPointerCapture(e.pointerId);press();});canvas.addEventListener('pointerup',()=>held=false);canvas.addEventListener('pointercancel',()=>held=false);
window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
function spawn(){const block=Math.random()<.22,count=!block&&elapsed>18&&Math.random()>.55?2:1;for(let i=0;i<count;i++)obstacles.push({x:W+60+i*40,w:block?48:38,h:block?54:46,block});nextSpawn=distance+speed*(1.25+Math.random()*.65)+count*40;}
function collision(o){const left=X+6,right=X+SIZE-6,top=y+5,bottom=y+SIZE-3;if(right<=o.x||left>=o.x+o.w||bottom<=FLOOR-o.h||top>=FLOOR)return false;if(o.block)return true;const inset=Math.max(0,FLOOR-bottom)/o.h*o.w/2;return right>o.x+inset+3&&left<o.x+o.w-inset-3;}
function step(dt){if(state!=='running')return;elapsed+=dt;speed=360+260*(1-Math.exp(-elapsed/100));distance+=speed*dt;invincible=Math.max(0,invincible-dt);buffer=Math.max(0,buffer-dt);
 if(y>=FLOOR-SIZE&&(held||buffer>0)){vy=-830;buffer=0;}vy+=2400*dt;y+=vy*dt;
 if(y>=FLOOR-SIZE){y=FLOOR-SIZE;vy=0;angle=Math.round(angle/(Math.PI/2))*Math.PI/2;}else angle+=Math.PI*2*dt/.7;
 if(distance>=nextSpawn)spawn();for(const o of obstacles)o.x-=speed*dt;obstacles=obstacles.filter(o=>o.x+o.w>-30);if(!invincible&&obstacles.some(collision))crash();hud();
}
function draw(){
 const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0b1534');bg.addColorStop(1,'#153e56');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);ctx.lineWidth=1;ctx.strokeStyle='#31557744';
 for(let x=-(distance*.22%80);x<W;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let yy=10;yy<H;yy+=80){ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(W,yy);ctx.stroke();}
 // Repeating motherboard panels scroll behind the playfield at a slower speed.
 const boardOffset=distance*.18%640;
 for(let tile=-1;tile<3;tile++){
  const bx=tile*640-boardOffset;
  ctx.save();ctx.translate(bx,0);
  // Parallel copper traces with characteristic 45-degree bends and solder pads.
  for(let lane=0;lane<9;lane++){
   const yy=128+lane*43, bend=70+(lane%3)*32;
   ctx.strokeStyle=lane%3===0?'#43cfbb44':'#39749255';ctx.lineWidth=2;
   ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(bend,yy);ctx.lineTo(bend+30,yy-30);ctx.lineTo(410,yy-30);ctx.lineTo(450,yy+10);ctx.lineTo(640,yy+10);ctx.stroke();
   ctx.beginPath();ctx.arc(bend,yy,4,0,Math.PI*2);ctx.stroke();
   ctx.beginPath();ctx.arc(475,yy+10,4,0,Math.PI*2);ctx.stroke();
   // Small signals follow the actual trace path and freeze with the run.
   const points=[[0,yy],[bend,yy],[bend+30,yy-30],[410,yy-30],[450,yy+10],[640,yy+10]];
   let travel=(distance*.35+lane*79)%700;
   for(let j=1;j<points.length;j++){
    const [ax,ay]=points[j-1],[ex,ey]=points[j],length=Math.hypot(ex-ax,ey-ay);
    if(travel<=length){ctx.fillStyle='#65ffe299';ctx.beginPath();ctx.arc(ax+(ex-ax)*travel/length,ay+(ey-ay)*travel/length,2.5,0,Math.PI*2);ctx.fill();break;}travel-=length;
   }
  }
  // Processor socket and metallic pins.
  ctx.fillStyle='#11283e';ctx.strokeStyle='#35647b';ctx.lineWidth=2;ctx.fillRect(165,194,182,170);ctx.strokeRect(165,194,182,170);
  ctx.fillStyle='#5b8a9d';
  for(let pin=0;pin<10;pin++){const p=pin*14;ctx.fillRect(181+p,184,5,10);ctx.fillRect(181+p,364,5,10);ctx.fillRect(155,208+p,10,5);ctx.fillRect(347,208+p,10,5);}
  ctx.fillStyle='#0b1a2d';ctx.fillRect(180,209,152,140);ctx.strokeStyle='#55c7bb66';ctx.strokeRect(190,219,132,120);
  ctx.textAlign='center';ctx.font='bold 26px monospace';ctx.fillStyle='#77c8ca88';ctx.fillText('CPU',256,277);ctx.font='11px monospace';ctx.fillStyle='#618ca7';ctx.fillText('CSC / 3501',256,302);
  // RAM bank, contacts, and cylindrical capacitors.
  ctx.fillStyle='#173c47';ctx.fillRect(405,170,161,58);ctx.strokeStyle='#367380';ctx.strokeRect(405,170,161,58);
  for(let chip=0;chip<4;chip++){ctx.fillStyle='#0c2032';ctx.fillRect(415+chip*37,180,28,32);}
  ctx.fillStyle='#9d986955';for(let pin=0;pin<19;pin++)ctx.fillRect(410+pin*8,229,4,8);
  ctx.font='10px monospace';ctx.fillStyle='#77aeb7';ctx.fillText('MEMORY / DDR',485,160);
  for(let cap=0;cap<3;cap++){const cx=430+cap*44;ctx.fillStyle='#122c42';ctx.fillRect(cx-12,390,24,35);ctx.fillStyle='#45667e';ctx.beginPath();ctx.ellipse(cx,390,12,6,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#8ba0ac';ctx.beginPath();ctx.moveTo(cx-6,390);ctx.lineTo(cx+6,390);ctx.stroke();}
  // Board screws and status LEDs.
  for(const sy of [115,480]){ctx.strokeStyle='#50728766';ctx.beginPath();ctx.arc(30,sy,7,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(26,sy);ctx.lineTo(34,sy);ctx.stroke();}
  ctx.fillStyle='#64ffe288';ctx.fillRect(575,295,5,5);ctx.fillStyle='#70a7ff88';ctx.fillRect(575,309,5,5);
  ctx.restore();
 }
 ctx.fillStyle='#091629';ctx.fillRect(0,FLOOR,W,H-FLOOR);ctx.shadowColor='#64ffe2';ctx.shadowBlur=16;ctx.fillStyle='#64ffe2';ctx.fillRect(0,FLOOR,W,3);ctx.shadowBlur=0;ctx.strokeStyle='#204052';for(let x=-(distance%64);x<W;x+=64)ctx.strokeRect(x,FLOOR+22,52,52);
 for(const o of obstacles){ctx.shadowColor='#ff517b';ctx.shadowBlur=14;ctx.fillStyle='#632a59';ctx.strokeStyle='#ff7595';ctx.lineWidth=3;ctx.beginPath();if(o.block)ctx.rect(o.x,FLOOR-o.h,o.w,o.h);else{ctx.moveTo(o.x,FLOOR);ctx.lineTo(o.x+o.w/2,FLOOR-o.h);ctx.lineTo(o.x+o.w,FLOOR);ctx.closePath();}ctx.fill();ctx.stroke();ctx.shadowBlur=0;}
 // A circuit-board bug, drawn inside the original player footprint.
 ctx.save();ctx.translate(X+SIZE/2,y+SIZE/2);ctx.rotate(angle);ctx.globalAlpha=invincible>0?.55+.45*Math.sin(invincible*30)**2:1;
 ctx.strokeStyle='#64ffe2';ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';
 // Six bent legs, with a small running motion while grounded.
 const stride=vy===0&&state==='running'?Math.sin(distance*.09)*2:0;
 for(const side of [-1,1])for(let i=0;i<3;i++){
  const yy=-7+i*10;ctx.beginPath();ctx.moveTo(side*10,yy);ctx.lineTo(side*17,yy-3+stride*(i%2?1:-1));ctx.lineTo(side*20,yy+3);ctx.stroke();
 }
 // Antennae and bright terminal tips.
 for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*6,-12);ctx.lineTo(side*12,-20);ctx.stroke();ctx.fillStyle='#effffb';ctx.beginPath();ctx.arc(side*12,-20,2,0,Math.PI*2);ctx.fill();}
 ctx.shadowColor='#63ffe1';ctx.shadowBlur=16;ctx.fillStyle='#64ffe2';ctx.beginPath();ctx.ellipse(0,4,13,16,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
 ctx.strokeStyle='#cafff2';ctx.lineWidth=1.5;ctx.stroke();
 // Wing seam and chip traces give the beetle a computer-bug look.
 ctx.strokeStyle='#147263';ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(0,18);ctx.stroke();
 for(const side of [-1,1])for(const yy of [2,10]){ctx.beginPath();ctx.moveTo(side*3,yy);ctx.lineTo(side*8,yy);ctx.lineTo(side*9,yy-3);ctx.stroke();}
 ctx.fillStyle='#153a50';ctx.beginPath();ctx.ellipse(0,-10,11,8,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#64ffe2';ctx.stroke();
 ctx.fillStyle='#effffb';for(const side of [-1,1]){ctx.beginPath();ctx.arc(side*4,-12,2.5,0,Math.PI*2);ctx.fill();}
 ctx.restore();
}
function frame(time){const dt=previous?Math.min((time-previous)/1000,.1):0;previous=time;accumulator+=dt;while(accumulator>=STEP){step(STEP);accumulator-=STEP;}draw();requestAnimationFrame(frame);}
hud();requestAnimationFrame(frame);
})();
