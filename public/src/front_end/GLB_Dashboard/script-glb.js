document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('glbCanvas');
    const ctx = canvas.getContext('2d');
    const startPositionValue = document.getElementById('startPositionValue');
    const velocityInput = document.getElementById('velocity');
    const startButton = document.getElementById('startButton');
    const resetButton = document.getElementById('resetButton');
    const timeDisplay = document.getElementById('time');
    const averageVelocityDisplay = document.getElementById('averageVelocity');
    const avgVelocityValue = document.getElementById('avgVelocityValue');
    const showExamButton = document.getElementById('showExamButton');

    const trackLength = 100; 
    let startPosition = 0;
    let currentPosition = 0;
    let velocity = 0;
    let startTime;
    let animationId;
    let isRunning = false;
    let isDragging = false;

    function resizeCanvas() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        drawTrack();
    }

    function drawTrack() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'green';
        ctx.fillRect(0, 0, 2, canvas.height);
        ctx.fillStyle = 'red';
        ctx.fillRect(canvas.width - 2, 0, 2, canvas.height);
        
        // Draw distance markers
        ctx.fillStyle = 'black';
        ctx.font = '10px Arial';
        for (let i = 0; i <= 10; i++) {
            const x = (i / 10) * canvas.width;
            ctx.fillRect(x, canvas.height - 10, 1, 10);
            ctx.fillText(i * 10 + 'm', x - 10, canvas.height - 15);
        }
        
        const manX = (currentPosition / trackLength) * canvas.width;
        ctx.beginPath();
        ctx.arc(manX, canvas.height / 2, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'blue';
        ctx.fill();
    }

    function updateManPosition(position) {
        currentPosition = position;
        startPosition = position;
        startPositionValue.textContent = Math.round(position);
        drawTrack();
    }

    function startSimulation() {
        if (velocity <= 0) return;
        isRunning = true;
        startButton.disabled = true;
        velocityInput.disabled = true;
        averageVelocityDisplay.style.display = 'none';
        
        startTime = performance.now();
        currentPosition = startPosition;
        
        animationId = requestAnimationFrame(updateSimulation);
    }

    function updateSimulation(timestamp) {
        const elapsedTime = (timestamp - startTime) / 1000; // Convert to seconds
        timeDisplay.textContent = elapsedTime.toFixed(2);
        
        currentPosition = startPosition + velocity * elapsedTime;
        drawTrack();
        
        if (currentPosition >= trackLength) {
            finishSimulation(elapsedTime);
        } else {
            animationId = requestAnimationFrame(updateSimulation);
        }
    }

    function finishSimulation(totalTime) {
        isRunning = false;
        startButton.disabled = false;
        velocityInput.disabled = false;
        
        const avgVelocity = (trackLength - startPosition) / totalTime;
        avgVelocityValue.textContent = avgVelocity.toFixed(2);
        averageVelocityDisplay.style.display = 'block';
    }

    function resetSimulation() {
        if (isRunning) {
            cancelAnimationFrame(animationId);
        }
        isRunning = false;
        startButton.disabled = false;
        velocityInput.disabled = false;
        
        startPosition = 0;
        currentPosition = 0;
        velocity = 0;
        startPositionValue.textContent = '0';
        velocityInput.value = '0';
        timeDisplay.textContent = '0.00';
        averageVelocityDisplay.style.display = 'none';
        
        drawTrack();
    }

    velocityInput.addEventListener('input', () => {
        velocity = parseFloat(velocityInput.value);
    });

    startButton.addEventListener('click', startSimulation);
    resetButton.addEventListener('click', resetSimulation);

    canvas.addEventListener('mousedown', startDrag);
    canvas.addEventListener('mousemove', drag);
    canvas.addEventListener('mouseup', endDrag);
    canvas.addEventListener('mouseleave', endDrag);

    canvas.addEventListener('touchstart', startDrag);
    canvas.addEventListener('touchmove', drag);
    canvas.addEventListener('touchend', endDrag);

    function startDrag(e) {
        if (isRunning) return;
        isDragging = true;
        drag(e);
    }

    function drag(e) {
        if (!isDragging) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        updateManPosition(Math.max(0, Math.min(trackLength, (x / canvas.width) * trackLength)));
    }

    function endDrag() {
        isDragging = false;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    showExamButton.addEventListener('click', () => {
        alert("Login Terlebih Dahulu")
    })
});