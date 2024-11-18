import { db, auth } from '../../back_end/firebase.js';
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', async () => {
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
    const examSection = document.getElementById('examSection');
    const userProfile = document.querySelector('.user-profile');
    const dropdown = document.querySelector('.dropdown');
    const logoutBtn = document.querySelector('.logout-btn');
    const usernameElement = document.querySelector('.username');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    const trackLength = 100; 
    let startPosition = 0;
    let currentPosition = 0;
    let velocity = 0;
    let startTime;
    let animationId;
    let isRunning = false;
    let isDragging = false;

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
        const elapsedTime = (timestamp - startTime) / 1000;
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

    function applyProgressToUI(progress) {
        let hasProgress = false;
        console.log(`MASOK SINI`);
        for (const questionId in progress) {
            const { answer, isCorrect } = progress[questionId];
            const radioInput = document.querySelector(`input[name="${questionId}"][value="${answer}"]`);
            console.log(`KESINI JUGA`);
            console.log(questionId);
            if (questionId === "q1" || questionId === "q2" || questionId === "q3") {
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
        q1: "4",    
        q2: "18",   
        q3: "50"    
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