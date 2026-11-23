/* Practice all question banks and keep coin rewards across local browser visits. */
(()=>{
'use strict';
const storageKey='cpuEscapePractice';
let coins=0,progress=0,missed=[];
try{
 const saved=JSON.parse(localStorage.getItem(storageKey)||'null');
 if(Array.isArray(saved?.missed))missed=saved.missed.filter(id=>typeof id==='string');
 if(Number.isSafeInteger(saved?.coins)&&saved.coins>=0)coins=saved.coins;
 if(Number.isInteger(saved?.progress)&&saved.progress>=0&&saved.progress<10)progress=saved.progress;
}catch{}
// One-time coin grant for existing and new saves in this browser.
try{
 if(!localStorage.getItem('cpuEscapeCoinGrant10')){
  coins+=10;
  localStorage.setItem(storageKey,JSON.stringify({coins,progress,missed}));
  localStorage.setItem('cpuEscapeCoinGrant10','1');
 }
}catch{}
const nextButton=document.getElementById('review-next');
const question=document.getElementById('review-question'),answers=document.getElementById('review-answers'),feedback=document.getElementById('review-feedback');
const entries=[
 ...cpuQuestions.map((q,index)=>({id:'run-'+index,kind:'run',topic:q.topic,q})),
 ...cpuBossQuestions.map((q,index)=>({id:'boss-'+index,kind:'boss',topic:cpuStages[q.stage].name,q}))
];
let batch=[],questionIndex=0,batchCorrect=0,answered=false,mode='all';
function save(){try{localStorage.setItem(storageKey,JSON.stringify({coins,progress,missed}));}catch{}}
function refreshWallet(){
 for(const id of ['coin-balance','game-coins','review-coins','shop-coins'])document.getElementById(id).textContent='Coins: '+coins;
 document.getElementById('review-progress').value=progress;
 document.getElementById('review-progress-text').textContent=progress+' / 10 correct';
}
function spendCoins(amount){if(!Number.isSafeInteger(amount)||amount<1||coins<amount)return false;coins-=amount;save();refreshWallet();return true;}
function spendCoin(){return spendCoins(1);}
function show(entry){
 if(!entry)return;answered=false;question.textContent=entry.q.question;feedback.textContent='';answers.replaceChildren();
 nextButton.disabled=true;nextButton.textContent=questionIndex===batch.length-1?(batch.length===10?'Start 10 new questions':'Start new questions'):'Next question';
 document.getElementById('review-count').textContent=`Question ${questionIndex+1} / ${batch.length} - ${entry.topic} / ${entry.kind==='boss'?'Boss':'Run'}`;
 entry.q.options.forEach((text,index)=>{
  const button=document.createElement('button');button.type='button';button.textContent=String.fromCharCode(65+index)+'. '+text;
  button.addEventListener('click',()=>{
   if(answered)return;answered=true;const correct=index===entry.q.correctAnswer;let reward='';
   if(correct){batchCorrect++;progress++;if(progress===10){progress=0;const earned=window.cpuCharacter?.has('lane-kiffin')?2:1;coins+=earned;reward=` You earned ${earned} ${earned===1?'coin':'coins'}!`;}save();refreshWallet();}
   [...answers.children].forEach((choice,n)=>{choice.disabled=true;if(n===entry.q.correctAnswer)choice.classList.add('correct');});
   if(!correct)button.classList.add('wrong');
   feedback.textContent=(correct?'Correct. ':'Review this: ')+entry.q.explanation+reward+(questionIndex===batch.length-1?` Batch complete: ${batchCorrect} / ${batch.length} correct.`:'');
   nextButton.disabled=false;
   window.cpuAudio?.effect(correct?'correct':'wrong');
  });answers.append(button);
 });
 if(window.cpuCharacter?.has('student')){let removed=0;[...answers.children].forEach((button,i)=>{if(i!==entry.q.correctAnswer&&removed<2){button.disabled=true;button.classList.add('eliminated');button.setAttribute('aria-label',button.textContent+' (eliminated)');removed++;}});}
}
function newBatch(){
 const shuffled=entries.filter(entry=>mode==='all'||missed.includes(entry.id));
 document.getElementById('review-card').hidden=!shuffled.length;
 if(!shuffled.length){batch=[];answered=false;document.getElementById('review-count').textContent='You have not missed any questions in the game yet.';return;}
 for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 batch=shuffled.slice(0,10);questionIndex=0;batchCorrect=0;show(batch[0]);
}
function next(){
 if(!answered)return;
 if(questionIndex===batch.length-1)newBatch();else{questionIndex++;show(batch[questionIndex]);}
}
nextButton.addEventListener('click',next);
for(const selection of ['all','missed'])document.getElementById('review-'+selection).addEventListener('click',()=>{
 mode=selection;for(const option of ['all','missed'])document.getElementById('review-'+option).setAttribute('aria-pressed',String(option===mode));newBatch();
});
function recordMiss(q){const entry=entries.find(item=>item.q===q);if(entry&&!missed.includes(entry.id)){missed.push(entry.id);save();}}
refreshWallet();newBatch();
window.cpuReview={open(){refreshWallet();newBatch();},recordMiss,close(){},getCoins:()=>coins,getProgress:()=>progress,spendCoin,spendCoins};
})();
