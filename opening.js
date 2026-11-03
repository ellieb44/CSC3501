/* Original low-resolution cutscene art, rendered with hard pixel edges. */
(()=>{
const boy=['...hhhh...','..hhhhhh..','..hssss...','..hsees...','...ssss...','..cccccc..','.cccccccc.','..cccccc..','...cccc...','...l..l...','..ll..ll..'];
function draw(ctx,width,height,phase,time,walk=0){const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;ctx.save();ctx.scale(width/320,height/180);ctx.imageSmoothingEnabled=false;const zoomProgress=phase===2&&!reduced?Math.max(0,Math.min(1,(time-3.15)/2.55)):0;const ease=zoomProgress*zoomProgress*(3-2*zoomProgress);const zoomX=Math.exp(Math.log(320/41)*ease),zoomY=Math.exp(Math.log(180/26)*ease);const centerX=160+(224.5-160)*ease,centerY=90+(73-90)*ease;ctx.save();ctx.translate(160,90);ctx.scale(zoomX,zoomY);ctx.translate(-centerX,-centerY);const rect=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
rect(0,0,320,180,'#100e1b');rect(0,125,320,55,'#231b2b');for(let x=0;x<320;x+=32)rect(x,127,1,53,'#372538');rect(0,124,320,2,'#765165');
// Bedroom window, moon, poster, shelves, and striped wallpaper.
for(let x=8;x<320;x+=24)rect(x,0,2,123,'#191525');rect(25,28,55,60,'#4e3f5f');rect(29,32,47,52,'#111b32');rect(57,40,10,10,'#e4d3b8');rect(51,37,9,10,'#111b32');rect(51,32,3,52,'#4e3f5f');rect(29,57,47,3,'#4e3f5f');rect(256,30,29,35,'#6c4d64');rect(259,33,23,29,'#30273e');rect(265,40,10,12,'#8d8ca1');rect(22,105,67,5,'#60414a');rect(30,95,8,10,'#8d7763');rect(42,90,9,15,'#546b70');
const shaking=phase===1||(phase===2&&time<3.15);const shake=!reduced&&shaking?Math.round(Math.sin(time*(phase===2?48:26))*(phase===2?3:1)):0;
// The screen glow grows as the computer starts to pull the boy inside.
rect(176,45,78,67,phase>=1?'#263c45':'#1c2833');rect(183,52,64,53,phase>=1?'#354f53':'#253944');
ctx.save();ctx.translate(shake,0);rect(178,96,90,7,'#826064');rect(183,103,6,35,'#563e4b');rect(256,103,6,35,'#563e4b');rect(200,56,49,35,'#898488');rect(204,60,41,26,phase>=1?'#a8ffd5':'#638c92');rect(220,91,8,5,'#aaa29d');rect(211,95,26,2,'#b4a9a2');rect(260,66,17,30,'#4c4d5a');rect(263,70,10,2,'#84948e');rect(264,88,3,3,'#a8ffd5');rect(200,99,37,3,'#c0b2a6');
if(phase<3){let px=147,py=88,scale=3;if(phase===2){const pull=Math.min(1,time/2.6);px+=pull*64;py-=pull*18;scale=Math.max(.3,3*(1-pull));}ctx.save();ctx.translate(Math.round(px+shake),Math.round(py));if(phase===2)ctx.globalAlpha=Math.max(0,1-time/2.8);boy.forEach((row,y)=>[...row].forEach((c,x)=>{const color={h:'#69424b',s:'#dfac8f',e:'#211b2c',c:'#a8bbdb',l:'#666886'}[c];if(color)rect(x*scale,y*scale,Math.ceil(scale),Math.ceil(scale),color);}));ctx.restore();}
ctx.restore();
if(phase===2){ctx.fillStyle='#a8ffd5';for(let i=0;i<15;i++){const p=(time*.7+i*.17)%1;rect(154+p*75,65+((i*17)%50),2,2,'#a8ffd5');}if(time>2.6&&time<3.5){ctx.globalAlpha=Math.sin((time-2.6)/.9*Math.PI)*.65;rect(204,60,41,26,'#d9ffe8');ctx.globalAlpha=1;}}
function interior(walk=0){rect(0,0,320,180,'#0a1d22');for(let lane=0;lane<8;lane++){const y=18+lane*19;rect(0,y,100+lane*18,2,'#34645a');rect(100+lane*18,y,2,15,'#34645a');rect(100+lane*18,y+15,220,2,'#34645a');}rect(0,134,320,46,'#142b31');rect(0,134,320,2,'#a8ffd5');boy.forEach((row,y)=>[...row].forEach((c,x)=>{const color={h:'#69424b',s:'#dfac8f',e:'#211b2c',c:'#a8bbdb',l:'#666886'}[c];if(color)rect(150+walk*160+x*3,101+y*3+(walk>0&&y>8?Math.floor(time*10)%2*2:0),3,3,color);}));rect(46,116,24,17,'#b26493');rect(50,119,4,4,'#ffecc8');rect(62,119,4,4,'#ffecc8');}
// The monitor becomes a window into the next shot before filling the view.
if(phase===2&&zoomProgress>0){ctx.save();ctx.beginPath();ctx.rect(204,60,41,26);ctx.clip();ctx.globalAlpha=Math.min(1,zoomProgress*2.5);ctx.translate(204,60);ctx.scale(41/320,26/180);interior();ctx.restore();}
ctx.restore();
if(phase>=3)interior(walk);

ctx.fillStyle='#00000018';for(let y=0;y<180;y+=3)ctx.fillRect(0,y,320,1);ctx.restore();}
const home=document.getElementById('opening-art');window.cpuOpening={draw,home(time){if(home){draw(home.getContext('2d'),320,180,0,time);}}};
})();