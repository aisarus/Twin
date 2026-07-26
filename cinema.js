import { TwinSoundscape } from './soundscape.js'
const clamp=(v,a=0,b=1)=>Math.min(Math.max(v,a),b)
const smooth=(a,b,v)=>{const t=clamp((v-a)/Math.max(b-a,.0001));return t*t*(3-2*t)}
const mix=(a,b,t)=>a+(b-a)*t
const frames=[...document.querySelectorAll('.frame')],beats=[...document.querySelectorAll('.beat')],chapterItems=[...document.querySelectorAll('.chapters li')]
const hudScene=document.querySelector('#hud-scene'),soundButton=document.querySelector('#sound-toggle'),textButton=document.querySelector('#text-toggle'),loader=document.querySelector('#loader'),loaderBar=document.querySelector('#loader-bar'),loaderCount=document.querySelector('#loader-count'),loaderPhase=document.querySelector('#loader-phase'),canvas=document.querySelector('#atmosphere'),ctx=canvas.getContext('2d',{alpha:true}),soundscape=new TwinSoundscape()
const names=['SIGNAL','ORIGIN','BREAK','TERRAIN','SYSTEM','ECHO','ASCENT','HORIZON']
const palettes=[[88,125,255],[239,84,184],[130,95,255],[232,58,218],[79,173,255],[196,101,241],[255,118,139],[113,226,255]]
let W=innerWidth,H=innerHeight,dpr=Math.min(devicePixelRatio||1,1.5),target=scrollY,position=scrollY,current=-1,particles=[],last=performance.now(),threeStage=null
function resize(){W=innerWidth;H=innerHeight;dpr=Math.min(devicePixelRatio||1,W<700?1.2:1.5);canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0);particles=Array.from({length:W<700?32:76},()=>({x:Math.random()*W,y:Math.random()*H,z:.2+Math.random()*.8,s:.08+Math.random()*.28,r:.4+Math.random()*1.5,p:Math.random()*6.28}))}
resize();addEventListener('resize',resize)
async function boot3D(){try{const {ThreeNarrativeStage}=await import('./three-stage.js');threeStage=new ThreeNarrativeStage(document.querySelector('#models3d'));document.documentElement.dataset.three='ready'}catch(e){console.warn('[TWIN] 3D layer unavailable; cinematic fallback active.',e);document.documentElement.dataset.three='fallback'}}
boot3D()
const phases=['RECOVERING SIGNAL','OPENING ARCHIVE','MAPPING IDENTITY','CALIBRATING STORY','INITIALIZING TWIN']
let lp=0;const loadTimer=setInterval(()=>{lp=Math.min(100,lp+2+Math.random()*5);loaderBar.style.width=lp+'%';loaderCount.textContent=String(Math.round(lp)).padStart(3,'0');loaderPhase.textContent=phases[Math.min(4,Math.floor(lp/21))];if(lp>=100){clearInterval(loadTimer);setTimeout(()=>{loader.classList.add('loader--done');document.body.classList.add('is-ready');setTimeout(()=>loader.remove(),900)},350)}},70)
function metrics(y){const end=beats.at(-1).offsetTop+beats.at(-1).offsetHeight-H,p=clamp(y/Math.max(end,1)),f=p*(frames.length-1),i=Math.min(7,Math.floor(f+.0001));return{progress:p,float:f,index:i,local:f%1}}
function update(m){const {progress,float,index,local}=m,tr=smooth(.62,.96,local)*(index<7?1:0),next=Math.min(index+1,7),pt=smooth(.48,.94,local),c=palettes[index].map((v,i)=>Math.round(mix(v,palettes[next][i],pt)))
 document.documentElement.style.setProperty('--global-progress',progress.toFixed(4));document.documentElement.style.setProperty('--transition',tr.toFixed(4));document.documentElement.style.setProperty('--accent-rgb',c.join(','));document.body.dataset.scene=index
 frames.forEach((f,i)=>{const o=smooth(0,1,clamp(1-Math.abs(float-i))),l=clamp(float-i+.5),ci=smooth(.03,.22,l)*(1-smooth(.78,.98,l));f.style.setProperty('--opacity',o.toFixed(4));f.style.setProperty('--local',l.toFixed(4));f.style.setProperty('--copy-opacity',(o*ci).toFixed(4));f.dataset.visible=o>.006})
 if(index!==current){current=index;hudScene.textContent=String(index+1).padStart(2,'0')+' / '+names[index];chapterItems.forEach((x,i)=>x.classList.toggle('is-active',i===index))}
 soundscape.setProgress(progress);threeStage?.setProgress(progress)
}
function draw(t,m){ctx.clearRect(0,0,W,H);const n=Math.min(m.index+1,7),pt=smooth(.45,.95,m.local),c=palettes[m.index].map((v,i)=>mix(v,palettes[n][i],pt)),tr=smooth(.6,.98,m.local);ctx.globalCompositeOperation='lighter';for(const p of particles){p.y-=p.s*(1+tr*3)*p.z;p.x+=Math.sin(t*.00025+p.p)*.08*p.z;if(p.y<-12){p.y=H+12;p.x=Math.random()*W}const a=(.06+p.z*.22)*(1+tr*.7);ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${a})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r*p.z,0,6.28);ctx.fill();if(tr>.15&&p.z>.62){ctx.strokeStyle=`rgba(${c[0]},${c[1]},${c[2]},${a*tr*.6})`;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x,p.y+16*tr*p.z);ctx.stroke()}}
 const g=ctx.createRadialGradient(W*.7,H*.5,0,W*.7,H*.5,W*(.12+tr*.08));g.addColorStop(0,`rgba(${c[0]},${c[1]},${c[2]},${.07+tr*.15})`);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
function tick(t){const d=Math.min((t-last)/16.67,3);last=t;position+=(target-position)*(1-Math.pow(.82,d));const m=metrics(position);update(m);draw(t,m);requestAnimationFrame(tick)}
addEventListener('scroll',()=>target=scrollY,{passive:true});requestAnimationFrame(tick)
soundButton.addEventListener('click',async()=>{try{const e=await soundscape.toggle();soundButton.textContent='SOUND / '+(e?'ON':'OFF');soundButton.setAttribute('aria-pressed',e)}catch{soundButton.textContent='SOUND / N/A';soundButton.disabled=true}})
const max=localStorage.getItem('twin-text-max')==='true';document.documentElement.classList.toggle('text-max',max);textButton.textContent='TEXT / '+(max?'MAX':'STD');textButton.addEventListener('click',()=>{const e=!document.documentElement.classList.contains('text-max');document.documentElement.classList.toggle('text-max',e);localStorage.setItem('twin-text-max',e);textButton.textContent='TEXT / '+(e?'MAX':'STD')})
