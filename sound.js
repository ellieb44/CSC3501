/* Original Web Audio compositions: no sampled game music or sound effects. */
(()=>{
const tracks={
home:{name:'Bedroom / Before the Signal',bpm:78,wave:'triangle',bass:[45,41,48,43],melody:[69,0,72,0,76,0,72,71,67,0,71,0,74,0,71,0],drums:0},
map:{name:'Circuit Atlas',bpm:104,wave:'triangle',bass:[48,53,45,43],melody:[72,76,79,0,76,74,72,0,69,72,76,0,74,71,67,0],drums:1},
0:{name:'CPU / Boot Run',bpm:126,wave:'square',bass:[36,43,41,43],melody:[60,67,72,67,63,67,75,67,60,67,72,79,75,72,67,63],drums:2},
1:{name:'Control Unit / Signal Orders',bpm:132,wave:'square',bass:[38,38,41,45],melody:[74,0,69,74,77,0,74,69,72,0,67,72,76,74,72,69],drums:3},
2:{name:'Registers / Bit Vault',bpm:140,wave:'triangle',bass:[40,43,47,43],melody:[76,79,83,79,76,0,71,0,74,78,81,78,74,0,71,0],drums:2},
3:{name:'ALU / Logic Reactor',bpm:148,wave:'sawtooth',bass:[33,33,36,40],melody:[69,72,76,69,79,76,72,76,68,71,76,68,80,76,71,76],drums:3},
4:{name:'Cache / Fast Lane',bpm:156,wave:'triangle',bass:[41,48,45,43],melody:[77,81,84,88,84,81,77,72,76,79,83,86,83,79,76,71],drums:2},
5:{name:'Clock / Last Cycle',bpm:144,wave:'square',bass:[38,45,46,41],melody:[74,81,74,86,77,81,77,89,72,79,72,84,76,79,81,86],drums:4}
};
let lastVoice=-1,voiceIndex=0;
let audio,master,musicBus,timer,enabled=true,scene='home',beat=0,nextBeat=0;const button=document.getElementById('music');
function tone(midi,duration,type,volume,offset=0,bus=master){if(!audio||!enabled||document.hidden)return;const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+offset;o.type=type;o.frequency.value=440*2**((midi-69)/12);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(volume,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(bus);o.start(t);o.stop(t+duration+.02);}
function makeBus(){if(!audio)return;if(musicBus){musicBus.gain.cancelScheduledValues(audio.currentTime);musicBus.gain.setTargetAtTime(0,audio.currentTime,.04);}musicBus=audio.createGain();musicBus.gain.value=1;musicBus.connect(master);}
function setScene(value){const key=String(value);if(!Object.hasOwn(tracks,key))return;if(scene===key)return;scene=key;beat=0;nextBeat=audio?.currentTime??0;makeBus();}
function pulse(){if(!audio||!enabled||document.hidden||audio.state==='suspended')return;const track=tracks[scene],t=audio.currentTime;if(t<nextBeat)return;nextBeat=t+60/track.bpm/4;const n=track.melody[beat%track.melody.length];if(n)tone(n,.16,track.wave,track.wave==='sawtooth'?.014:.023,0,musicBus);if(beat%4===0)tone(track.bass[Math.floor(beat/16)%4],.32,'triangle',.055,0,musicBus);if(track.drums&&beat%4===0)tone(30,.07,'sine',.08,0,musicBus);if(track.drums>=2&&beat%2===0)tone(104,.018,'square',.006,0,musicBus);if(track.drums===3&&beat%8===4)tone(55,.06,'triangle',.035,0,musicBus);if(track.drums===4)tone(beat%4===0?96:84,.022,'square',.008,0,musicBus);beat++;}
function start(){try{if(!audio){audio=new (window.AudioContext||window.webkitAudioContext)();master=audio.createGain();master.gain.value=enabled?.7:0;master.connect(audio.destination);makeBus();}audio.resume().catch(()=>{});timer??=setInterval(pulse,20);}catch{button.textContent='AUDIO UNAVAILABLE';}}
function effect(kind){if(['click','navigate','jump'].includes(kind)){tone(kind==='jump'?79:kind==='navigate'?77:88,.045,'square',.013);return;}const notes={stuck:[84,79,75,70,65,60],portal:[60,64,67,72,76,79,84,91],arrival:[72,79,84,88,91],correct:[79,84,88],wrong:[67,63,58],clear:[72,76,79,84,88,91]}[kind]||[84];notes.forEach((m,i)=>tone(m,.11,'square',.025,i*.075));}
button.addEventListener('click',()=>{enabled=!enabled;button.textContent=enabled?'Sound on':'Sound off';button.setAttribute('aria-pressed',String(enabled));if(enabled)start();if(master)master.gain.setTargetAtTime(enabled?.7:0,audio.currentTime,.025);});
document.getElementById('home').addEventListener('pointerdown',start,{once:true});
function voice(){if(!audio||audio.currentTime-lastVoice<.024)return;lastVoice=audio.currentTime;tone([71,72,71,74][voiceIndex++%4],.032,'square',.011);}
// Capture handles dynamic buttons too; native keyboard activation also emits click.
document.addEventListener('click',e=>{const control=e.target.closest?.('button, summary, a, input, select, #opening-art, #description, #feedback, #map-canvas');if(!control||control.disabled||control.closest?.('[inert]'))return;start();effect('click');},true);
window.cpuAudio={start,setScene,effect,voice,cue:()=>effect('correct')};
})();