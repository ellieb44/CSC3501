/* Timed text reveal; original synth voice and full-text accessibility label. */
(()=>{const jobs=new Map();
function clear(){for(const [el] of jobs){el.removeAttribute?.('aria-busy');}jobs.clear();}
function finish(el){const job=jobs.get(el);if(!job)return;el.textContent=job.text;el.setAttribute('aria-busy','false');jobs.delete(el);}
function write(el,text){jobs.delete(el);el.setAttribute('aria-label',text);if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){el.textContent=text;return;}el.textContent='';el.setAttribute('aria-busy','true');jobs.set(el,{text,index:0,wait:0});}
function update(dt){if(document.hidden)return;let voiced=false;for(const [el,job] of jobs){if(el.isConnected===false){jobs.delete(el);continue;}job.wait-=dt;while(job.wait<=0&&job.index<job.text.length){const c=job.text[job.index++];el.textContent=job.text.slice(0,job.index);job.wait+=/[.!?]/.test(c)?.12:/[,;:]/.test(c)?.07:.028;if(!voiced&&/[^\s.,!?;:]/.test(c)){window.cpuAudio?.voice();voiced=true;}}if(job.index>=job.text.length)finish(el);}}
for(const id of ['description','feedback'])document.getElementById(id).addEventListener('click',()=>finish(document.getElementById(id)));
window.cpuDialogue={write,update,clear,finish};
})();