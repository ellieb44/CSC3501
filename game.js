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
const characterRows=['...hhhh...','..hhhhhh..','..hssssh..','...seses..','...ssss...','..cccccc..','.cccccccc.','..cccccc..','...cccc...','...l..l...'];
const characterStyles=[
 {id:'classic',name:'Classic courier',price:0,h:'#ece3d0',c:'#a8bbdb',l:'#9180ac'},
 {id:'mint',name:'Mint circuit',price:2,h:'#ece3d0',c:'#a8ffd5',l:'#39796b'},
 {id:'sunset',name:'Sunset runner',price:3,h:'#794552',c:'#ff9b71',l:'#803a64'},
 {id:'violet',name:'Violet hacker',price:4,h:'#d7b8ff',c:'#b274f5',l:'#61509b'},
 {id:'gold',name:'Golden signal',price:5,h:'#ffe6a1',c:'#ffd76e',l:'#a87835'}
];
let ownedStyles=new Set(['classic']),equippedStyle='classic';
try{
 const saved=JSON.parse(localStorage.getItem('cpuEscapeCharacter')||'null');
 if(Array.isArray(saved?.owned))for(const id of saved.owned)if(characterStyles.some(style=>style.id===id))ownedStyles.add(id);
 if(ownedStyles.has(saved?.equipped))equippedStyle=saved.equipped;
}catch{}
function characterPalette(){const style=characterStyles.find(style=>style.id===equippedStyle);return {h:style.h,s:'#e5b88f',e:'#191326',c:style.c,l:style.l};}
window.cpuCharacter={palette:characterPalette};
function renderShop(){
 const items=document.getElementById('shop-items');items.replaceChildren();
 document.getElementById('shop-coins').textContent=`Coins: ${window.cpuReview.getCoins()}`;
 characterStyles.forEach(style=>{
  const card=document.createElement('article');card.className='shop-card';
  const preview=document.createElement('canvas');preview.width=80;preview.height=80;preview.setAttribute('aria-label',style.name+' preview');preview.setAttribute('role','img');
  const paint=preview.getContext('2d'),palette={...characterPalette(),h:style.h,c:style.c,l:style.l};
  characterRows.forEach((row,y)=>[...row].forEach((pixel,x)=>{if(palette[pixel]){paint.fillStyle=palette[pixel];paint.fillRect(20+x*4,20+y*4,4,4);}}));
  const name=document.createElement('h3');name.textContent=style.name;
  const button=document.createElement('button');button.type='button';
  const owned=ownedStyles.has(style.id),equipped=style.id===equippedStyle;
  button.textContent=equipped?'Equipped':owned?'Equip':`Buy & equip (${style.price} coins)`;
  button.disabled=equipped||(!owned&&window.cpuReview.getCoins()<style.price);
  button.addEventListener('click',()=>{
   if(!ownedStyles.has(style.id)){
    if(!window.cpuReview.spendCoins(style.price))return;
    ownedStyles.add(style.id);
   }
   equippedStyle=style.id;
   try{localStorage.setItem('cpuEscapeCharacter',JSON.stringify({owned:[...ownedStyles],equipped:equippedStyle}));}catch{}
   document.getElementById('shop-feedback').textContent=style.name+' equipped.';
   renderShop();document.getElementById('shop-items').children[characterStyles.indexOf(style)].children[2].focus();
  });
  card.append(preview);card.append(name);card.append(button);items.append(card);
 });
}
const mapTabs=['map-tab','review-tab','free-play-tab','shop-tab'];
function selectMapTab(selection){
 const selected=selection===true?'review-tab':selection===false?'map-tab':selection;
 window.cpuMap.stop();held=false;buffer=0;state=selected==='map-tab'?'map':'practice';
 for(const id of mapTabs){
  const active=id===selected,tab=document.getElementById(id);
  document.getElementById(tabPanels[id]).hidden=!active;
  tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;
 }
 if(selected==='review-tab')window.cpuReview.open();else window.cpuReview.close();
 if(selected==='shop-tab')renderShop();
 document.getElementById('free-play-best').textContent=`${freeBest} m`;
}
const tabPanels={'map-tab':'map-panel','review-tab':'review-panel','free-play-tab':'free-play-panel','shop-tab':'shop-panel'};
for(const id of mapTabs){
 document.getElementById(id).addEventListener('click',()=>selectMapTab(id));
 document.getElementById(id).addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.code))return;
  event.preventDefault();event.stopPropagation();
  const index=event.code==='Home'?0:event.code==='End'?mapTabs.length-1:(mapTabs.indexOf(id)+(event.code==='ArrowRight'?1:-1)+mapTabs.length)%mapTabs.length;
  selectMapTab(mapTabs[index]);document.getElementById(mapTabs[index]).focus();
 });
}
document.getElementById('free-play-start').addEventListener('click',startFreePlay);
const W=1280,H=720,FLOOR=570,SIZE=42,X=220,STEP=1/120;
artwork.width=W;artwork.height=H;
let state='ready',distance=0,elapsed=0,speed=360,best=0,y=FLOOR-SIZE,vy=0,angle=0,held=false,buffer=0,obstacles=[],nextSpawn=850,invincible=0,lastQuestion=-1,accumulator=0,previous=0,action=start;
let freePlay=false,freeBest=0;
try{const stored=Number(localStorage.getItem('cpuEscapeFreeBest'));if(Number.isFinite(stored)&&stored>0)freeBest=Math.floor(stored);}catch{}
// Temporary testing switch: set false to restore normal level progression.
const UNLOCK_ALL_LEVELS=true;
let unlocked=UNLOCK_ALL_LEVELS?cpuStages.length-1:0,storyTime=0,storyPage=0,introEntry=0;
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
const stageDuration=index=>30+index*30;
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
// Replay the courier's height after the bug travels the gap behind them.
let bugFeet=FLOOR,bugTargetFeet=FLOOR,bugTrail=[];
const BUG_FOLLOW_DISTANCE=120;
function resetBugTrail(){bugFeet=FLOOR;bugTargetFeet=FLOOR;bugTrail=[];}
function followJump(dt){
 bugTrail.push({distance,feet:y+SIZE});
 while(bugTrail.length&&bugTrail[0].distance<=distance-BUG_FOLLOW_DISTANCE){
  bugTargetFeet=bugTrail.shift().feet;
 }
 // Smaller hops and a gentle response keep the chase from looking frantic.
 const target=FLOOR+(bugTargetFeet-FLOOR)*.55;
 bugFeet+=(target-bugFeet)*(1-Math.exp(-dt/ .12));
}

const MAX_REVIVES=3;
let revives=MAX_REVIVES;
const BOSS_SHOT_TIME=.28,BOSS_DEATH_DURATION=.9;
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
 modal('BOSS / '+stageData().name,q.question,'','',null);
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
 if(boss.hp===0){boss.deathTime=0;boss.hitTime=0;ui.overlay.hidden=true;}
 updateBossHealth();hud();ui.action.focus();window.cpuAudio?.effect(correct?'correct':'wrong');
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
function hud(){ui.hearts.hidden=freePlay;document.getElementById('chapter').textContent=freePlay?'FREE PLAY / ENDLESS':`${String(stageIndex+1).padStart(2,'0')} / ${stageData().name} / ${Math.min(100,Math.floor(elapsed/stageDuration(stageIndex)*100))}%`;ui.score.textContent=Math.floor(distance/10);ui.best.textContent=`BEST ${freePlay?freeBest:best} m`;ui.speed.textContent=boss.active?'BOSS FIGHT':`${(speed/360).toFixed(2)}× SPEED`;showHearts();}
function saveFreeBest(){
 const score=Math.floor(distance/10);
 if(score<=freeBest)return;
 freeBest=score;
 try{localStorage.setItem('cpuEscapeFreeBest',String(freeBest));}catch{}
}
function startFreePlay(){
 window.cpuReview.close();window.cpuMap.stop();start();freePlay=true;
 document.getElementById('level-location').textContent='FREE PLAY / ENDLESS RUN';
 hud();
}
function save(){best=Math.max(best,Math.floor(distance/10));try{localStorage.setItem('cpuEscapeBest',String(best));}catch{}}
function modal(label,title,description,button,callback){hideSkip();held=false;buffer=0;ui.overlay.hidden=false;ui.eyebrow.textContent=label;ui.title.textContent=title;window.cpuDialogue.clear();window.cpuDialogue.write(ui.description,description);ui.answers.replaceChildren();ui.feedback.textContent='';ui.action.textContent=button;ui.action.hidden=!button;action=callback;if(button)ui.action.focus();}
function resume(){applyLevelColor();window.cpuDialogue.clear();ui.controls.hidden=false;ui.hud.hidden=false;state='running';held=false;buffer=0;ui.overlay.hidden=true;}
function start(){freePlay=false;resetBoss();resetBugTrail();window.cpuAudio?.setScene(0);document.getElementById('level-toolbar').hidden=false;document.getElementById('world-map').hidden=true;ui.stage.classList.remove('story-mode');stageIndex=0;gateAt=stageLength(0);gate=false;recovery=false;correctCount=0;attempts=0;ui.home.hidden=true;ui.stage.hidden=false;ui.controls.hidden=false;ui.hud.hidden=false;revives=MAX_REVIVES;pickups=[];heartNumber=1;distance=0;elapsed=0;speed=360*.92;y=FLOOR-SIZE;vy=0;angle=0;obstacles=[];platforms=[];gaps=[];grounded=true;spawnCount=0;nextSpawn=850;invincible=0;resume();hud();canvas.focus();}
ui.action.addEventListener('click',()=>{ui.overlay.style.opacity='1';action?.();});
function lesson(){applyLevelColor();document.getElementById('level-location').textContent='LEVEL '+(stageIndex+1)+' / '+stageData().name;state='lesson';modal('SECTOR '+(stageIndex+1)+' / '+stageData().name,stageData().name,stageData().lesson,'Run this sector',resume);}
const story=[['Welcome to CPU Escape.','Just a boy, his bedroom, and one more night at the computer.'],['Something is wrong.','The screen hums. The computer shakes. Then he starts shaking, too.'],['POOF!','A strange force pulls him toward the screen... and the boy disappears.'],['OH NO!','You are trapped inside the computer! And something is coming for you.'],['Find your way home.','Outrun the bug. Cross each computer component. Reach every exit to escape alive.']];
function storyCard(){if(storyPage===1)window.cpuAudio?.effect('stuck');if(storyPage===2)window.cpuAudio?.effect('portal');if(storyPage===3)window.cpuAudio?.effect('arrival');const card=story[storyPage];modal('CPU ESCAPE / PROLOGUE',card[0],card[1],'Skip story / Walk to map',walkToMap);}
function intro(){introEntry=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?0:1.2;const curtain=document.getElementById('scene-curtain');curtain.hidden=!introEntry;curtain.style.opacity='0';window.cpuAudio?.setScene('home');document.getElementById('level-toolbar').hidden=true;window.cpuAudio?.start();ui.home.hidden=true;ui.stage.hidden=false;ui.hud.hidden=true;ui.controls.hidden=true;ui.stage.classList.add('story-mode');state='intro';storyPage=0;storyTime=0;storyCard();if(introEntry>0){ui.home.hidden=false;ui.stage.hidden=true;}}
function storyStep(dt){if(introEntry>0){introEntry=Math.max(0,introEntry-dt);const t=1.2-introEntry,curtain=document.getElementById('scene-curtain');const p=Math.min(1,t<.6?t/.6:introEntry/.6);curtain.style.opacity=String(p*p*(3-2*p));if(t>=.6){ui.home.hidden=true;ui.stage.hidden=false;}if(introEntry===0)curtain.hidden=true;return;}storyTime+=dt;const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;const opacity=reduced?1:Math.min(1,storyTime/.85,(5.8-storyTime)/.85);ui.overlay.style.opacity=String(Math.max(0,opacity));if(storyTime>=5.8){storyPage++;storyTime=0;if(storyPage>=story.length)walkToMap();else storyCard();}}
let transitionTime=0;
function walkToMap(){introEntry=0;document.getElementById('scene-curtain').hidden=true;ui.home.hidden=true;ui.stage.hidden=false;state='map-transition';transitionTime=0;held=false;ui.overlay.hidden=false;ui.action.hidden=true;ui.title.textContent='Follow the signal.';window.cpuDialogue.clear();window.cpuDialogue.write(ui.description,'The boy steps onto a path through the computer.');ui.overlay.style.opacity='1';if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)showMap(true);}
function showMap(arrival=false){const wasFreePlay=freePlay;if(freePlay)saveFreeBest();freePlay=false;resetBoss();window.cpuDialogue.clear();window.cpuAudio?.setScene('map');document.getElementById('level-toolbar').hidden=true;state='map';selectMapTab(false);held=false;buffer=0;ui.overlay.style.opacity='1';ui.stage.classList.remove('story-mode');ui.stage.hidden=true;ui.hud.hidden=true;ui.controls.hidden=true;ui.home.hidden=true;document.getElementById('world-map').hidden=false;window.cpuMap.show({unlocked,current:stageIndex,arrival,onEnter:enterLevel});if(wasFreePlay){selectMapTab('free-play-tab');document.getElementById('free-play-start').focus();}}
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
function clearRunway(){resetBugTrail();obstacles=[];platforms=[];gaps=[];grounded=true;nextSpawn=distance+speed*2;y=FLOOR-SIZE;vy=0;invincible=1.5;resume();}
function completeGate(){if(boss.active&&boss.hp===0&&boss.deathTime<BOSS_DEATH_DURATION)return;resetBoss();window.cpuAudio?.effect('clear');save();unlocked=Math.max(unlocked,stageIndex+1);gate=false;state='cleared';if(unlocked>=cpuStages.length&&stageIndex===cpuStages.length-1){state='won';modal('COMPUTER / ESCAPE SUCCESSFUL','The boy is finally home.',`All ${cpuStages.length} routes cleared. You outran the bug and learned how the computer works. First-answer accuracy this run: ${correctCount}/${attempts}.`,'Return to map',showMap);return;}modal('LEVEL / CLEARED',stageData().name+' complete!',cpuStages[stageIndex+1].name+' is now unlocked. The bug is still out there. Choose your next stop on the map.','Return to map',showMap);}
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
function crash(lethal=false){if(state!=='running')return;if(lethal)revives=0;if(freePlay){saveFreeBest();state='over';hud();window.cpuAudio?.effect('stuck');modal('FREE PLAY / RUN OVER',lethal?'You hit the tunnel ceiling.':'The bug caught you.',`Distance: ${Math.floor(distance/10)} m. High score: ${freeBest} m.`,'Play again',startFreePlay);return;}window.cpuAudio?.effect('stuck');save();if(revives===0){state='over';hud();modal('SYSTEM / GAME OVER',lethal?'You hit the tunnel ceiling.':'No revives left.',`Your run ended at ${Math.floor(distance/10)} m.`,'Retry this level',()=>enterLevel(stageIndex));return;}revives--;gate=false;hud();askQuestion();}
function press(){if(state==='running'){if(!held)window.cpuAudio?.effect('jump');held=true;buffer=.12;}}
window.addEventListener('keydown',e=>{if(e.target?.getAttribute?.('role')==='tab')return;if(e.code==='Space'&&((boss.active&&state!=='confirm-leave')||['quiz','saved','review','over'].includes(state))){e.preventDefault();return;}if(state==='map'){if(e.target?.tagName==='BUTTON'&&['Enter','Space'].includes(e.code))return;window.cpuMap.key(e,true);return;}if(['Space','ArrowUp','KeyW'].includes(e.code)&&state==='running'){e.preventDefault();if(!e.repeat)press();}if(e.code==='KeyP'&&!e.repeat){if(state==='paused')resume();else pause();}});
window.addEventListener('keyup',e=>{if(e.code==='Space'&&((boss.active&&state!=='confirm-leave')||['quiz','saved','review','over'].includes(state)))e.preventDefault();if(state==='map'){window.cpuMap.key(e,false);return;}if(['Space','ArrowUp','KeyW'].includes(e.code))held=false;});
canvas.addEventListener('pointerdown',e=>{e.preventDefault();canvas.setPointerCapture(e.pointerId);press();});canvas.addEventListener('pointerup',()=>held=false);canvas.addEventListener('pointercancel',()=>held=false);
window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
function spawn(){
 spawnCount++;
 const tier=difficulty[stageIndex];
 // Separate gates require a fresh jump each time, with a brief landing window.
 if(spawnCount%9===0){
  const count=3+Math.floor(stageIndex/2),spacing=Math.round(speed*.86);
  for(let gate=0;gate<count;gate++)obstacles.push({x:W+60+gate*spacing,w:54,h:48,logicGate:['AND','OR','NOT'][gate%3]});
  nextSpawn=distance+(count-1)*spacing+54+speed*(tier.rest+.8);
  return;
 }
 if(spawnCount%11===0){
  const width=Math.round(speed*1.1);
  obstacles.push({x:W+60,w:width,h:110,base:FLOOR-64,tunnel:true});
  nextSpawn=distance+width+speed*(tier.rest+1);
  return;
 }
 if(spawnCount%5===0){
  const begin=W+60,ramp=Math.round(speed*.65),deck=Math.round(speed*.65);
  const breakWidth=Math.round(speed*.24);
  let cursor=begin;
  const addCurve=descending=>{
   const strips=48,width=ramp/strips;
   for(let i=0;i<strips;i++){
    const t=(i+.5)/strips,smooth=t*t*(3-2*t);
    platforms.push({x:cursor+i*width,w:width+.5,h:80*(descending?1-smooth:smooth),thickness:18,wire:true,ramp:true});
   }
   cursor+=ramp;
  };
  addCurve(false);
  platforms.push({x:cursor,w:deck,h:80,thickness:18,wire:true,copperLeft:false,copperRight:true});
  cursor+=deck+breakWidth;
  platforms.push({x:cursor,w:deck,h:80,thickness:18,wire:true,copperLeft:true,copperRight:false});
  cursor+=deck;addCurve(true);
  // Ground overlaps the curved ends; only the middle spans the pit.
  gaps.push({x:begin+ramp*.55,w:cursor-begin-ramp*1.1});
  nextSpawn=distance+cursor-begin+speed*(tier.rest+.8);
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
 // A shorting circuit pulses vertically; its maximum height stays jumpable.
 if(spawnCount%7===0){
  obstacles.push({x:W+60,w:64,h:68,arc:true,age:0});
  nextSpawn=distance+speed*(tier.rest+.8)+64;
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
const obstacleHeight=o=>o.arc?28+40*(.5+.5*Math.sin((o.age??0)*5)):o.h*(o.popup?(o.rise??0):1);
function collision(o){if(obstacleHeight(o)<=0)return false;const base=o.base??FLOOR,left=X+6,right=X+SIZE-6,top=y+5,bottom=y+SIZE-3;if(right<=o.x||left>=o.x+o.w||bottom<=base-obstacleHeight(o)||top>=base)return false;return true;}
function step(dt){if(state!=='confirm-leave'&&introEntry<=0)window.cpuDialogue.update(dt);if(state==='map'){window.cpuMap.update(dt);return;}if(state==='practice')return;if(state==='map-transition'){transitionTime+=dt;ui.overlay.style.opacity=String(Math.max(0,1-transitionTime/1.7));if(transitionTime>=1.8)showMap(true);return;}if(state==='intro'){storyStep(dt);return;}if(boss.active){if(state!=='confirm-leave'){boss.hitTime=Math.max(0,boss.hitTime-dt);if(boss.hp===0){
 const before=boss.deathTime;boss.deathTime+=dt;
 if(before<BOSS_SHOT_TIME&&boss.deathTime>=BOSS_SHOT_TIME)window.cpuAudio?.effect('splat');
 if(before<BOSS_DEATH_DURATION&&boss.deathTime>=BOSS_DEATH_DURATION){ui.overlay.hidden=false;ui.action.focus();}
 }}return;}if(state!=='running')return;elapsed+=dt;speed=(360+260*(1-Math.exp(-elapsed/100)))*difficulty[stageIndex].speed;distance+=speed*dt;invincible=Math.max(0,invincible-dt);buffer=Math.max(0,buffer-dt);
 if(grounded&&(held||buffer>0)){vy=-830;buffer=0;grounded=false;}
 const wasGrounded=grounded;
 const previousBottom=y+SIZE;vy+=2400*dt;y+=vy*dt;
 if(!freePlay&&elapsed+1e-8>=stageDuration(stageIndex)){elapsed=stageDuration(stageIndex);distance=gateAt;beginBoss();hud();return;}
 if(distance>=nextSpawn)spawn();
 for(const items of [obstacles,platforms,gaps]){for(const o of items)o.x-=speed*dt;}
 for(const o of obstacles)if(o.arc)o.age+=dt;
 for(const o of obstacles)if(o.falling){
  if(o.x-(X+SIZE)<=speed*2)o.dropping=true;
  if(o.dropping){o.fallSpeed+=1200*dt;o.base=Math.min(FLOOR,o.base+o.fallSpeed*dt);}
 }
 for(const o of obstacles)if(o.popup&&o.x-(X+SIZE)<=speed*1.35)o.rise=Math.min(1,(o.rise??0)+dt/.25);
 obstacles=obstacles.filter(o=>o.x+o.w>-30);platforms=platforms.filter(o=>o.x+o.w>-30);gaps=gaps.filter(o=>o.x+o.w>-30);
 if(!freePlay)updatePickups();
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
 followJump(dt);if(freePlay)saveFreeBest();const hit=obstacles.find(o=>(o.tunnel||!invincible)&&collision(o));if(hit)crash(!!hit.tunnel);hud();
}
// Component-specific scenery stays behind the hazards and freezes when paused.
function drawPitElectricity(g){
 const left=Math.max(0,g.x),right=Math.min(W,g.x+g.w);
 if(right<=left)return;
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const phase=reduced?0:Math.floor(elapsed*12);
 ctx.save();ctx.beginPath();ctx.rect(g.x,FLOOR,g.w,H-FLOOR);ctx.clip();
 const glow=ctx.createLinearGradient(0,H-76,0,H);
 glow.addColorStop(0,'#37bfff00');glow.addColorStop(1,'#37bfff55');
 ctx.fillStyle=glow;ctx.fillRect(left,H-76,right-left,76);
 // Layered jagged arcs stay low in the pit and freeze with the run.
 ctx.shadowColor='#53d8ff';ctx.shadowBlur=16;ctx.lineJoin='miter';
 for(let lane=0;lane<3;lane++){
  ctx.beginPath();
  for(let x=left-12,point=0;x<=right+16;x+=12,point++){
   const jag=Math.sin((Math.floor((x-g.x)/12)+phase*3+lane*17)*12.9898)*Math.cos(point+phase+lane);
   const yy=H-12-lane*14+jag*(lane===2?14:8);
   if(point===0)ctx.moveTo(x,yy);else ctx.lineTo(x,yy);
  }
  ctx.strokeStyle=lane===0?'#bff8ff':'#42bfff';ctx.lineWidth=lane===0?3:2;ctx.stroke();
  ctx.shadowBlur=0;ctx.strokeStyle='#e8fdff';ctx.lineWidth=1;ctx.stroke();ctx.shadowBlur=16;
 }
 ctx.restore();
}
function drawLevelBackdrop(){
 const color=stageData().color;
 const panel=(x,y,w,h,label)=>{
  ctx.fillStyle=blendColor(stageData().background,'#070e19',.6);ctx.fillRect(x,y,w,h);
  ctx.strokeStyle=color+'66';ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
  if(label){ctx.fillStyle=color+'bb';ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.fillText(label,x+w/2,y+24);}
 };
 const line=(points)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();};
 const label=(text,x,y,size=16)=>{ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.fillStyle=color+'aa';ctx.fillText(text,x,y);};
 for(let tile=-1;tile<3;tile++){
  ctx.save();ctx.translate(tile*640-distance*.16%640,0);
  ctx.strokeStyle=color+'44';ctx.lineWidth=2;
  if(freePlay){
   // An unlabeled motherboard mixes chips, memory, capacitors, and data traces.
   for(let lane=0;lane<7;lane++){
    const yy=156+lane*45;
    ctx.strokeStyle=(lane%2?'#77b9ff':'#71d9be')+'44';
    line([[0,yy],[70,yy],[100,yy-24],[480,yy-24],[514,yy+10],[640,yy+10]]);
    ctx.beginPath();ctx.arc(100,yy-24,3,0,Math.PI*2);ctx.stroke();
    const signal=(distance*.24+lane*83)%640;
    ctx.fillStyle='#a8ffd588';ctx.fillRect(signal,yy-26,4,4);
   }
   panel(170,214,166,148,'');panel(190,234,126,108,'');
   for(let pin=0;pin<9;pin++){
    ctx.fillStyle='#7192a3';ctx.fillRect(180+pin*17,204,4,10);ctx.fillRect(180+pin*17,362,4,10);
    ctx.fillRect(160,224+pin*15,10,4);ctx.fillRect(336,224+pin*15,10,4);
   }
   for(let bank=0;bank<2;bank++){
    panel(400,175+bank*88,174,58,'');
    for(let chip=0;chip<4;chip++){
     ctx.fillStyle='#0b1b2b';ctx.fillRect(410+chip*40,186+bank*88,30,32);
     ctx.fillStyle='#ad9a69';ctx.fillRect(410+chip*40,234+bank*88,29,4);
    }
   }
   for(let cap=0;cap<4;cap++){
    const x=420+cap*44;ctx.fillStyle='#183b48';ctx.fillRect(x-10,405,20,30);
    ctx.fillStyle='#688d9d';ctx.beginPath();ctx.ellipse(x,405,10,5,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#c4ced3';line([[x-5,405],[x+5,405]]);
   }
   for(const yy of [146,457]){ctx.strokeStyle='#73909a66';ctx.beginPath();ctx.arc(36,yy,7,0,Math.PI*2);ctx.stroke();}
  }else if(stageIndex===0){
   // Processor die, socket pins, and a visible instruction pipeline.
   panel(175,180,280,220,'CENTRAL PROCESSOR');
   for(let pin=0;pin<14;pin++){
    ctx.fillStyle=color+'66';ctx.fillRect(186+pin*19,168,5,12);ctx.fillRect(186+pin*19,400,5,12);
    ctx.fillRect(163,194+pin*14,12,5);ctx.fillRect(455,194+pin*14,12,5);
   }
   for(let unit=0;unit<3;unit++)panel(194+unit*83,238,70,110,['FETCH','DECODE','EXECUTE'][unit]);
   for(let lane=0;lane<5;lane++){
    ctx.strokeStyle=color+'44';line([[0,214+lane*36],[90,214+lane*36],[130,234+lane*36],[163,234+lane*36]]);
    line([[467,214+lane*36],[510,214+lane*36],[550,194+lane*36],[640,194+lane*36]]);
   }
   label('INSTRUCTION BUS',315,454);
  }else if(stageIndex===1){
   // A decoder fans instruction signals out to the rest of the machine.
   panel(50,210,142,120,'INSTRUCTION');panel(250,188,132,176,'DECODER');
   ctx.strokeStyle=color+'66';line([[192,270],[250,270]]);
   for(let output=0;output<4;output++){
    const yy=160+output*81;panel(465,yy,128,57,['FETCH','READ','WRITE','EXECUTE'][output]);
    ctx.strokeStyle=color+'55';line([[382,230+output*28],[415,230+output*28],[443,yy+29],[465,yy+29]]);
    const active=Math.floor(elapsed*2)%4===output;ctx.fillStyle=active?color:color+'33';ctx.fillRect(478,yy+40,100,4);
   }
   label('CONTROL SIGNALS',315,465);
  }else if(stageIndex===2){
   // Named register banks store individual bits, with PC and IR highlighted.
   for(let row=0;row<5;row++){
    const yy=163+row*62;panel(65,yy,510,48,'');label(['PC','IR','ACC','R0','R1'][row],100,yy+30,15);
    for(let bit=0;bit<12;bit++){
     const x=145+bit*33;ctx.fillStyle=color+'18';ctx.fillRect(x,yy+9,25,30);
     label(String((bit+row+Math.floor(elapsed))%2),x+12,yy+30,16);
    }
   }
   label('REGISTER FILE / IMMEDIATE ACCESS',320,145);
  }else if(stageIndex===3){
   // Two operands feed an arithmetic/logic block and a result bus.
   panel(45,178,140,77,'OPERAND A');panel(45,330,140,77,'OPERAND B');
   label('0101',115,234,19);label('0011',115,386,19);
   ctx.strokeStyle=color+'77';line([[185,218],[234,218],[264,270]]);line([[185,369],[234,369],[264,321]]);
   ctx.fillStyle=color+'16';ctx.beginPath();ctx.moveTo(264,199);ctx.lineTo(390,253);ctx.lineTo(390,340);ctx.lineTo(264,397);ctx.lineTo(264,320);ctx.lineTo(292,298);ctx.lineTo(264,275);ctx.closePath();ctx.fill();ctx.stroke();
   label('ALU',332,307,25);line([[390,297],[457,297]]);panel(457,255,135,86,'RESULT');label('1000',524,317,20);
   ['+','?','AND','OR'].forEach((op,i)=>label(op,120+i*132,463,23));
  }else if(stageIndex===4){
   // Cache hierarchy: tiny L1 beside the core, then larger L2/L3 banks.
   panel(28,236,98,126,'CORE');
   for(let bank=0;bank<3;bank++){
    const x=158+bank*148,yy=210-bank*26,hh=150+bank*52;
    panel(x,yy,125,hh,['L1','L2','L3'][bank]);
    for(let row=0;row<3+bank*2;row++)for(let col=0;col<4;col++){
     ctx.fillStyle=(row+col+Math.floor(elapsed*2))%7===0?color+'88':color+'22';ctx.fillRect(x+12+col*26,yy+43+row*20,20,12);
    }
    ctx.strokeStyle=color+'66';line([[x-32,298],[x,298]]);
   }
   label('HOT DATA / SHORTER PATHS',320,467);
  }else{
   // Oscillator crystal and square-wave timing lanes.
   panel(42,224,122,145,'OSCILLATOR');
   ctx.strokeStyle=color+'99';ctx.beginPath();ctx.ellipse(103,309,35,18,0,0,Math.PI*2);ctx.stroke();
   for(let lane=0;lane<3;lane++){
    const yy=187+lane*104;label(['CLK','SYNC','CYCLE'][lane],224,yy+24,12);
    ctx.strokeStyle=color+'88';const points=[];
    for(let x=270;x<=608;x+=2){const high=((x-270+elapsed*48+lane*28)%100)<50;points.push([x,yy+(high?0:48)]);}
    line(points);
   }
   label('TICK / SYNCHRONIZE / REPEAT',320,482);
  }
  ctx.restore();
 }
}
function draw(){if(state==='practice')return;if(state==='map'){window.cpuMap.draw();return;}if(state==='map-transition'){window.cpuOpening?.draw(ctx,W,H,4,transitionTime,Math.min(1,transitionTime/1.8));return;}if(state==='ready')window.cpuOpening?.home(previous/1000);if(state==='intro'){if(introEntry>.6)window.cpuOpening?.home(previous/1000);window.cpuOpening?.draw(ctx,W,H,storyPage,storyTime);return;}
 const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#100d1c');bg.addColorStop(1,stageData().background);ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);ctx.lineWidth=1;ctx.strokeStyle=stageData().color+'25';
 for(let x=-(distance*.22%80);x<W;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let yy=10;yy<H;yy+=80){ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(W,yy);ctx.stroke();}
 drawLevelBackdrop();
 ctx.fillStyle='#091629';ctx.fillRect(0,FLOOR,W,H-FLOOR);ctx.shadowColor=stageData().color;ctx.shadowBlur=16;ctx.fillStyle=stageData().color;ctx.fillRect(0,FLOOR,W,3);ctx.shadowBlur=0;ctx.strokeStyle='#204052';for(let x=-(distance%64);x<W;x+=64)ctx.strokeRect(x,FLOOR+22,52,52);
 // Dark breaks in the board mark lethal gaps between solid chip blocks.
 for(const g of gaps){ctx.fillStyle='#030611';ctx.fillRect(g.x,FLOOR,g.w,H-FLOOR);ctx.strokeStyle='#ff517b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(g.x,FLOOR+8);ctx.lineTo(g.x,H);ctx.moveTo(g.x+g.w,FLOOR+8);ctx.lineTo(g.x+g.w,H);ctx.stroke();drawPitElectricity(g);}
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
  if(o.tunnel){
   const bottom=o.base,top=bottom-o.h;
   ctx.save();
   ctx.fillStyle='#080f20';ctx.fillRect(o.x,bottom,o.w,FLOOR-bottom);
   ctx.fillStyle='#263a50';ctx.fillRect(o.x,top,o.w,o.h);
   ctx.strokeStyle='#78b8ce';ctx.lineWidth=3;ctx.strokeRect(o.x+1,top+1,o.w-2,o.h-2);
   // The striped underside marks the lethal ceiling; the floor stays open.
   ctx.fillStyle='#ffd76e';ctx.fillRect(o.x,bottom-10,o.w,10);
   ctx.fillStyle='#28313f';
   for(let stripe=0;stripe<o.w-8;stripe+=24)ctx.fillRect(o.x+stripe,bottom-10,12,10);
   ctx.strokeStyle='#45657b';ctx.lineWidth=4;
   for(let rib=28;rib<o.w;rib+=52){ctx.beginPath();ctx.moveTo(o.x+rib,top+14);ctx.lineTo(o.x+rib,bottom-18);ctx.stroke();}
   ctx.textAlign='center';ctx.font='bold 16px monospace';ctx.fillStyle='#fff0bc';ctx.fillText('LOW TUNNEL / STAY DOWN',o.x+o.w/2,top+38);
   ctx.restore();continue;
  }
  if(o.logicGate){
   const top=FLOOR-o.h;
   ctx.save();ctx.translate(o.x,top);ctx.strokeStyle='#83e8ff';ctx.lineWidth=2;ctx.fillStyle='#15384c';ctx.shadowColor='#54d9ff';ctx.shadowBlur=10;
   // Recognizable circuit symbols: rounded AND, curved OR, triangular NOT.
   ctx.beginPath();
   if(o.logicGate==='AND'){
    ctx.moveTo(10,3);ctx.lineTo(28,3);ctx.bezierCurveTo(51,3,51,37,28,37);ctx.lineTo(10,37);ctx.closePath();
   }else if(o.logicGate==='OR'){
    ctx.moveTo(7,3);ctx.quadraticCurveTo(33,1,47,20);ctx.quadraticCurveTo(33,39,7,37);ctx.quadraticCurveTo(21,20,7,3);
   }else{ctx.moveTo(10,3);ctx.lineTo(41,20);ctx.lineTo(10,37);ctx.closePath();}
   ctx.fill();ctx.stroke();
   if(o.logicGate==='NOT'){ctx.beginPath();ctx.arc(45,20,4,0,Math.PI*2);ctx.stroke();}
   ctx.beginPath();
   for(const yy of o.logicGate==='NOT'?[20]:[11,29]){ctx.moveTo(0,yy);ctx.lineTo(12,yy);}
   ctx.moveTo(48,20);ctx.lineTo(54,20);ctx.stroke();ctx.shadowBlur=0;
   ctx.fillStyle='#83e8ff';ctx.fillRect(7,40,40,8);
   ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillStyle='#d9faff';ctx.fillText(o.logicGate,27,28);
   ctx.font='bold 11px monospace';ctx.fillStyle='#83e8ff';ctx.fillText('JUMP',27,-12);
   ctx.restore();continue;
  }
  const height=obstacleHeight(o);
  if(o.popup&&height<o.h){
   ctx.fillStyle='#fff1bd';ctx.fillRect(o.x-4,FLOOR-3,o.w+8,3);
   ctx.font='bold 16px monospace';ctx.textAlign='center';ctx.fillText('!',o.x+o.w/2,FLOOR-14);
  }
  if(height<=0)continue;
  if(o.arc){
   const top=FLOOR-height;
   ctx.save();ctx.shadowColor='#78eaff';ctx.shadowBlur=16;
   ctx.fillStyle='#243e58';ctx.fillRect(o.x,FLOOR-8,o.w,8);
   ctx.fillStyle='#b1c6d4';ctx.fillRect(o.x+3,FLOOR-17,8,17);ctx.fillRect(o.x+o.w-11,FLOOR-17,8,17);
   ctx.strokeStyle='#78eaff';ctx.lineWidth=6;
   ctx.beginPath();ctx.moveTo(o.x+7,FLOOR-13);
   ctx.lineTo(o.x+o.w*.25,top+12);ctx.lineTo(o.x+o.w*.42,top+22);
   ctx.lineTo(o.x+o.w*.57,top);ctx.lineTo(o.x+o.w*.76,top+15);ctx.lineTo(o.x+o.w-7,FLOOR-13);ctx.stroke();
   ctx.strokeStyle='#efffff';ctx.lineWidth=2;ctx.stroke();
   ctx.shadowBlur=0;ctx.fillStyle='#ffe6a1';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText('HV',o.x+o.w/2,FLOOR+17);
   ctx.restore();continue;
  }
  const top=(o.base??FLOOR)-height,bodyHeight=o.h*.64;
  ctx.save();ctx.beginPath();ctx.rect(o.x-4,(o.base??FLOOR)-o.h-4,o.w+8,o.h+4);ctx.clip();ctx.translate(o.x,top);
  // Metal emitter, base, and collector leads reach down to the board.
  ctx.strokeStyle='#c4b4c7';ctx.lineWidth=3;ctx.lineCap='round';
  for(const pin of [.22,.5,.78]){ctx.beginPath();ctx.moveTo(o.w*pin,bodyHeight-2);ctx.lineTo(o.w*pin,o.h-2);ctx.stroke();}
  ctx.shadowColor='#ff517b';ctx.shadowBlur=12;ctx.fillStyle='#000000';ctx.strokeStyle='#ff517b';ctx.lineWidth=2;
  // The sloped shoulders give the plastic casing a recognizable transistor shape.
  ctx.beginPath();ctx.moveTo(2,bodyHeight);ctx.lineTo(2,9);ctx.lineTo(9,1);ctx.lineTo(o.w-9,1);ctx.lineTo(o.w-2,9);ctx.lineTo(o.w-2,bodyHeight);ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;
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
 if(!freePlay&&finishX<W+80){ctx.fillStyle='#f6efde';ctx.fillRect(finishX,FLOOR-145,5,145);ctx.fillStyle=stageData().color;ctx.fillRect(finishX+5,FLOOR-145,65,38);ctx.fillStyle='#14111d';ctx.font='bold 12px monospace';ctx.textAlign='left';ctx.fillText('EXIT',finishX+16,FLOOR-120);}
 // Original pixel sprites: a small signal courier and the corruption chasing it.
 const tint=stageData().color;
 if(!freePlay){ctx.fillStyle=tint;ctx.globalAlpha=.12;ctx.font='bold 72px monospace';ctx.textAlign='center';ctx.fillText(stageData().name,W/2,110);ctx.globalAlpha=1;}
 function sprite(rows,px,py,scale,palette){rows.forEach((row,yy)=>[...row].forEach((c,xx)=>{if(palette[c]){ctx.fillStyle=palette[c];ctx.fillRect(Math.round(px+xx*scale),Math.round(py+yy*scale),scale,scale);}}));}
 const bob=state==='running'?Math.floor(Math.sin(distance*.07)*2):0;
 const bugX=boss.active?W*.25+(boss.hitTime>0?Math.sin(boss.hitTime*30)*12:0):state==='quiz'?X-80:65+Math.sin(elapsed*2)*12;
 const bugScale=boss.active?12+stageIndex:7;
 const bugColor=blendColor(stageData().color,'#182a2b',.3);
 const bugPalette={r:boss.hitTime>0?'#fff1bd':bugColor,w:'#fff1d5',a:stageData().color};
 if(boss.active&&boss.hp===0){
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const meltAge=Math.max(0,boss.deathTime-BOSS_SHOT_TIME);
  const t=boss.deathTime<BOSS_SHOT_TIME?0:reduced?1:Math.min(1,meltAge/.55),center=bugX+bugScale*5;
  if(t<1){
   ctx.save();ctx.translate(center,FLOOR);ctx.scale(1+t*.7,Math.max(.08,1-t));
   sprite(bugLooks[stageIndex],-bugScale*5,-bugScale*8,bugScale,bugPalette);ctx.restore();
  }
  if(t>0){ctx.fillStyle=bugColor;ctx.beginPath();ctx.ellipse(center,FLOOR-5,bugScale*(5+2*t),4+7*t,0,0,Math.PI*2);ctx.fill();}
  if(t>0){ctx.fillStyle=stageData().color;ctx.fillRect(center-24,FLOOR-10,18,4);ctx.fillRect(center+16,FLOOR-8,12,3);}
  if(!reduced&&meltAge>0&&meltAge<.65){
   for(let i=0;i<12;i++){
    const age=meltAge,vx=(i-5.5)*45,vy=-140-(i%3)*65;
    const dx=center+vx*age,dy=FLOOR-12+vy*age+360*age*age;
    if(dy<FLOOR)ctx.fillRect(dx,dy,5+i%3*2,5+i%3*2);
   }
  }
 }else{
  sprite(bugLooks[stageIndex],bugX,(boss.active?FLOOR:bugFeet)-bugScale*8+bob,bugScale,bugPalette);
 }
 ctx.globalAlpha=invincible>0?.6:1;
 ctx.save();
 if(boss.active){ctx.translate(W*.73+SIZE,0);ctx.scale(-1,1);ctx.translate(-X,0);}
 sprite(characterRows,X,y+bob,4,characterPalette());ctx.globalAlpha=1;
 ctx.restore();
 if(boss.active&&boss.hp===0&&boss.deathTime<BOSS_DEATH_DURATION){
  const muzzleX=W*.73-10,muzzleY=y+24,targetX=bugX+bugScale*8,targetY=FLOOR-bugScale*4;
  ctx.fillStyle='#b4cbd3';ctx.fillRect(muzzleX,muzzleY-5,26,10);ctx.fillStyle=stageData().color;ctx.fillRect(muzzleX+18,muzzleY-8,9,16);
  if(boss.deathTime<BOSS_SHOT_TIME){
   const travel=boss.deathTime/BOSS_SHOT_TIME,shotX=muzzleX+(targetX-muzzleX)*travel,shotY=muzzleY+(targetY-muzzleY)*travel;
   ctx.save();ctx.shadowColor=stageData().color;ctx.shadowBlur=20;ctx.strokeStyle=stageData().color;ctx.lineWidth=6;
   ctx.beginPath();ctx.moveTo(shotX+32,shotY);ctx.lineTo(shotX,shotY);ctx.stroke();ctx.fillStyle='#fff5d9';ctx.fillRect(shotX-4,shotY-4,8,8);ctx.restore();
  }else if(boss.deathTime<BOSS_SHOT_TIME+.12){
   ctx.strokeStyle='#fff1bd';ctx.lineWidth=3;
   for(let ray=0;ray<8;ray++){const angle=ray*Math.PI/4;ctx.beginPath();ctx.moveTo(targetX+Math.cos(angle)*12,targetY+Math.sin(angle)*12);ctx.lineTo(targetX+Math.cos(angle)*30,targetY+Math.sin(angle)*30);ctx.stroke();}
  }
 }
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
