

const arena     = document.getElementById('arena');
const form      = document.getElementById('intakeForm');
const sneakyBtn = document.getElementById('sneakyBtn');
const btnFace   = document.getElementById('btnFace');
const logBar    = document.getElementById('log');
const logText   = document.getElementById('logText');
const logCount  = document.getElementById('logCount');
const cleared   = document.getElementById('cleared');
const resetBtn  = document.getElementById('resetBtn');

const EDGE_PAD  = 14;   
const NEAR_MISS = 48;   
const SAMPLES   = 16;  

let trapArmed        = false;          
let dodgeCoordinates = { x: 0, y: 0 };
let dodgeTally       = 0;


const trashTalk = [
  'Missed. Try again.',
  'Mouse skills: unconvincing.',
  'You know this is the test, right?',
  'Aim is not a hireable skill.',
  'Round one rewards reading, not reflexes.',
  'F12. It has its own key on your keyboard.'
];

const faceSwaps = ['Nope', 'Missed', 'Too slow', 'Warmer…', 'lol', 'Submit*'];

const between = (lo, hi) => lo + Math.random() * (hi - lo);



function plotEscapeRoute(pointerX, pointerY) {
  const homeX = sneakyBtn.offsetLeft;
  const homeY = sneakyBtn.offsetTop;
  const w     = sneakyBtn.offsetWidth;
  const h     = sneakyBtn.offsetHeight;

  const minX = EDGE_PAD - homeX;
  const maxX = arena.clientWidth  - EDGE_PAD - w - homeX;
  const minY = EDGE_PAD - homeY;
  const maxY = arena.clientHeight - EDGE_PAD - h - homeY;

  const canRunX = maxX > minX;
  const canRunY = maxY > minY;
  if (!canRunX && !canRunY) return { x: 0, y: 0 };

  const stage = arena.getBoundingClientRect();
  const px = pointerX - stage.left;      
  const py = pointerY - stage.top;

  let winner  = { x: 0, y: 0 };
  let bestGap = -1;

  for (let i = 0; i < SAMPLES; i++) {
    const spot = {
      x: canRunX ? between(minX, maxX) : 0,
      y: canRunY ? between(minY, maxY) : 0
    };
    const gap = Math.hypot(
      homeX + spot.x + w / 2 - px,
      homeY + spot.y + h / 2 - py
    );
    if (gap > bestGap) { bestGap = gap; winner = spot; }
  }
  return winner;
}

function scram(pointerX, pointerY) {
  if (!trapArmed) return standDown();

  dodgeCoordinates = plotEscapeRoute(pointerX, pointerY);
  sneakyBtn.style.transform = `translate(${dodgeCoordinates.x}px, ${dodgeCoordinates.y}px)`;

  dodgeTally++;
  logCount.textContent = 'dodges ' + String(dodgeTally).padStart(2, '0');
  logBar.classList.add('hot');
  say(trashTalk[Math.min(dodgeTally - 1, trashTalk.length - 1)]);


  btnFace.textContent = faceSwaps[Math.min(dodgeTally - 1, faceSwaps.length - 1)];
}


function standDown() {
  if (sneakyBtn.classList.contains('tamed')) return;
  sneakyBtn.classList.add('tamed');
  btnFace.textContent = 'Submit application';
  logBar.classList.add('hot');
  say('Trap disarmed. Go ahead.');
}



sneakyBtn.addEventListener('mouseenter', (e) => scram(e.clientX, e.clientY));


sneakyBtn.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse') return;     
  scram(e.clientX, e.clientY);
});


arena.addEventListener('pointermove', (e) => {
  if (!trapArmed) return;
  const box = sneakyBtn.getBoundingClientRect();
  const dx  = Math.max(box.left - e.clientX, 0, e.clientX - box.right);
  const dy  = Math.max(box.top  - e.clientY, 0, e.clientY - box.bottom);
  if (Math.hypot(dx, dy) < NEAR_MISS) scram(e.clientX, e.clientY);
});

sneakyBtn.addEventListener('focus', () => {
  if (trapArmed) setTimeout(() => sneakyBtn.blur(), 0);
});

form.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || !trapArmed) return;
  e.preventDefault();
  logBar.classList.add('hot');
  say('Enter is on sabbatical.');
});


if ('ResizeObserver' in window) {
  new ResizeObserver(() => {
    if (dodgeCoordinates.x || dodgeCoordinates.y) clampToArena();
  }).observe(arena);
}


function clampToArena() {
  const homeX = sneakyBtn.offsetLeft;
  const homeY = sneakyBtn.offsetTop;
  const fit = (v, lo, hi) => (hi > lo ? Math.min(Math.max(v, lo), hi) : 0);

  dodgeCoordinates = {
    x: fit(dodgeCoordinates.x, EDGE_PAD - homeX,
           arena.clientWidth  - EDGE_PAD - sneakyBtn.offsetWidth  - homeX),
    y: fit(dodgeCoordinates.y, EDGE_PAD - homeY,
           arena.clientHeight - EDGE_PAD - sneakyBtn.offsetHeight - homeY)
  };
  sneakyBtn.style.transform = `translate(${dodgeCoordinates.x}px, ${dodgeCoordinates.y}px)`;
}



form.addEventListener('submit', (e) => {
  e.preventDefault();          

  const data   = new FormData(form);
  const name   = (data.get('name') || '').toString().trim();
  const rollNo = (data.get('roll')   || '').toString().trim().toUpperCase();

  document.getElementById('rCandidate').textContent = name;
  document.getElementById('rCode').textContent      = clearanceCode(rollNo);

  document.getElementById('clearedDeck').textContent = dodgeTally
    ? `Filed for ${rollNo} after ${dodgeTally} failed ${dodgeTally === 1 ? 'grab' : 'grabs'} at the button. Reading the source was the shortcut all along.`
    : `Filed for ${rollNo}. Not a single wasted click — someone came in already knowing.`;

  console.log(
    '%c ✔ Filter cleared. Welcome to round two. ',
    'background:#FFC107;color:#3A2E00;padding:6px 12px;border-radius:6px;font-weight:700'
  );

  arena.classList.add('vanish');
  setTimeout(() => {
    arena.hidden   = true;
    cleared.hidden = false;
  }, 420);
});


function clearanceCode(seed) {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) + h + seed.charCodeAt(i)) | 0;
  return 'EC-' + Math.abs(h).toString(36).toUpperCase().padStart(6, '0').slice(0, 6);
}




resetBtn.addEventListener('click', () => {
  trapArmed  = true;               
  dodgeTally = 0;
  sneakyBtn.classList.remove('tamed');
  btnFace.textContent  = 'Submit application';
  logCount.textContent = 'dodges 00';
  logBar.classList.remove('hot');
  logText.textContent  = 'Standing by.';
  goHome();
  form.reset();

  cleared.hidden = true;
  arena.hidden   = false;
  void arena.offsetWidth;           
  arena.classList.remove('vanish');
});

function goHome() {
  dodgeCoordinates = { x: 0, y: 0 };
  sneakyBtn.style.transform = 'translate(0px, 0px)';
}
let sayTimer;
function say(msg) {
  if (logText.textContent === msg) return;
  clearTimeout(sayTimer);
  logBar.classList.add('blink');
  sayTimer = setTimeout(() => {
    logText.textContent = msg;
    logBar.classList.remove('blink');
  }, 180);
}


console.log(
  '%c Engineering Council — Intake \'26 ',
  'background:#333;color:#FFC107;padding:8px 14px;border-radius:6px;font-weight:700;font-size:13px'
);
console.log(
  '%cThe button will never let you catch it. That is not a bug, it is question one.\n' +
  'You are already in the right place. Something in this file is holding the lock.\n' +
  'Find it. Turn it. Then submit like a normal person.',
  'color:#6E6B62;font-size:12px;line-height:1.7'
);
