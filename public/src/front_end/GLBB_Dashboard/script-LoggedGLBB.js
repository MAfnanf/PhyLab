import { db, auth } from '../../back_end/firebase.js';
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('simulationCanvas');
    const ctx = canvas.getContext('2d');

    const CANVAS_WIDTH = 600;
    const CANVAS_HEIGHT = 400;
    const SCALE = CANVAS_WIDTH / 60;
    const GRAVITY = 9.8;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const showExamButton = document.getElementById('showExamButton');
    const examSection = document.getElementById('examSection');
    const userProfile = document.querySelector('.user-profile');
    const dropdown = document.querySelector('.dropdown');
    const logoutBtn = document.querySelector('.logout-btn');
    const usernameElement = document.querySelector('.username');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    let initialVelocity = 20;
    let angle = 45;
    let acceleration = 0;
    let isSimulating = false;
    let time = 0;
    let position = { x: 0, y: 0 };
    let velocity = { x: 0, y: 0 };
    let targetPosition = { x: CANVAS_WIDTH, y: CANVAS_HEIGHT };
    let isDragging = false;
    let showCongrats = false;
    let lastX, lastY;

    usernameElement.textContent = userData.username || 'User';

    userProfile.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', function() {
        dropdown.style.display = 'none';
    });

    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        window.location.href = "../Login_Dashboard/physics-login.html";
    });

    async function handleExamSection() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log("User is authenticated");
                const progress = await loadUserProgress();
                applyProgressToUI(progress);
            } else {
                console.error("User is not authenticated");
            }
        });
    }
    handleExamSection();

    function resizeCanvas() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        targetPosition.x = canvas.width - 100;
        targetPosition.y = canvas.height - 50;
    
        draw();
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function draw() {
        const PADDING = 10;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`X Distance: ${(targetPosition.x / SCALE).toFixed(1)}m`, canvas.width - PADDING, PADDING + 10);
        ctx.fillText(`Y Height: ${((canvas.height - targetPosition.y) / SCALE).toFixed(1)}m`, canvas.width - PADDING, PADDING + 30);
        ctx.fillStyle = 'green';
        ctx.fillRect(0, canvas.height - 5, canvas.width, 5);
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(targetPosition.x, targetPosition.y, 10, 0, 2 * Math.PI);
        ctx.stroke();
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
                ctx.fillText(`${i / SCALE}m`, i - 10, CANVAS_HEIGHT - 15);
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

    function handleStart(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
        const dx = x - targetPosition.x;
        const dy = y - targetPosition.y;
        if (dx * dx + dy * dy < 100) { 
            isDragging = true;
            lastX = x;
            lastY = y;
            canvas.style.cursor = 'grabbing';
        }
    }

    function getTouchPosition(e) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
        };
    }
    
    function handleMove(e) {
        e.preventDefault();
        if (isDragging) {
            const pos = getTouchPosition(e);
            const dx = pos.x - lastX;
            const dy = pos.y - lastY;
            targetPosition.x = Math.max(20, Math.min(targetPosition.x + dx, canvas.width - 20));
            targetPosition.y = Math.max(20, Math.min(targetPosition.y + dy, canvas.height - 20));
            lastX = pos.x;
            lastY = pos.y;
            draw();
        }
    }
    console.log(`Canvas width: ${canvas.width}, height: ${canvas.height}`);
    console.log(`Target position: x=${targetPosition.x}, y=${targetPosition.y}`);

    function handleEnd(e) {
        e.preventDefault();
        isDragging = false;
        canvas.style.cursor = 'grab';
    }

    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);

    canvas.addEventListener('touchstart', handleStart, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    canvas.addEventListener('touchend', handleEnd);

    function simulate() {
        if (isSimulating) {
            time += 0.016; 
            const radianAngle = angle * Math.PI / 180;

            position.x = initialVelocity * Math.cos(radianAngle) * time + 0.5 * acceleration * Math.cos(radianAngle) * time * time;
            position.y = initialVelocity * Math.sin(radianAngle) * time - 0.5 * (GRAVITY - acceleration * Math.sin(radianAngle)) * time * time;

            velocity.x = initialVelocity * Math.cos(radianAngle) + acceleration * Math.cos(radianAngle) * time;
            velocity.y = initialVelocity * Math.sin(radianAngle) - (GRAVITY - acceleration * Math.sin(radianAngle)) * time;

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
        document.getElementById('velocity').textContent = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y).toFixed(2);
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

    document.getElementById('acceleration').addEventListener('input', (e) => {
        acceleration = Number(e.target.value);
    });

    draw();

    function applyProgressToUI(progress) {
        let hasProgress = false;
        console.log(`MASOK SINI`);
        for (const questionId in progress) {
            const { answer, isCorrect } = progress[questionId];
            const radioInput = document.querySelector(`input[name="${questionId}"][value="${answer}"]`);
            console.log(`KESINI JUGA`);
            console.log(questionId);
            if (questionId === "q4" || questionId === "q5" || questionId === "q6") {
                hasProgress = true; 
            }
            if (radioInput) {
                radioInput.checked = true;
    
                const resultElement = document.createElement('p');
                resultElement.classList.add('question-result');
                resultElement.textContent = isCorrect ? 'Benar! ✓' : 'Salah ✗';
                resultElement.classList.add(isCorrect ? 'correct' : 'incorrect');
                console.log(`Processing ${questionId}: answer=${answer}, isCorrect=${isCorrect}`);
                const questionContainer = radioInput.closest('.question-card');

                if (questionContainer) {
                    const existingResult = questionContainer.querySelector('.question-result');
                    if (existingResult) {
                        console.log(`Found existing result for ${questionId}, replacing it.`);
                        existingResult.remove();
                    } else {
                        console.log(`No existing result found for ${questionId}, adding new result.`);
                    }
                    questionContainer.appendChild(resultElement);
                } else {
                    console.warn(`No .question-card found for ${questionId}.`);
                }
            }
        }

        if (hasProgress) {
            showExamButton.style.display = 'none'; 
            examSection.style.display = 'block';   
            console.log("Progress valid ditemukan. Menampilkan section ujian.");
        } else {
            showExamButton.addEventListener('click', () => {
                examSection.style.display = 'block';
                showExamButton.style.display = 'none';
            });
            console.log("No valid progress found.");
        }
    
        updateScore();
    }

    function updateScore() {
        const totalQuestions = 3;
        let correctAnswersCount = 0;
    
        document.querySelectorAll('.question-result').forEach(result => {
            if (result.classList.contains('correct')) {
                correctAnswersCount++;
            }
        });
    
        document.getElementById('scoreDisplay').textContent = `Score: ${correctAnswersCount}/${totalQuestions}`;
        if (correctAnswersCount === totalQuestions) {
            showCongratsPopup();
        }
    }
    
    function showCongratsPopup() {
        const popup = document.getElementById('congratsPopup');
        popup.style.display = 'block';
        setTimeout(() => {
            popup.style.display = 'none';
        }, 1500); 
    }

    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const progressData = {};
            document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
                progressData[radio.name] = radio.value;
            });
            saveUserProgress(progressData);
        });
    });

    async function saveUserProgress(progressData) {
        const user = auth.currentUser;
        if (!user) {
            console.error("User is not authenticated");
            return;
        }
        document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
            const questionId = radio.name
            progressData[radio.name] = radio.value;
            progressData[questionId] = {
                answer: radio.value,
                isCorrect: radio.value === correctAnswers[questionId] // Store correctness too
            };
        });
        try {
            const progressRef = doc(db, "userProgress", user.uid);
            await setDoc(progressRef, { progress: progressData }, { merge: true });
            console.log("User progress saved successfully");
        } catch (error) {
            console.error("Error saving user progress:", error);
        }
    }
    
    async function loadUserProgress() {
        const user = auth.currentUser;
        if (!user) {
            console.error("User is not authenticated");
            return null;
        }
    
        try {
            const progressRef = doc(db, "userProgress", user.uid);
            const progressSnap = await getDoc(progressRef);
    
            if (progressSnap.exists()) {
                return progressSnap.data().progress;
            } else {
                console.log("No progress data found");
                return null;
            }
        } catch (error) {
            console.error("Error loading user progress:", error);
            return null;
        }
    }
    const correctAnswers = {
        q4: "20",  
        q5: "20",
        q6: "4"  
    };

    document.querySelectorAll('.submit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const questionId = e.target.dataset.question;
            const selected = document.querySelector(`input[name="${questionId}"]:checked`);
            const resultElement = document.createElement('p');
            resultElement.classList.add('question-result');
    
            if (selected) {
                if (selected.value === correctAnswers[questionId]) {
                    resultElement.textContent = 'Benar! ✓';
                    resultElement.classList.add('correct');
                } else {
                    resultElement.textContent = 'Salah ✗';
                    resultElement.classList.add('incorrect');
                }
            } else {
                resultElement.textContent = 'Silakan pilih jawaban';
                resultElement.classList.add('incorrect');
            }
    
            const existingResult = e.target.parentNode.querySelector('.question-result');
            if (existingResult) {
                existingResult.remove();
            }
    
            e.target.parentNode.appendChild(resultElement);
            updateScore(); 
        });
    });
});