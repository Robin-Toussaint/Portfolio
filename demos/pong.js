(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const WIDTH = canvas.width, HEIGHT = canvas.height;

  // Parameters
  const BALL_R = 8;
  const GRAVITY = 0.45;
  const FRICTION = 0.995;
  const CENTER = { x: WIDTH/2, y: HEIGHT/2 };

  let rings = [];
  let particles = [];
  let ball = { x: CENTER.x, y: 40, vx: (Math.random()-0.5)*2, vy: 0 };
  let running = true;

  function createRings(count = 8) {
    rings = [];
    const startR = 80;
    const gap = 36;
    for (let i=0;i<count;i++){
      const r = startR + i*gap;
      const holeAngle = Math.random() * Math.PI * 2;
      const holeSize = (30 + Math.random()*40) * Math.PI/180; // radians
      rings.push({ radius: r, thickness: 12, holeAngle, holeSize, alive: true, alpha: 1 });
    }
  }

  function resetBall() {
    ball.x = CENTER.x + (Math.random()-0.5)*20;
    ball.y = 20;
    ball.vx = (Math.random()-0.5)*2;
    ball.vy = 0;
    running = true;
  }

  function spawnParticles(x,y,color,amount=18){
    for(let i=0;i<amount;i++){
      const a = Math.random()*Math.PI*2;
      const s = Math.random()*3+1;
      particles.push({ x, y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, life: 60 + Math.random()*30, color });
    }
  }

  function reflectVelocity(vx,vy,nx,ny){
    const dot = vx*nx + vy*ny;
    return { vx: vx - 2*dot*nx, vy: vy - 2*dot*ny };
  }

  function angleDiff(a,b){
    let d = a - b;
    while (d < -Math.PI) d += Math.PI*2;
    while (d > Math.PI) d -= Math.PI*2;
    return d;
  }

  function update() {
    if (running) {
      ball.vy += GRAVITY;
      ball.vx *= FRICTION;
      ball.vy *= FRICTION;
      const prevX = ball.x, prevY = ball.y;
      ball.x += ball.vx;
      ball.y += ball.vy;

      // walls
      if (ball.x - BALL_R < 0) { ball.x = BALL_R; ball.vx = -ball.vx*0.8; }
      if (ball.x + BALL_R > WIDTH) { ball.x = WIDTH - BALL_R; ball.vx = -ball.vx*0.8; }

      // Check rings (outer -> inner)
      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        if (!ring.alive) continue;
        const dx = ball.x - CENTER.x;
        const dy = ball.y - CENTER.y;
        const dist = Math.hypot(dx, dy);
        const within = Math.abs(dist - ring.radius) <= (ring.thickness/2 + BALL_R);
        if (within) {
          const ang = Math.atan2(dy, dx);
          const dAng = Math.abs(angleDiff(ang, ring.holeAngle));
          if (dAng <= ring.holeSize/2) {
            // pass through hole => break
            ring.alive = false;
            spawnParticles(CENTER.x + Math.cos(ring.holeAngle)*ring.radius, CENTER.y + Math.sin(ring.holeAngle)*ring.radius, '#ffcf6b', 26);
          } else {
            // reflect
            const nx = dx / dist; const ny = dy / dist;
            const refl = reflectVelocity(ball.vx, ball.vy, nx, ny);
            ball.vx = refl.vx; ball.vy = refl.vy;
            const overlap = (ring.thickness/2 + BALL_R) - Math.abs(dist - ring.radius);
            const sign = (dist - ring.radius) < 0 ? -1 : 1;
            ball.x += nx * (overlap + 0.5) * sign;
            ball.y += ny * (overlap + 0.5) * sign;
            ball.vx *= 0.9; ball.vy *= 0.9;
          }
        }
      }

      if (ball.y - BALL_R > HEIGHT) {
        running = false;
      }
    }

    // particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += 0.12;
      p.vx *= 0.99; p.vy *= 0.99;
      p.x += p.vx; p.y += p.vy; p.life -= 1;
      if (p.life <= 0) particles.splice(i,1);
    }

    // fade broken rings
    for (let i = rings.length -1; i >=0; i--) {
      const r = rings[i];
      if (!r.alive) {
        r.alpha -= 0.02;
        if (r.alpha <= 0) rings.splice(i,1);
      }
    }
  }

  function draw() {
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    ctx.fillStyle = '#071627'; ctx.fillRect(0,0,WIDTH,HEIGHT);

    // rings
    rings.forEach(r => {
      ctx.save();
      ctx.globalAlpha = r.alpha;
      ctx.beginPath(); ctx.strokeStyle = '#eaeff6'; ctx.lineWidth = r.thickness; ctx.lineCap = 'butt';
      ctx.arc(CENTER.x, CENTER.y, r.radius, 0, Math.PI*2); ctx.stroke();
      // hole
      ctx.beginPath(); ctx.strokeStyle = '#071627'; ctx.lineWidth = r.thickness + 2;
      ctx.arc(CENTER.x, CENTER.y, r.radius, r.holeAngle - r.holeSize/2, r.holeAngle + r.holeSize/2); ctx.stroke();
      ctx.restore();
    });

    // particles
    particles.forEach(p => {
      ctx.fillStyle = p.color || '#ffcf6b';
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life/80));
      ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    });

    // ball
    ctx.beginPath(); ctx.fillStyle = '#ff6b6b'; ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI*2); ctx.fill();

    ctx.fillStyle = '#9aa3b2'; ctx.font = '14px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('Anneaux restants: ' + rings.length, 12, HEIGHT - 12);
    if (!running) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0,0,WIDTH,HEIGHT);
      ctx.fillStyle = '#ffda6b'; ctx.font = '36px sans-serif'; ctx.textAlign='center';
      ctx.fillText('Fin de la chute', WIDTH/2, HEIGHT/2 - 6);
      ctx.font = '16px sans-serif'; ctx.fillStyle = '#dfe6f2'; ctx.fillText('Rejouer pour tenter à nouveau', WIDTH/2, HEIGHT/2 + 18);
    }
  }

  function loop(){ update(); draw(); requestAnimationFrame(loop); }

  // UI
  const restartBtn = document.getElementById('restartBtn');
  const backBtn = document.getElementById('backBtn');
  restartBtn && restartBtn.addEventListener('click', () => { createRings(8); resetBall(); });
  backBtn && backBtn.addEventListener('click', () => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'close-demo' }, '*');
    } else {
      window.history.back();
    }
  });

  // init
  createRings(8);
  resetBall();
  requestAnimationFrame(loop);

})();
