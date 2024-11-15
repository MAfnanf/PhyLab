let selectedOption = "";

document.addEventListener('DOMContentLoaded', function() {
    const userProfile = document.querySelector('.user-profile');
    const dropdown = document.querySelector('.dropdown');
    const logoutBtn = document.querySelector('.logout-btn');
    const usernameElement = document.querySelector('.username');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    // Set user information
    usernameElement.textContent = userData.username || 'User';

    // Toggle dropdown
    userProfile.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        dropdown.style.display = 'none';
    });

    // Logout functionality
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        window.location.href = "../Login_Dashboard/physics-login.html";
    });

    // Existing card selection logic
    document.getElementById('glb-card').addEventListener('click', () => {
        selectedOption = "GLB";
        highlightSelectedCard('glb-card');
    });

    document.getElementById('glbb-card').addEventListener('click', () => {
        selectedOption = "GLBB";
        highlightSelectedCard('glbb-card');
    });

    document.querySelector('.cta-button').addEventListener('click', () => {
        if (selectedOption === "GLB") {
            window.location.href = "../GLB_Dashboard/logged-glb.html";
        } else if (selectedOption === "GLBB") {
            window.location.href = "../GLBB_Dashboard/logged-glbb.html";
        } else {
            alert("Pilih salah satu sebelum melanjuti pembelajaran!");
        }
    });
});

function highlightSelectedCard(cardId) {
    document.querySelectorAll('.card').forEach(card => card.style.backgroundColor = 'white');
    document.getElementById(cardId).style.backgroundColor = '#6FE5A7';
}