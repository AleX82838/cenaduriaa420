// particles.js - partículas cyberpunk neón (verde, azul, magenta)
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d', { alpha: true });

let w = canvas.width = window.innerWidth;
let h = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  initParticles();
});

const palette = ['#00ff6a', '#00e5ff', '#ff4de6']; // verde, azul, magenta
let particles = [];

function rand(min, max) { return Math.random() * (max - min) + min; }

function createParticle(i) {
  return {
    id: i,
    x: Math.random() * w,
    y: Math.random() * h,
    vx: rand(-0.3, 0.3),
    vy: rand(-0.3, 0.3),
    r: rand(0.6, 2.6),
    color: palette[Math.floor(Math.random() * palette.length)],
    phase: rand(0, Math.PI * 2)
  };
}

function initParticles() {
  const count = Math.max(60, Math.floor((w * h) / 80000)); // adaptativo
  particles = Array.from({ length: count }, (_, i) => createParticle(i));
}

function loopParticles() {
  ctx.clearRect(0, 0, w, h);

  // subtle radial glow to center
  const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.05, w / 2, h / 2, Math.max(w, h));
  grad.addColorStop(0, 'rgba(0,0,0,0.0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  for (let p of particles) {
    // oscillate slightly
    p.x += p.vx + Math.sin(p.phase + performance.now() / 4000) * 0.08;
    p.y += p.vy + Math.cos(p.phase + performance.now() / 3500) * 0.08;
    p.phase += 0.002;

    // wrap
    if (p.x < -10) p.x = w + 10;
    if (p.x > w + 10) p.x = -10;
    if (p.y < -10) p.y = h + 10;
    if (p.y > h + 10) p.y = -10;

    // draw glow
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.globalAlpha = 0.9;
    ctx.shadowBlur = p.r * 6;
    ctx.shadowColor = p.color;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();

    // occasional streak
    if (Math.random() < 0.015) {
      ctx.globalAlpha = 0.06;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.vx * 8, p.y + p.vy * 8);
      ctx.stroke();
    }
  }

  // subtle connecting lines
  for (let i = 0; i < particles.length; i += 7) {
    const a = particles[i];
    for (let j = i + 1; j < i + 4 && j < particles.length; j++) {
      const b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 10000) {
        ctx.globalAlpha = 0.02 + (10000 - d2) / 10000 * 0.06;
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  ctx.globalAlpha = 1;
  requestAnimationFrame(loopParticles);
}

// init
initParticles();
loopParticles();
