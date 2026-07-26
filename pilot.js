const root=document.documentElement
const pilot=document.querySelector('.pilot')
const cards=[...document.querySelectorAll('.pilot-card')]
const loader=document.querySelector('.pilot-loader')
const clamp=(v,a=0,b=1)=>Math.min(Math.max(v,a),b)
const smooth=(a,b,v)=>{const t=clamp((v-a)/Math.max(b-a,.0001));return t*t*(3-2*t)}
let target=0,current=0,raf=0

function storyProgress(){
  const rect=pilot.getBoundingClientRect()
  const travel=Math.max(pilot.offsetHeight-innerHeight,1)
  return clamp(-rect.top/travel)
}

function setCard(progress){
  const cues=[0,.19,.43,.68,.87]
  let active=0
  for(let i=0;i<cues.length;i++) if(progress>=cues[i]) active=i
  cards.forEach((card,index)=>card.classList.toggle('is-active',index===active))
}

function render(){
  current+=(target-current)*.085
  const memory=smooth(.08,.34,current)*(1-smooth(.73,.95,current)*.2)
  const reflection=smooth(.20,.42,current)*(1-smooth(.55,.73,current))
  const rise=smooth(.44,.70,current)
  const sync=smooth(.70,.86,current)
  const gold=smooth(.82,.96,current)
  root.style.setProperty('--p',current.toFixed(4))
  root.style.setProperty('--memory',memory.toFixed(4))
  root.style.setProperty('--reflection',reflection.toFixed(4))
  root.style.setProperty('--rise',rise.toFixed(4))
  root.style.setProperty('--sync',sync.toFixed(4))
  root.style.setProperty('--gold',gold.toFixed(4))
  setCard(current)
  if(Math.abs(target-current)>.0002) raf=requestAnimationFrame(render)
  else raf=0
}

function update(){
  target=storyProgress()
  if(!raf) raf=requestAnimationFrame(render)
}

addEventListener('scroll',update,{passive:true})
addEventListener('resize',update)
addEventListener('pointermove',event=>{
  root.style.setProperty('--pointer-x',(event.clientX/innerWidth-.5).toFixed(3))
  root.style.setProperty('--pointer-y',(event.clientY/innerHeight-.5).toFixed(3))
},{passive:true})

setTimeout(()=>loader.classList.add('is-done'),850)
update()
