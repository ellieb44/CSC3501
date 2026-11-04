/* Phaser owns the scene, renderer, and game loop; simulation remains fixed at 120 Hz. */
(() => {
'use strict';
const canvas=document.getElementById('game');
// Keep the procedural artwork pixel-for-pixel in a Phaser canvas texture.
const artwork=document.createElement('canvas'),ctx=artwork.getContext('2d');
const ui=Object.fromEntries(['overlay','eyebrow','title','description','answers','feedback','action','score','best','speed','hearts','hud','home','stage','controls','start'].map(id=>[id,document.getElementById(id)]));
const skipButton=document.getElementById('skip-question');
let skipAction=null;
function hideSkip(){skipAction=null;skipButton.hidden=true;}
function offerSkip(callback){
 skipAction=callback;skipButton.hidden=false;skipButton.disabled=window.cpuReview.getCoins()<1;
 skipButton.textContent=`Skip question (1 coin / ${window.cpuReview.getCoins()} available)`;
}
skipButton.addEventListener('click',()=>{
 if(!skipAction||!['quiz','boss-question'].includes(state))return;
 if(!window.cpuReview.spendCoin())return;
 const callback=skipAction;hideSkip();callback();
});
function selectMapTab(review){
 window.cpuMap.stop();held=false;buffer=0;state=review?'practice':'map';
 document.getElementById('map-panel').hidden=review;document.getElementById('review-panel').hidden=!review;
 for(const [id,selected] of [['map-tab',!review],['review-tab',review]]){
  const tab=document.getElementById(id);tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;
 }
 if(review)window.cpuReview.open();else window.cpuReview.close();
}
document.getElementById('map-tab').addEventListener('click',()=>selectMapTab(false));
document.getElementById('review-tab').addEventListener('click',()=>selectMapTab(true));
for(const id of ['map-tab','review-tab'])document.getElementById(id).addEventListener('keydown',event=>{
 if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.code))return;
 event.preventDefault();event.stopPropagation();
 const review=event.code==='End'||(!['Home'].includes(event.code)&&id==='map-tab');
 selectMapTab(review);document.getElementById(review?'review-tab':'map-tab').focus();
});
const W=1280,H=720,FLOOR=570,SIZE=42,X=220,STEP=1/120;
artwork.width=W;artwork.height=H;
let state='ready',distance=0,elapsed=0,speed=360,best=0,y=FLOOR-SIZE,vy=0,angle=0,held=false,buffer=0,obstacles=[],nextSpawn=850,invincible=0,lastQuestion=-1,accumulator=0,previous=0,action=start;
let unlocked=0,storyTime=0,storyPage=0,introEntry=0;
const questionBags=new Map();
function nextQuestion(){
 let bag=questionBags.get(stageIndex);
 if(!bag?.length){
  bag=[...stageData().ids];
  for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}
  if(bag.length>1&&bag[bag.length-1]===lastQuestion)[bag[0],bag[bag.length-1]]=[bag[bag.length-1],bag[0]];
  questionBags.set(stageIndex,bag);
 }
 lastQuestion=bag.pop();return lastQuestion;
}
function applyLevelColor(){ui.stage.style.setProperty?.('--level-color',stageData().color);}
// Each successive level adds thirty seconds of active running.
const stageDuration=index=>60+index*30;
// Distinct tiers: faster runs, shorter rests, and more demanding terrain.
const difficulty=[
 {speed:.92,rest:1.55,gap:.16,mounted:.15,popup:.15,sections:2,sky:1},
 {speed:1.02,rest:1.43,gap:.175,mounted:.25,popup:.22,sections:3,sky:1},
 {speed:1.12,rest:1.31,gap:.19,mounted:.35,popup:.29,sections:4,sky:1},
 {speed:1.22,rest:1.19,gap:.205,mounted:.45,popup:.36,sections:5,sky:2},
 {speed:1.32,rest:1.07,gap:.22,mounted:.55,popup:.43,sections:6,sky:2},
 {speed:1.42,rest:.95,gap:.235,mounted:.65,popup:.50,sections:7,sky:3}
];
const runDistance=(index,seconds)=>(620*seconds-26000*(1-Math.exp(-seconds/100)))*difficulty[index].speed;
const stageLength=index=>runDistance(index,stageDuration(index));
const stageStart=index=>Array.from({length:index},(_,i)=>stageLength(i)).reduce((sum,length)=>sum+length,0);
let stageIndex=0,gateAt=stageLength(0),gate=false,recovery=false,correctCount=0,attempts=0;
const stageData=()=>cpuStages[stageIndex];
function blendColor(a,b,amount){
 const channels=[1,3,5].map(offset=>Math.round(parseInt(a.slice(offset,offset+2),16)*(1-amount)+parseInt(b.slice(offset,offset+2),16)*amount));
 return '#'+channels.map(value=>value.toString(16).padStart(2,'0')).join('');
}
const bugLooks=[
 ['..r....r..','r.rrrrrr.r','.rrarrarr.','rrwrrwrr.r','.rrrrrrrr.','r.rrrrrr.r','..r.rr.r..','.r......r.'],
 ['.r......r.','..rrrrrr..','.rraaaarr.','rrwrrwrrrr','.rraaaarr.','r.rrrrrr.r','.r..rr..r.','r........r'],
 ['..rr..rr..','.rrrrrrrr.','r.raaaarr.','rrwrrwrrrr','.rraaaar..','rr.rrrr.rr','..rr..rr..','.r......r.'],
 ['r........r','.rr....rr.','..rrrrrr..','.rwrrwrrr.','rrrarrarrr','.rrrrrrrr.','r..rrrr..r','..r....r..'],
 ['...r..r...','..rrrrrr..','.rraaaarr.','rrwrrwrrrr','rraaaaaarr','.rrrrrrrr.','rr.r..r.rr','..r....r..'],
 ['r.r....r.r','.rrrrrrrr.','rrraaaarr.','rrwrrwrrrr','.rraaaarr.','rr.rrrr.rr','.rr.rr.rr.','r..r..r..r']
];
let platforms=[],gaps=[],grounded=true,spawnCount=0;
const MAX_REVIVES=3;
let revives=MAX_REVIVES;
const boss={active:false,hp:0,maxHp:0,questions:[],hitTime:0,deathTime:0};
const bossStatus=document.getElementById('boss-status'),bossHealth=document.getElementById('boss-health'),bossHp=document.getElementById('boss-hp');
function resetBoss(){boss.active=false;boss.hitTime=0;boss.deathTime=0;bossStatus.hidden=true;ui.stage.classList.remove('boss-mode');}
function updateBossHealth(){bossHealth.max=boss.maxHp;bossHealth.value=boss.hp;bossHp.textContent=`BUG: ${boss.hp} / ${boss.maxHp} HP`;}
function beginBoss(){
 obstacles=[];platforms=[];gaps=[];pickups=[];y=FLOOR-SIZE;vy=0;grounded=true;held=false;buffer=0;
 invincible=0;ui.controls.hidden=true;boss.active=true;boss.hp=boss.maxHp=stageIndex+3;boss.hitTime=0;boss.deathTime=0;
 boss.questions=cpuBossQuestions.filter(q=>q.stage===stageIndex).slice();
 for(let i=boss.questions.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[boss.questions[i],boss.questions[j]]=[boss.questions[j],boss.questions[i]];}
 bossStatus.hidden=false;ui.stage.classList.add('boss-mode');updateBossHealth();state='boss-intro';
 modal('BOSS / LEVEL '+(stageIndex+1),'Turn and face the bug!',`The exit is blocked. Defeat the ${stageData().name} bug with ${boss.maxHp} correct answers. Each correct answer deals 1 damage. Wrong answers cost a revive; with none left, the bug wins.`,'Fight the bug',askBossQuestion);
 window.cpuAudio?.effect('arrival');hud();
}
function askBossQuestion(){
 if(!boss.active||boss.hp<=0)return;
 if(!boss.questions.length)boss.questions=cpuBossQuestions.filter(q=>q.stage===stageIndex).slice().reverse();
 const q=boss.questions.pop();state='boss-question';
 modal('BOSS / '+stageData().name,q.question,`Boss challenge ${stageIndex+1} / 6. Answer correctly to damage the bug.`,'',null);
 q.options.forEach((option,i)=>{
  const button=document.createElement('button');button.textContent=String.fromCharCode(65+i)+'. '+option;
  button.addEventListener('click',()=>resolveBossQuestion(q,i,button));ui.answers.append(button);
 });ui.answers.firstElementChild.focus();
 offerSkip(()=>resolveBossQuestion(q,q.correctAnswer,null,true));
}
function resolveBossQuestion(q,index,button,skipped=false){
 if(state!=='boss-question')return;hideSkip();
 const correct=index===q.correctAnswer;
 if(!skipped)attempts++;
 if(correct){if(!skipped)correctCount++;boss.hp--;boss.hitTime=.6;}
 const lost=!correct&&revives===0;
 if(!correct&&!lost)revives--;
 state=lost?'boss-over':boss.hp===0?'boss-defeated':'boss-result';
 [...ui.answers.children].forEach((b,n)=>{b.disabled=true;if(n===q.correctAnswer)b.classList.add('correct');});
 if(!correct)button.classList.add('wrong');
 const message=skipped?'Coin spent. Question skipped; the bug loses 1 HP. ':correct?(boss.hp===0?'The bug is defeated! ':'Hit! The bug loses 1 HP. '):lost?'The bug wins. ':'The bug strikes! You lose a revive. ';
 window.cpuDialogue.write(ui.feedback,message+q.explanation);
 ui.action.hidden=false;ui.action.textContent=lost?'Retry this level':boss.hp===0?'Finish level':'Next attack';
 action=lost?()=>enterLevel(stageIndex):boss.hp===0?completeGate:askBossQuestion;
 updateBossHealth();hud();ui.action.focus();window.cpuAudio?.effect(boss.hp===0?'splat':correct?'correct':'wrong');
}

let pickups=[],heartNumber=1;
const heartDistance=n=>500*n+100*(n-1);
function updatePickups(){
 // Distance uses ten world pixels per displayed meter. Preview each pickup
 // ahead of time so it reaches the player at its scheduled meter mark.
 while(X+SIZE/2+heartDistance(heartNumber)*10-distance<=W+30){
  if(revives<MAX_REVIVES)pickups.push({at:heartDistance(heartNumber),x:0,y:0});
  heartNumber++;
 }
 if(revives===MAX_REVIVES)pickups=[];
 for(const heart of pickups){
  heart.x=X+SIZE/2+heart.at*10-distance;
  let surface=FLOOR;
  for(const p of platforms)if(heart.x>=p.x&&heart.x<=p.x+p.w)surface=Math.min(surface,FLOOR-p.h);
  heart.y=surface-52;
  const touches=heart.x+16>X&&heart.x-16<X+SIZE&&heart.y+16>y&&heart.y-16<y+SIZE;
  if(touches){revives=Math.min(MAX_REVIVES,revives+1);heart.collected=true;}
 }
 pickups=pickups.filter(heart=>!heart.collected&&heart.x>-30);
}
const hearts=Array.from({length:MAX_REVIVES},()=>{const heart=document.createElement('span');ui.hearts.append(heart);return heart;});
function showHearts(){hearts.forEach((heart,i)=>{heart.textContent=i<revives?'♥':'💔';heart.className=i<revives?'heart':'heart lost';});ui.hearts.ariaLabel=`${revives} of ${MAX_REVIVES} revives remaining`;}
try{best=Number(localStorage.getItem('cpuEscapeBest'))||0;}catch{}
function hud(){document.getElementById('chapter').textContent=`${String(stageIndex+1).padStart(2,'0')} / ${stageData().name} / ${Math.min(100,Math.floor(elapsed/stageDuration(stageIndex)*100))}%`;ui.score.textContent=Math.floor(distance/10);ui.best.textContent=`BEST ${best} m`;ui.speed.textContent=boss.active?'BOSS FIGHT':`${(speed/360).toFixed(2)}× SPEED`;showHearts();}
function save(){best=Math.max(best,Math.floor(distance/10));try{localStorage.setItem('cpuEscapeBest',String(best));}catch{}}
function modal(label,title,description,button,callback){hideSkip();held=false;buffer=0;ui.overlay.hidden=false;ui.eyebrow.textContent=label;ui.title.textContent=title;window.cpuDialogue.clear();window.cpuDialogue.write(ui.description,description);ui.answers.replaceChildren();ui.feedback.textContent='';ui.action.textContent=button;ui.action.hidden=!button;action=callback;if(button)ui.action.focus();}
function resume(){applyLevelColor();window.cpuDialogue.clear();ui.controls.hidden=false;ui.hud.hidden=false;state='running';held=false;buffer=0;ui.overlay.hidden=true;}
function start(){resetBoss();window.cpuAudio?.setScene(0);document.getElementById('level-toolbar').hidden=false;document.getElementById('world-map').hidden=true;ui.stage.classList.remove('story-mode');stageIndex=0;gateAt=stageLength(0);gate=false;recovery=false;correctCount=0;attempts=0;ui.home.hidden=true;ui.stage.hidden=false;ui.controls.hidden=false;ui.hud.hidden=false;revives=MAX_REVIVES;pickups=[];heartNumber=1;distance=0;elapsed=0;speed=360*.92;y=FLOOR-SIZE;vy=0;angle=0;obstacles=[];platforms=[];gaps=[];grounded=true;spawnCount=0;nextSpawn=850;invincible=0;resume();hud();canvas.focus();}
ui.action.addEventListener('click',()=>{ui.overlay.style.opacity='1';action?.();});
function lesson(){applyLevelColor();document.getElementById('level-location').textContent='LEVEL '+(stageIndex+1)+' / '+stageData().name;state='lesson';modal('SECTOR '+(stageIndex+1)+' / '+stageData().name,stageData().name,stageData().lesson,'Run this sector',resume);}
const story=[['Welcome to CPU Escape.','Just a boy, his bedroom, and one more night at the computer.'],['Something is wrong.','The screen hums. The computer shakes. Then he starts shaking, too.'],['POOF!','A strange force pulls him toward the screen... and the boy disappears.'],['OH NO!','You are trapped inside the computer! And something is coming for you.'],['Find your way home.','Outrun the bug. Cross each computer component. Reach every exit to escape alive.']];
function storyCard(){if(storyPage===1)window.cpuAudio?.effect('stuck');if(storyPage===2)window.cpuAudio?.effect('portal');if(storyPage===3)window.cpuAudio?.effect('arrival');const card=story[storyPage];modal('CPU ESCAPE / PROLOGUE',card[0],card[1],'Skip story / Walk to map',walkToMap);}
function intro(){introEntry=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?0:1.2;const curtain=document.getElementById('scene-curtain');curtain.hidden=!introEntry;curtain.style.opacity='0';window.cpuAudio?.setScene('home');document.getElementById('level-toolbar').hidden=true;window.cpuAudio?.start();ui.home.hidden=true;ui.stage.hidden=false;ui.hud.hidden=true;ui.controls.hidden=true;ui.stage.classList.add('story-mode');state='intro';storyPage=0;storyTime=0;storyCard();if(introEntry>0){ui.home.hidden=false;ui.stage.hidden=true;}}
function storyStep(dt){if(introEntry>0){introEntry=Math.max(0,introEntry-dt);const t=1.2-introEntry,curtain=document.getElementById('scene-curtain');const p=Math.min(1,t<.6?t/.6:introEntry/.6);curtain.style.opacity=String(p*p*(3-2*p));if(t>=.6){ui.home.hidden=true;ui.stage.hidden=false;}if(introEntry===0)curtain.hidden=true;return;}storyTime+=dt;const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;const opacity=reduced?1:Math.min(1,storyTime/.85,(5.8-storyTime)/.85);ui.overlay.style.opacity=String(Math.max(0,opacity));if(storyTime>=5.8){storyPage++;storyTime=0;if(storyPage>=story.length)walkToMap();else storyCard();}}
let transitionTime=0;
function walkToMap(){introEntry=0;document.getElementById('scene-curtain').hidden=true;ui.home.hidden=true;ui.stage.hidden=false;state='map-transition';transitionTime=0;held=false;ui.overlay.hidden=false;ui.action.hidden=true;ui.title.textContent='Follow the signal.';window.cpuDialogue.clear();window.cpuDialogue.write(ui.description,'The boy steps onto a path through the computer.');ui.overlay.style.opacity='1';if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)showMap(true);}
function showMap(arrival=false){resetBoss();window.cpuDialogue.clear();window.cpuAudio?.setScene('map');document.getElementById('level-toolbar').hidden=true;state='map';selectMapTab(false);held=false;buffer=0;ui.overlay.style.opacity='1';ui.stage.classList.remove('story-mode');ui.stage.hidden=true;ui.hud.hidden=true;ui.controls.hidden=true;ui.home.hidden=true;document.getElementById('world-map').hidden=false;window.cpuMap.show({unlocked,current:stageIndex,arrival,onEnter:enterLevel});}
function enterLevel(index){if(index>unlocked)return;start();stageIndex=index;speed=360*difficulty[index].speed;window.cpuAudio?.setScene(index);distance=stageStart(index);gateAt=distance+stageLength(index);nextSpawn=distance+850;heartNumber=1;while(heartDistance(heartNumber)*10<distance)heartNumber++;lesson();ui.hud.hidden=true;hud();}
ui.start.addEventListener('click',()=>intro());
ui.hud.hidden=true;ui.stage.hidden=true;ui.controls.hidden=true;
// A separate dialog preserves the exact quiz, lesson, or pause screen underneath.
const leaveDialog=document.getElementById('leave-confirm'),stayButton=document.getElementById('stay-level');
let previousLevelState;
function requestMap(){if(['ready','intro','map','confirm-leave'].includes(state))return;previousLevelState=state;state='confirm-leave';held=false;buffer=0;leaveDialog.hidden=false;ui.stage.inert=true;document.getElementById('back-map').disabled=true;stayButton.focus();}
function cancelMap(){if(state!=='confirm-leave')return;state=previousLevelState;leaveDialog.hidden=true;ui.stage.inert=false;document.getElementById('back-map').disabled=false;document.getElementById('back-map').focus();}
document.getElementById('back-map').addEventListener('click',requestMap);
stayButton.addEventListener('click',cancelMap);
document.getElementById('leave-level').addEventListener('click',()=>{if(state!=='confirm-leave')return;leaveDialog.hidden=true;ui.stage.inert=false;document.getElementById('back-map').disabled=false;showMap();});
leaveDialog.addEventListener('keydown',e=>{if(e.code==='Escape'){e.preventDefault();cancelMap();}if(e.code==='Tab'){e.preventDefault();(document.activeElement===stayButton?document.getElementById('leave-level'):stayButton).focus();}});
function pause(){if(state==='map'){window.cpuMap.stop();return;}if(state!=='running')return;state='paused';modal('CIRCUIT / PAUSED','Catch your breath.','Your distance and speed are preserved.','Resume →',resume);}
function clearRunway(){obstacles=[];platforms=[];gaps=[];grounded=true;nextSpawn=distance+speed*2;y=FLOOR-SIZE;vy=0;invincible=1.5;resume();}
function completeGate(){resetBoss();window.cpuAudio?.effect('clear');save();unlocked=Math.max(unlocked,stageIndex+1);gate=false;state='cleared';if(unlocked>=cpuStages.length&&stageIndex===cpuStages.length-1){state='won';modal('COMPUTER / ESCAPE SUCCESSFUL','The boy is finally home.',`All ${cpuStages.length} routes cleared. You outran the bug and learned how the computer works. First-answer accuracy this run: ${correctCount}/${attempts}.`,'Return to map',showMap);return;}modal('LEVEL / CLEARED',stageData().name+' complete!',cpuStages[stageIndex+1].name+' is now unlocked. The bug is still out there. Choose your next stop on the map.','Return to map',showMap);}
function askQuestion(isRecovery=false){
 state='quiz';recovery=isRecovery;const q=cpuQuestions[nextQuestion()];
 modal((gate?'SECTOR GATE':'BUG ENCOUNTER')+(isRecovery?' / RECOVERY':' / CPU CHECK'),q.question,isRecovery?'One more chance. Use the explanation you just learned.':gate?'Prove what you learned to open the next sector.':'The bug caught you. Answer to escape. A wrong answer gives you an explanation and one recovery question.','',null);
 q.options.forEach((option,i)=>{const button=document.createElement('button');button.textContent=String.fromCharCode(65+i)+'. '+option;button.addEventListener('click',()=>{
 if(state!=='quiz')return;hideSkip();const correct=i===q.correctAnswer;if(!isRecovery){attempts++;if(correct)correctCount++;}state=correct?'saved':isRecovery?'over':'review';
 [...ui.answers.children].forEach((b,n)=>{b.disabled=true;if(n===q.correctAnswer)b.classList.add('correct');});if(!correct)button.classList.add('wrong');
 ui.eyebrow.textContent=correct?'SIGNAL RESTORED':isRecovery?'SIGNAL LOST':'LEARN / TRY AGAIN';window.cpuDialogue.write(ui.feedback,(correct?'Correct. ':isRecovery?'Run ended. ':'Study this: ')+q.explanation);
 ui.action.hidden=false;ui.action.textContent=correct?(gate?'Open gate':'Escape the bug'):isRecovery?'Retry this level':'Try recovery question';action=correct?(gate?completeGate:clearRunway):isRecovery?()=>enterLevel(stageIndex):()=>askQuestion(true);ui.action.focus();window.cpuAudio?.effect(correct?'correct':'wrong');
 });ui.answers.append(button);});ui.answers.firstElementChild.focus();
 offerSkip(()=>{if(gate)completeGate();else clearRunway();});
}
function crash(){if(state!=='running')return;window.cpuAudio?.effect('stuck');save();if(revives===0){state='over';hud();modal('SYSTEM / GAME OVER','No revives left.',`The bug caught your signal at ${Math.floor(distance/10)} m.`,'Retry this level',()=>enterLevel(stageIndex));return;}revives--;gate=false;hud();askQuestion();}
function press(){if(state==='running'){if(!held)window.cpuAudio?.effect('jump');held=true;buffer=.12;}}
window.addEventListener('keydown',e=>{if(e.target?.getAttribute?.('role')==='tab')return;if(e.code==='Space'&&((boss.active&&state!=='confirm-leave')||['quiz','saved','review','over'].includes(state))){e.preventDefault();return;}if(state==='map'){if(e.target?.tagName==='BUTTON'&&['Enter','Space'].includes(e.code))return;window.cpuMap.key(e,true);return;}if(['Space','ArrowUp','KeyW'].includes(e.code)&&state==='running'){e.preventDefault();if(!e.repeat)press();}if(e.code==='KeyP'&&!e.repeat){if(state==='paused')resume();else pause();}});
window.addEventListener('keyup',e=>{if(e.code==='Space'&&((boss.active&&state!=='confirm-leave')||['quiz','saved','review','over'].includes(state)))e.preventDefault();if(state==='map'){window.cpuMap.key(e,false);return;}if(['Space','ArrowUp','KeyW'].includes(e.code))held=false;});
canvas.addEventListener('pointerdown',e=>{e.preventDefault();canvas.setPointerCapture(e.pointerId);press();});canvas.addEventListener('pointerup',()=>held=false);canvas.addEventListener('pointercancel',()=>held=false);
window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
function spawn(){
 spawnCount++;
 const tier=difficulty[stageIndex];
 if(spawnCount%5===0){
  const begin=W+60,ramp=Math.round(speed*.6),deck=Math.round(speed*(.85-stageIndex*.035));
  const breakWidth=Math.round(speed*(.23+Math.min(stageIndex,3)*.02));
  const sections=tier.sections;
  let cursor=begin;
  const addRamp=(x,descending)=>{
   const count=40,width=ramp/count;
   for(let i=0;i<count;i++){
    const t=(i+.5)/count,smooth=t*t*(3-2*t);
    platforms.push({x:x+i*width,w:width+.5,h:48*(descending?1-smooth:smooth),thickness:18,wire:true,ramp:true});
   }
  };
  addRamp(cursor,false);cursor+=ramp;
  const gapStart=cursor;
  for(let i=0;i<sections;i++){
   platforms.push({x:cursor,w:deck,h:48,thickness:18,wire:true,
    copperLeft:i>0,copperRight:i<sections-1});
   cursor+=deck+(i<sections-1?breakWidth:0);
  }
  gaps.push({x:gapStart,w:cursor-gapStart});
  addRamp(cursor,true);cursor+=ramp;
  nextSpawn=distance+cursor-begin+speed*(tier.rest+.45);
  return;
 }
 if(spawnCount%4===0){
  for(let i=0;i<tier.sky;i++)obstacles.push({x:W+60+i*speed*.95,w:42,h:46,falling:true,base:-30,fallSpeed:0,dropping:false});
  nextSpawn=distance+speed*(tier.rest+1+(tier.sky-1)*.95);
  return;
 }
 if(spawnCount%3===0){
  // Curated height profiles add variety without random impossible jumps.
  const profiles=[[48,88,128,88,48],[56,96,136,176,136,96,56],[40,80,40,108,68]];
  const heights=profiles[Math.floor(Math.random()*profiles.length)].map(h=>Math.round(h*(1+stageIndex*.06))),begin=W+60;
  const gap=Math.round(speed*tier.gap);
  let cursor=begin;
  heights.forEach((height,i)=>{
   const hazard=i===heights.length-2&&Math.random()<tier.mounted;
   const width=hazard?Math.round(speed*.85+70):Math.round(speed*(.30-stageIndex*.015)+48+Math.random()*30);
   platforms.push({x:cursor,w:width,h:height,thickness:20});
   // Wider decks leave room to land, then jump over a mounted transistor.
   if(hazard)obstacles.push({x:cursor+width-90,w:32,h:40,base:FLOOR-height,block:true});
   cursor+=width+gap;
  });
  // Missing a floating step cannot be rescued by the floor beneath it.
  gaps.push({x:begin+platforms[platforms.length-heights.length].w,w:cursor-gap-begin-platforms[platforms.length-heights.length].w});
  nextSpawn=distance+(cursor-begin)+speed*(tier.rest+.25);
  return;
 }
 const popup=elapsed>12&&Math.random()<tier.popup;
 const block=popup||Math.random()<.22;
 const clustered=!block&&elapsed>8&&(spawnCount%7===2||Math.random()<.30+stageIndex*.04);
 const count=clustered?2+Math.floor(stageIndex/2):1;
 // Compact groups fit within one jump; a full recovery interval follows each group.
 for(let i=0;i<count;i++)obstacles.push({x:W+60+i*40,w:block?48:38,h:block?54:46,block,popup,rise:popup?0:1});
 nextSpawn=distance+speed*(tier.rest+Math.random()*.45)+count*40;
}
function fall(){crash();}
const obstacleHeight=o=>o.h*(o.popup?(o.rise??0):1);
function collision(o){if(obstacleHeight(o)<=0)return false;const base=o.base??FLOOR,left=X+6,right=X+SIZE-6,top=y+5,bottom=y+SIZE-3;if(right<=o.x||left>=o.x+o.w||bottom<=base-obstacleHeight(o)||top>=base)return false;return true;}
function step(dt){if(state!=='confirm-leave'&&introEntry<=0)window.cpuDialogue.update(dt);if(state==='map'){window.cpuMap.update(dt);return;}if(state==='practice')return;if(state==='map-transition'){transitionTime+=dt;ui.overlay.style.opacity=String(Math.max(0,1-transitionTime/1.7));if(transitionTime>=1.8)showMap(true);return;}if(state==='intro'){storyStep(dt);return;}if(boss.active){if(state!=='confirm-leave'){boss.hitTime=Math.max(0,boss.hitTime-dt);if(boss.hp===0)boss.deathTime+=dt;}return;}if(state!=='running')return;elapsed+=dt;speed=(360+260*(1-Math.exp(-elapsed/100)))*difficulty[stageIndex].speed;distance+=speed*dt;invincible=Math.max(0,invincible-dt);buffer=Math.max(0,buffer-dt);
 if(grounded&&(held||buffer>0)){vy=-830;buffer=0;grounded=false;}
 const wasGrounded=grounded;
 const previousBottom=y+SIZE;vy+=2400*dt;y+=vy*dt;
 if(elapsed+1e-8>=stageDuration(stageIndex)){elapsed=stageDuration(stageIndex);distance=gateAt;beginBoss();hud();return;}
 if(distance>=nextSpawn)spawn();
 for(const items of [obstacles,platforms,gaps]){for(const o of items)o.x-=speed*dt;}
 for(const o of obstacles)if(o.falling){
  if(o.x-(X+SIZE)<=speed*2)o.dropping=true;
  if(o.dropping){o.fallSpeed+=1200*dt;o.base=Math.min(FLOOR,o.base+o.fallSpeed*dt);}
 }
 for(const o of obstacles)if(o.popup&&o.x-(X+SIZE)<=speed*1.35)o.rise=Math.min(1,(o.rise??0)+dt/.25);
 obstacles=obstacles.filter(o=>o.x+o.w>-30);platforms=platforms.filter(o=>o.x+o.w>-30);gaps=gaps.filter(o=>o.x+o.w>-30);
 updatePickups();
 grounded=false;
 const left=X+6,right=X+SIZE-6;
 // Resolve the wire as one walkable surface, rather than colliding with
 // the sides of each thin strip that forms its curve.
 const wireSurfaces=platforms.filter(p=>p.wire&&right>p.x&&left<p.x+p.w);
 if(wireSurfaces.length){
  const top=Math.min(...wireSurfaces.map(p=>FLOOR-p.h));
  const walking=wasGrounded&&Math.abs(previousBottom-top)<=24;
  if(vy>=0&&(walking||(previousBottom<=top+.01&&y+SIZE>=top))){
   y=top-SIZE;vy=0;grounded=true;
  }
 }
 for(const p of platforms){
  if(p.wire)continue;
  if(right<=p.x||left>=p.x+p.w)continue;
  const top=FLOOR-p.h;
  if(vy>=0&&((previousBottom<=top+.01&&y+SIZE>=top)||(p.ramp&&wasGrounded&&Math.abs(previousBottom-top)<speed*dt+4))){y=top-SIZE;vy=0;grounded=true;}
  else if(y+SIZE>top+.01&&y<top+(p.thickness??p.h)&&!invincible){crash();hud();return;}
 }
 const overGap=gaps.some(g=>X+SIZE/2>g.x&&X+SIZE/2<g.x+g.w);
 if(!grounded&&!overGap&&previousBottom<=FLOOR+.01&&y+SIZE>=FLOOR&&vy>=0){y=FLOOR-SIZE;vy=0;grounded=true;}
 if(overGap&&y+SIZE>FLOOR+8||y>H){fall();return;}
 if(grounded)angle=Math.round(angle/(Math.PI/2))*Math.PI/2;else angle+=Math.PI*2*dt/.7;
 if(!invincible&&obstacles.some(collision))crash();hud();
}
function draw(){if(state==='practice')return;if(state==='map'){window.cpuMap.draw();return;}if(state==='map-transition'){window.cpuOpening?.draw(ctx,W,H,4,transitionTime,Math.min(1,transitionTime/1.8));return;}if(state==='ready')window.cpuOpening?.home(previous/1000);if(state==='intro'){if(introEntry>.6)window.cpuOpening?.home(previous/1000);window.cpuOpening?.draw(ctx,W,H,storyPage,storyTime);return;}
 const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#100d1c');bg.addColorStop(1,stageData().background);ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);ctx.lineWidth=1;ctx.strokeStyle=stageData().color+'25';
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
 ctx.fillStyle='#091629';ctx.fillRect(0,FLOOR,W,H-FLOOR);ctx.shadowColor=stageData().color;ctx.shadowBlur=16;ctx.fillStyle=stageData().color;ctx.fillRect(0,FLOOR,W,3);ctx.shadowBlur=0;ctx.strokeStyle='#204052';for(let x=-(distance%64);x<W;x+=64)ctx.strokeRect(x,FLOOR+22,52,52);
 // Dark breaks in the board mark lethal gaps between solid chip blocks.
 for(const g of gaps){ctx.fillStyle='#030611';ctx.fillRect(g.x,FLOOR,g.w,H-FLOOR);ctx.strokeStyle='#ff517b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(g.x,FLOOR+8);ctx.lineTo(g.x,H);ctx.moveTo(g.x+g.w,FLOOR+8);ctx.lineTo(g.x+g.w,H);ctx.stroke();}
 for(const p of platforms){
  const top=FLOOR-p.h,thickness=p.thickness??p.h;
  if(p.wire){
   // Thick insulation, a bright highlight, and exposed copper at the broken ends.
   ctx.fillStyle=blendColor(stageData().color,stageData().background,.8);ctx.fillRect(p.x,top-2,p.w,thickness+4);
   ctx.fillStyle=blendColor(stageData().color,stageData().background,.45);ctx.fillRect(p.x,top,p.w,thickness);
   ctx.fillStyle=stageData().color;ctx.fillRect(p.x,top+2,p.w,3);
   ctx.fillStyle=blendColor(stageData().color,stageData().background,.65);ctx.fillRect(p.x,top+thickness-4,p.w,4);
   ctx.strokeStyle=blendColor(stageData().color,'#ffe2ae',.5);ctx.lineWidth=2;
   const ends=p.ramp?[]:[...(p.copperLeft!==false?[p.x]:[]),...(p.copperRight!==false?[p.x+p.w]:[])];
   for(const end of ends)for(let strand=0;strand<3;strand++){
    const outward=end===p.x?-1:1;
    ctx.beginPath();ctx.moveTo(end,top+5+strand*4);ctx.lineTo(end+outward*9,top+3+strand*6);ctx.stroke();
   }
   continue;
  }
  ctx.shadowColor=stageData().color;ctx.shadowBlur=12;ctx.fillStyle='#183e59';ctx.fillRect(p.x,top,p.w,thickness);ctx.strokeStyle=stageData().color;ctx.lineWidth=2;ctx.strokeRect(p.x+1,top+1,p.w-2,thickness-2);ctx.shadowBlur=0;
  ctx.fillStyle=stageData().color;ctx.fillRect(p.x,top,p.w,3);ctx.strokeStyle='#396e94';for(let xx=p.x+12;xx<p.x+p.w-8;xx+=28)ctx.strokeRect(xx,top+7,16,Math.min(30,thickness-10));
  if(p.thickness){ctx.strokeStyle='#6fbaff55';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.x+p.w/2,top+thickness+5);ctx.lineTo(p.x+p.w/2,top+thickness+25);ctx.stroke();ctx.beginPath();ctx.arc(p.x+p.w/2,top+thickness+30,3,0,Math.PI*2);ctx.stroke();}
 }
 // Three-legged transistor packages fit inside the original obstacle footprints.
 for(const o of obstacles){
  if(o.falling&&o.base<FLOOR){
   ctx.fillStyle='#fff1bd';ctx.fillRect(o.x-8,FLOOR-4,o.w+16,4);
   ctx.font='bold 18px monospace';ctx.textAlign='center';ctx.fillText('?',o.x+o.w/2,FLOOR-22);
  }
  const height=obstacleHeight(o);
  if(o.popup&&height<o.h){
   ctx.fillStyle='#fff1bd';ctx.fillRect(o.x-4,FLOOR-3,o.w+8,3);
   ctx.font='bold 16px monospace';ctx.textAlign='center';ctx.fillText('!',o.x+o.w/2,FLOOR-14);
  }
  if(height<=0)continue;
  const top=(o.base??FLOOR)-height,bodyHeight=o.h*.64;
  ctx.save();ctx.beginPath();ctx.rect(o.x-4,(o.base??FLOOR)-o.h-4,o.w+8,o.h+4);ctx.clip();ctx.translate(o.x,top);
  // Metal emitter, base, and collector leads reach down to the board.
  ctx.strokeStyle='#c4b4c7';ctx.lineWidth=3;ctx.lineCap='round';
  for(const pin of [.22,.5,.78]){ctx.beginPath();ctx.moveTo(o.w*pin,bodyHeight-2);ctx.lineTo(o.w*pin,o.h-2);ctx.stroke();}
  ctx.shadowColor='#ff517b';ctx.shadowBlur=12;ctx.fillStyle='#302339';ctx.strokeStyle='#ff7595';ctx.lineWidth=2;
  // The sloped shoulders give the plastic casing a recognizable transistor shape.
  ctx.beginPath();ctx.moveTo(2,bodyHeight);ctx.lineTo(2,9);ctx.lineTo(9,1);ctx.lineTo(o.w-9,1);ctx.lineTo(o.w-2,9);ctx.lineTo(o.w-2,bodyHeight);ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;
  ctx.strokeStyle='#91627f';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(8,10);ctx.lineTo(o.w-8,10);ctx.stroke();
  ctx.textAlign='center';ctx.font='bold 9px monospace';ctx.fillStyle='#ffd3df';ctx.fillText('NPN',o.w/2,bodyHeight-5);
  ctx.restore();
 }
 // Collectible hearts scroll with the course, separate from the HUD hearts.
 for(const heart of pickups){
  ctx.save();ctx.translate(heart.x,heart.y);ctx.shadowColor='#ff6a91';ctx.shadowBlur=20;
  ctx.fillStyle='#ff6a91';ctx.strokeStyle='#ffe3ec';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(0,14);ctx.bezierCurveTo(-30,-3,-15,-24,0,-10);ctx.bezierCurveTo(15,-24,30,-3,0,14);ctx.fill();ctx.stroke();ctx.shadowBlur=0;
  ctx.fillStyle='#fff';ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.fillText('+1',0,-27);ctx.restore();
 }
 // The finish flag approaches at the exact level endpoint.
 const finishX=X+Math.max(0,stageLength(stageIndex)-runDistance(stageIndex,elapsed));
 if(finishX<W+80){ctx.fillStyle='#f6efde';ctx.fillRect(finishX,FLOOR-145,5,145);ctx.fillStyle=stageData().color;ctx.fillRect(finishX+5,FLOOR-145,65,38);ctx.fillStyle='#14111d';ctx.font='bold 12px monospace';ctx.textAlign='left';ctx.fillText('EXIT',finishX+16,FLOOR-120);}
 // Original pixel sprites: a small signal courier and the corruption chasing it.
 const tint=stageData().color;
 ctx.fillStyle=tint;ctx.globalAlpha=.12;ctx.font='bold 72px monospace';ctx.textAlign='center';ctx.fillText(stageData().name,W/2,110);ctx.globalAlpha=.5;ctx.font='14px monospace';ctx.fillText(stageData().landmark,W/2,144);ctx.globalAlpha=1;
 function sprite(rows,px,py,scale,palette){rows.forEach((row,yy)=>[...row].forEach((c,xx)=>{if(palette[c]){ctx.fillStyle=palette[c];ctx.fillRect(Math.round(px+xx*scale),Math.round(py+yy*scale),scale,scale);}}));}
 const bob=state==='running'?Math.floor(Math.sin(distance*.07)*2):0;
 const bugX=boss.active?W*.25+(boss.hitTime>0?Math.sin(boss.hitTime*30)*12:0):state==='quiz'?X-80:65+Math.sin(elapsed*2)*12;
 const bugScale=boss.active?12+stageIndex:7;
 const bugColor=blendColor(stageData().color,'#182a2b',.3);
 const bugPalette={r:boss.hitTime>0?'#fff1bd':bugColor,w:'#fff1d5',a:stageData().color};
 if(boss.active&&boss.hp===0){
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const t=reduced?1:Math.min(1,boss.deathTime/.4),center=bugX+bugScale*5;
  if(t<1){
   ctx.save();ctx.translate(center,FLOOR);ctx.scale(1+t*.7,Math.max(.08,1-t));
   sprite(bugLooks[stageIndex],-bugScale*5,-bugScale*8,bugScale,bugPalette);ctx.restore();
  }
  ctx.fillStyle=bugColor;ctx.beginPath();ctx.ellipse(center,FLOOR-5,bugScale*(5+2*t),4+7*t,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=stageData().color;ctx.fillRect(center-24,FLOOR-10,18,4);ctx.fillRect(center+16,FLOOR-8,12,3);
  if(!reduced&&boss.deathTime<.9){
   for(let i=0;i<12;i++){
    const age=boss.deathTime,vx=(i-5.5)*45,vy=-140-(i%3)*65;
    const dx=center+vx*age,dy=FLOOR-12+vy*age+360*age*age;
    if(dy<FLOOR)ctx.fillRect(dx,dy,5+i%3*2,5+i%3*2);
   }
  }
 }else{
  sprite(bugLooks[stageIndex],bugX,FLOOR-bugScale*8+bob,bugScale,bugPalette);
 }
 ctx.globalAlpha=invincible>0?.6:1;
 ctx.save();
 if(boss.active){ctx.translate(W*.73+SIZE,0);ctx.scale(-1,1);ctx.translate(-X,0);}
 sprite(['...hhhh...','..hhhhhh..','..hssssh..','...seses..','...ssss...','..cccccc..','.cccccccc.','..cccccc..','...cccc...','...l..l...'],X,y+bob,4,{h:'#ece3d0',s:'#e5b88f',e:'#191326',c:tint,l:'#9180ac'});ctx.globalAlpha=1;
 ctx.fillStyle='#ffe8c4';ctx.fillRect(X-10,y+22+bob,10,5);ctx.fillRect(X-20,y+25+bob,7,4);ctx.restore();
 if(boss.active&&boss.hp>0&&boss.hitTime>0){ctx.strokeStyle=stageData().color;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(W*.73,y+24);ctx.lineTo(bugX+bugScale*10,FLOOR-bugScale*4);ctx.stroke();}
 // Subtle scanlines unify the scene without obscuring hazards.
 ctx.fillStyle='#00000015';for(let sy=0;sy<H;sy+=4)ctx.fillRect(0,sy,W,1);

}
function advance(time){
 const dt=previous?Math.min((time-previous)/1000,.1):0;
 previous=time;accumulator+=dt;
 while(accumulator>=STEP){step(STEP);accumulator-=STEP;}
}
class CpuEscapeScene extends Phaser.Scene{
 constructor(){super({key:'CpuEscape'});}
 create(){
  this.textures.addCanvas('cpu-artwork',artwork);
  this.add.image(0,0,'cpu-artwork').setOrigin(0);
  draw();
 }
 update(time){advance(time);draw();}
}
hud();
// Start Phaser only after the accessible DOM controls have been initialized.
window.cpuGame=new Phaser.Game({
 type:Phaser.CANVAS,
 title:'Escape the CPU',
 canvas,
 width:W,height:H,
 transparent:true,
 pixelArt:true,
 autoFocus:false,
 banner:false,
 // The existing responsive CSS, keyboard focus rules, and pointer capture
 // preserve the original controls, including Space being blocked in quizzes.
 scale:{mode:Phaser.Scale.NONE,zoom:1},
 input:{keyboard:false,mouse:false,touch:false,gamepad:false},
 audio:{noAudio:true}, // The existing synthesized score and effects use Web Audio.
 scene:[CpuEscapeScene]
});
})();
