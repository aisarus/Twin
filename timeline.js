(() => {
  const root = document.documentElement;
  const film = document.querySelector('.film');
  const boot = document.querySelector('.boot');
  const timecode = document.querySelector('#timecode');
  const subtitle = document.querySelector('#subtitle');
  const beats = [...document.querySelectorAll('.beat')];

  const DURATION = 32;
  const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (start, end, value) => {
    const t = clamp((value - start) / Math.max(end - start, 0.0001));
    return t * t * (3 - 2 * t);
  };
  const range = (time, start, end) => smooth(start, end, time);
  const windowed = (time, enterStart, enterEnd, exitStart, exitEnd) => range(time, enterStart, enterEnd) * (1 - range(time, exitStart, exitEnd));

  const subtitles = [
    [0, 4, 'The archive is silent.'],
    [4, 9, 'Footsteps enter the record.'],
    [9, 14, 'The room recognizes the cadence before the face.'],
    [14, 19, 'He stops. The reflection completes one more step.'],
    [19, 25, 'The delayed image leaves the floor.'],
    [25, 29, 'For the first time, the pattern looks back.'],
    [29, 32.1, 'You left a pattern capable of returning.']
  ];

  const beatCuts = [0, 4.2, 9.2, 14.1, 19.2, 25.2];
  let target = 0;
  let current = 0;
  let raf = 0;

  function scrollProgress() {
    const rect = film.getBoundingClientRect();
    const travel = Math.max(film.offsetHeight - innerHeight, 1);
    return clamp(-rect.top / travel);
  }

  function formatTime(seconds) {
    const totalMs = Math.round(seconds * 1000);
    const minutes = Math.floor(totalMs / 60000);
    const secs = Math.floor((totalMs % 60000) / 1000);
    const ms = totalMs % 1000;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  }

  function activeBeat(time) {
    let index = 0;
    beatCuts.forEach((cut, i) => { if (time >= cut) index = i; });
    beats.forEach((beat, i) => beat.classList.toggle('is-active', i === index));
  }

  function activeSubtitle(time) {
    const cue = subtitles.find(([start, end]) => time >= start && time < end) || subtitles[subtitles.length - 1];
    if (subtitle.textContent !== cue[2]) subtitle.textContent = cue[2];
  }

  function render() {
    current += (target - current) * 0.085;
    const time = current * DURATION;

    const door = range(time, 1.8, 4.2);
    const walkA = range(time, 3.9, 8.8);
    const walkB = range(time, 14.2, 15.55);
    const humanX = lerp(170, 620, walkA) + lerp(0, 32, walkB);
    const humanScale = lerp(0.58, 0.72, walkA);
    const walking = windowed(time, 3.8, 4.1, 8.55, 8.95) + windowed(time, 14.05, 14.22, 15.35, 15.65);
    const cadence = Math.sin(time * 7.2) * walking;
    const stepLeft = cadence * 8;
    const stepRight = cadence * -8;
    const bob = Math.abs(Math.sin(time * 7.2)) * walking * -5;

    const memory = range(time, 7.7, 13.2);
    const reflection = range(time, 12.8, 15.0);
    const reflectionWalk = range(time, 14.8, 16.35);
    const reflectionX = lerp(170, 620, walkA) + lerp(0, 32, reflectionWalk);
    const rise = range(time, 18.9, 24.7);
    const gold = range(time, 22.5, 25.3);
    const firstLook = range(time, 25.0, 28.2);
    const final = range(time, 28.9, 31.3);

    const cameraScale = lerp(1, 1.075, range(time, 3.5, 9.0)) + lerp(0, 0.085, range(time, 19.0, 27.5));
    const cameraX = lerp(0, -34, range(time, 4.0, 9.0)) + lerp(0, 24, range(time, 19.0, 25.0));
    const cameraY = lerp(0, 15, range(time, 18.5, 25.0));

    root.style.setProperty('--progress', current.toFixed(5));
    root.style.setProperty('--time', time.toFixed(3));
    root.style.setProperty('--door', door.toFixed(4));
    root.style.setProperty('--memory', memory.toFixed(4));
    root.style.setProperty('--reflection', reflection.toFixed(4));
    root.style.setProperty('--rise', rise.toFixed(4));
    root.style.setProperty('--gold', gold.toFixed(4));
    root.style.setProperty('--final', final.toFixed(4));
    root.style.setProperty('--source-x', `${humanX.toFixed(2)}px`);
    root.style.setProperty('--source-scale', humanScale.toFixed(4));
    root.style.setProperty('--reflection-x', `${reflectionX.toFixed(2)}px`);
    root.style.setProperty('--camera-x', `${cameraX.toFixed(2)}px`);
    root.style.setProperty('--camera-y', `${cameraY.toFixed(2)}px`);
    root.style.setProperty('--camera-scale', cameraScale.toFixed(4));
    root.style.setProperty('--step-left', `${stepLeft.toFixed(2)}deg`);
    root.style.setProperty('--step-right', `${stepRight.toFixed(2)}deg`);
    root.style.setProperty('--bob', `${bob.toFixed(2)}px`);
    root.style.setProperty('--turn', `${lerp(0, 2.8, firstLook).toFixed(2)}deg`);
    root.style.setProperty('--twin-turn', `${lerp(-4.5, -1.5, firstLook).toFixed(2)}deg`);

    timecode.textContent = formatTime(time);
    activeBeat(time);
    activeSubtitle(time);

    if (Math.abs(target - current) > 0.00004) raf = requestAnimationFrame(render);
    else raf = 0;
  }

  function update() {
    target = scrollProgress();
    if (!raf) raf = requestAnimationFrame(render);
  }

  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  setTimeout(() => boot.classList.add('is-done'), 900);
  update();
})();
