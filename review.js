/* Practice all question banks and keep coin rewards across local browser visits. */
(()=>{
'use strict';
const storageKey='cpuEscapePractice';
let coins=0,progress=0;
try{
 const saved=JSON.parse(localStorage.getItem(storageKey)||'null');
 if(Number.isSafeInteger(saved?.coins)&&saved.coins>=0)coins=saved.coins;
 if(Number.isInteger(saved?.progress)&&saved.progress>=0&&saved.progress<10)progress=saved.progress;
}catch{}
const nextButton=document.getElementById('review-next');
const question=document.getElementById('review-question'),answers=document.getElementById('review-answers'),feedback=document.getElementById('review-feedback');
const entries=[
 ...cpuQuestions.map((q,index)=>({id:'run-'+index,kind:'run',topic:q.topic,q})),
 ...cpuBossQuestions.map((q,index)=>({id:'boss-'+index,kind:'boss',topic:cpuStages[q.stage].name,q}))
];
let batch=[],questionIndex=0,batchCorrect=0,answered=false;
function save(){try{localStorage.setItem(storageKey,JSON.stringify({coins,progress}));}catch{}}
function refreshWallet(){
 for(const id of ['coin-balance','game-coins','review-coins','shop-coins'])document.getElementById(id).textContent='Coins: '+coins;
 document.getElementById('review-progress').value=progress;
 document.getElementById('review-progress-text').textContent=progress+' / 10 correct';
}
function spendCoins(amount){if(!Number.isSafeInteger(amount)||amount<1||coins<amount)return false;coins-=amount;save();refreshWallet();return true;}
function spendCoin(){return spendCoins(1);}
function show(entry){
 if(!entry)return;answered=false;question.textContent=entry.q.question;feedback.textContent='';answers.replaceChildren();
 nextButton.disabled=true;nextButton.textContent=questionIndex===9?'Start 10 new questions':'Next question';
 document.getElementById('review-count').textContent=`Question ${questionIndex+1} / 10 - ${entry.topic} / ${entry.kind==='boss'?'Boss':'Run'}`;
 entry.q.options.forEach((text,index)=>{
  const button=document.createElement('button');button.type='button';button.textContent=String.fromCharCode(65+index)+'. '+text;
  button.addEventListener('click',()=>{
   if(answered)return;answered=true;const correct=index===entry.q.correctAnswer;let reward='';
   if(correct){batchCorrect++;progress++;if(progress===10){progress=0;coins++;reward=' You earned 1 coin!';}save();refreshWallet();}
   [...answers.children].forEach((choice,n)=>{choice.disabled=true;if(n===entry.q.correctAnswer)choice.classList.add('correct');});
   if(!correct)button.classList.add('wrong');
   feedback.textContent=(correct?'Correct. ':'Review this: ')+entry.q.explanation+reward+(questionIndex===9?` Batch complete: ${batchCorrect} / 10 correct.`:'');
   nextButton.disabled=false;
   window.cpuAudio?.effect(correct?'correct':'wrong');
  });answers.append(button);
 });
}
function newBatch(){
 const shuffled=[...entries];
 for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 batch=shuffled.slice(0,10);questionIndex=0;batchCorrect=0;show(batch[0]);
}
function next(){
 if(!answered)return;
 if(questionIndex===9)newBatch();else{questionIndex++;show(batch[questionIndex]);}
}
nextButton.addEventListener('click',next);
refreshWallet();newBatch();
window.cpuReview={open(){refreshWallet();},close(){},getCoins:()=>coins,getProgress:()=>progress,spendCoin,spendCoins};
})();
