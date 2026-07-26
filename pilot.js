const clamp=(v,a=0,b=1)=>Math.min(Math.max(v,a),b)
const smooth=(a,b,v)=>{const t=clamp((v-a)/Math.max(b-a,.0001));return t*t*(3-2*t)}
const mix=(a,b,t)=>a+(b-a)*t
const stage=document.querySelector('.pilot-stage')
const source=document.querySelector('.source-figure')
const reflection=document.querySelector('.reflection')
const twin=document.querySelector('.twin-figure')
const burst=document.querySelector('.gold-burst')
const panels=[...document.querySelectorAll('.memory-panels .panel')]
const beats=[...document.querySelectorAll('.copy-beat')]
const progressFill=document.querySelector('#progress-fill')
const progressLabel=document.querySelector('#progress-label')
let target=0,current=0,activeBeat=-1

function getProgress(){
  const rect=stage.getBoundingClientRect()
  const travel=Math.max(stage.offsetHeight-innerHeight,1)
  return clamp(-rect.top/travel)
}

function setBeat(index){
  if(index===activeBeat)return
  activeBeat=index
  beats.forEach((beat,i)=>beat.classList.toggle('is-active',i===index))
}

function render(){
  target=getProgress()
  current+=(target-current)*.085
  const p=current

  const personX=700+smooth(.03,.22,p)*5
  source.style.transform=`translate(${personX-705}px,${(1-smooth(.02,.19,p))*34}px)`
  source.style.opacity=String(smooth(.01,.08,p))

  panels.forEach((panel,i)=>{
    const start=.13+i*.045
    const wake=smooth(start,start+.11,p)
    panel.style.opacity=String(wake)
    panel.style.transform=`translateY(${(1-wake)*18}px)`
  })

  const reflectionWake=smooth(.33,.46,p)
  const lag=1-smooth(.47,.61,p)
  const reflectionX=705+Math.sin(p*26)*18*lag
  reflection.style.opacity=String(reflectionWake*(1-smooth(.61,.73,p)))
  reflection.style.transform=`translateX(${reflectionX-705}px) scaleY(${.72+.28*reflectionWake})`

  const rise=smooth(.58,.76,p)
  const separate=smooth(.69,.86,p)
  twin.style.opacity=String(rise)
  twin.style.transform=`translate(${mix(-190,0,separate)}px,${mix(180,0,rise)}px) scale(${.78+.22*rise})`

  const flash=smooth(.78,.86,p)*(1-smooth(.91,.98,p))
  burst.style.opacity=String(flash)
  burst.style.transform=`scale(${.35+flash*.9})`

  const beat=p<.16?0:p<.37?1:p<.58?2:p<.79?3:4
  setBeat(beat)
  progressFill.style.width=`${Math.round(p*100)}%`
  progressLabel.textContent=String(Math.round(p*100)).padStart(2,'0')
  document.documentElement.style.setProperty('--pilot-progress',p.toFixed(4))
  requestAnimationFrame(render)
}

beats[0]?.classList.add('is-active')
requestAnimationFrame(render)
