const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const SCALE = 10; 
const GRAVITY = 9.8; 

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let initialVelocity = 20;
let angle = 45;
let isSimulating = false;
let time = 0;
let position = { x: 0, y: 0 };
let velocity = { x: 0, y: 0 };
let targetPosition = { x: 500, y: CANVAS_HEIGHT - 50 };
let showCongrats = false;
let isDragging = false;

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`X Distance: ${(targetPosition.x / SCALE).toFixed(1)}m`, CANVAS_WIDTH - 10, 20);
    ctx.fillText(`Y Height: ${((CANVAS_HEIGHT - targetPosition.y) / SCALE).toFixed(1)}m`, CANVAS_WIDTH - 10, 40);

    ctx.fillStyle = 'green';
    ctx.fillRect(0, CANVAS_HEIGHT - 5, CANVAS_WIDTH, 5);
    
    ctx.save();
    ctx.translate(10, CANVAS_HEIGHT - 10);
    ctx.rotate(-angle * Math.PI / 180);
    ctx.fillStyle = 'gray';
    ctx.fillRect(-10, -3, 20, 6);
    ctx.restore();
    
    if (isSimulating) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(position.x * SCALE, CANVAS_HEIGHT - position.y * SCALE, 3, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(targetPosition.x, targetPosition.y, 10, 0, 2 * Math.PI);
    ctx.stroke();

    drawRulers();
}

function drawRulers() {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= CANVAS_WIDTH; i += SCALE) {
        ctx.beginPath();
        ctx.moveTo(i, CANVAS_HEIGHT - 10);
        ctx.lineTo(i, CANVAS_HEIGHT);
        ctx.stroke();
        if (i % (5 * SCALE) === 0) {
            ctx.fillText(`${i / SCALE}m`, i, CANVAS_HEIGHT - 15);
        }
    }
    
    for (let i = 0; i <= CANVAS_HEIGHT; i += SCALE) {
        ctx.beginPath();
        ctx.moveTo(0, CANVAS_HEIGHT - i);
        ctx.lineTo(10, CANVAS_HEIGHT - i);
        ctx.stroke();
        if (i % (5 * SCALE) === 0) {
            ctx.fillText(`${i / SCALE}m`, 15, CANVAS_HEIGHT - i);
        }
    }
}

function simulate() {
    if (isSimulating) {
        time += 0.016; // 60 FPS
        const radianAngle = angle * Math.PI / 180;

        position.x = initialVelocity * Math.cos(radianAngle) * time;
        position.y = initialVelocity * Math.sin(radianAngle) * time - 0.5 * GRAVITY * time * time;

        if (position.y < 0 || checkCollision()) {
            isSimulating = false;
        }

        updateStats();
        draw();

        if (isSimulating) {
            requestAnimationFrame(simulate);
        }
    }
}

function checkCollision() {
    const dx = position.x * SCALE - targetPosition.x;
    const dy = CANVAS_HEIGHT - position.y * SCALE - targetPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 10) {
        showCongrats = true;
        document.getElementById('congratsMessage').classList.remove('hidden');
        return true;
    }
    return false;
}

function updateStats() {
    document.getElementById('time').textContent = time.toFixed(2);
}

function handleFire() {
    time = 0;
    position = { x: 0, y: 0 };
    velocity = { 
        x: initialVelocity * Math.cos(angle * Math.PI / 180), 
        y: initialVelocity * Math.sin(angle * Math.PI / 180) 
    };
    isSimulating = true;
    showCongrats = false;
    document.getElementById('congratsMessage').classList.add('hidden');
    simulate();
}

function handleReset() {
    time = 0;
    position = { x: 0, y: 0 };
    velocity = { x: 0, y: 0 };
    isSimulating = false;
    showCongrats = false;
    document.getElementById('congratsMessage').classList.add('hidden');
    updateStats();
    draw();
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - targetPosition.x;
    const dy = y - targetPosition.y;
    if (dx * dx + dy * dy < 100) { 
        isDragging = true;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        targetPosition.x = Math.max(20, Math.min(e.clientX - rect.left, CANVAS_WIDTH - 20));
        targetPosition.y = Math.max(20, Math.min(e.clientY - rect.top, CANVAS_HEIGHT - 20));
        draw();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
});

document.getElementById('fireButton').addEventListener('click', handleFire);
document.getElementById('resetButton').addEventListener('click', handleReset);

document.getElementById('initialVelocity').addEventListener('input', (e) => {
    initialVelocity = Number(e.target.value);
});

document.getElementById('angle').addEventListener('input', (e) => {
    angle = Number(e.target.value);
});

draw();