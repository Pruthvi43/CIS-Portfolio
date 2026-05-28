// ── CURSOR ──
const cursor = document.getElementById('cursor');

window.addEventListener('mousemove', (e) => {

    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

});

window.addEventListener('mousedown', () => {
    cursor.classList.add('clicking');
});

window.addEventListener('mouseup', () => {
    cursor.classList.remove('clicking');
});

// ── ANIMATED BACKGROUND ──
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// Floating particles
const particles = Array.from({length: 55}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.8 + 0.4,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    alpha: Math.random() * 0.4 + 0.1,
    type: Math.random() < 0.3 ? 'cross' : 'dot'
}));

// ECG lines
const ECG_LINES = 4;
const ecgLines = Array.from({length: ECG_LINES}, (_, i) => ({
    y: canvas.height * (0.15 + i * 0.22),
    phase: Math.random() * 200,
    speed: 0.6 + Math.random() * 0.4,
    alpha: 0.06 + Math.random() * 0.06
}));

let dnaAngle = 0;

function drawECG(line) {
    ctx.strokeStyle = `rgba(100, 255, 218, ${line.alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    let drawing = false;
    for (let x = 0; x < canvas.width; x += 2) {
        const seg = ((x + line.phase) % 160);
        let dy = 0;
        if (seg < 20)       { dy = 0; }
        else if (seg < 25)  { dy = -8 * ((seg - 20) / 5); }
        else if (seg < 30)  { dy = -8 + 22 * ((seg - 25) / 5); }
        else if (seg < 35)  { dy = 14 - 14 * ((seg - 30) / 5); }
        else if (seg < 45)  { dy = -3 * Math.sin((seg - 35) / 10 * Math.PI); }
        else                { dy = 0; }

        if (!drawing) { ctx.moveTo(x, line.y + dy); drawing = true; }
        else ctx.lineTo(x, line.y + dy);
    }
    ctx.stroke();
    line.phase += line.speed;
}

function drawDNA() {
    const cx = canvas.width * 0.92;
    const segments = 18;
    const segH = 22;
    const amplitude = 18;
    const totalH = segments * segH;
    const startY = canvas.height * 0.5 - totalH / 2;

    for (let i = 0; i < segments; i++) {
        const y = startY + i * segH;
        const angle = dnaAngle + i * 0.45;
        const x1 = cx + Math.cos(angle) * amplitude;
        const x2 = cx - Math.cos(angle) * amplitude;
        const alpha = 0.04 + Math.abs(Math.cos(angle)) * 0.07;

        if (i > 0) {
            const py = startY + (i - 1) * segH;
            const pAngle = dnaAngle + (i - 1) * 0.45;
            const px1 = cx + Math.cos(pAngle) * amplitude;
            ctx.strokeStyle = `rgba(100,255,218,${alpha * 0.8})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px1, py);
            ctx.lineTo(x1, y);
            ctx.stroke();
        }

        const rungAlpha = Math.abs(Math.cos(angle)) * 0.09;
        if (rungAlpha > 0.01) {
            ctx.strokeStyle = `rgba(100,255,218,${rungAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(x1, y);
            ctx.lineTo(x2, y);
            ctx.stroke();
        }
    }

    for (let i = 1; i < segments; i++) {
        const y = startY + i * segH;
        const angle = dnaAngle + i * 0.45;
        const x2 = cx - Math.cos(angle) * amplitude;
        const py = startY + (i - 1) * segH;
        const pAngle = dnaAngle + (i - 1) * 0.45;
        const px2 = cx - Math.cos(pAngle) * amplitude;
        const alpha = 0.04 + Math.abs(Math.cos(angle)) * 0.06;
        ctx.strokeStyle = `rgba(150,220,255,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px2, py);
        ctx.lineTo(x2, y);
        ctx.stroke();
    }
}

function drawCross(x, y, size, alpha) {
    ctx.strokeStyle = `rgba(100,255,218,${alpha})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x - size, y); ctx.lineTo(x + size, y);
    ctx.moveTo(x, y - size); ctx.lineTo(x, y + size);
    ctx.stroke();
}

function drawParticles() {
    particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        if (p.type === 'cross') {
            drawCross(p.x, p.y, p.r * 3, p.alpha);
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(100,255,218,${p.alpha})`;
            ctx.fill();
        }
    });
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(100,255,218,0.025)';
    ctx.lineWidth = 0.5;
    const cellW = 60, cellH = 60;
    for (let x = 0; x < canvas.width; x += cellW) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += cellH) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
}

function drawCircleOrnament() {
    const ornaments = [
        { x: canvas.width * 0.08, y: canvas.height * 0.25, r: 70 },
        { x: canvas.width * 0.88, y: canvas.height * 0.75, r: 55 },
        { x: canvas.width * 0.5,  y: canvas.height * 0.05, r: 90 },
    ];
    ornaments.forEach(o => {
        ctx.strokeStyle = 'rgba(100,255,218,0.04)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(o.x, o.y, o.r * 0.6, 0, Math.PI * 2); ctx.stroke();
    });
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.height * 0.1,
        canvas.width / 2, canvas.height / 2, canvas.height * 0.85
    );
    grad.addColorStop(0, 'rgba(17,34,64,0)');
    grad.addColorStop(1, 'rgba(5,10,20,0.6)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    drawCircleOrnament();
    ecgLines.forEach(l => { l.y = l.y > canvas.height ? 0 : l.y; drawECG(l); });
    drawDNA();
    drawParticles();

    dnaAngle += 0.012;
    requestAnimationFrame(animate);
}

animate();