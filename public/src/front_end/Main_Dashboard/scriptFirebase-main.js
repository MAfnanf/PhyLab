document.addEventListener('DOMContentLoaded', function() {
    let selectedOption = "";
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    if (isLoggedIn && userData.username) {
        window.location.href = "src/front_end/Main_Dashboard/logged.html";
        return;
    }

    const glbCard = document.getElementById('glb-card');
    const glbbCard = document.getElementById('glbb-card');

    if (glbCard) {
        glbCard.addEventListener('click', () => {
            selectedOption = "GLB";
            highlightSelectedCard('glb-card');
        });
    }

    if (glbbCard) {
        glbbCard.addEventListener('click', () => {
            selectedOption = "GLBB";
            highlightSelectedCard('glbb-card');
        });
    }
    
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            if (selectedOption === "GLB") {
                window.location.href = "src/front_end/GLB_Dashboard/physics-glb.html";
            } else if (selectedOption === "GLBB") {
                window.location.href = "src/front_end/GLBB_Dashboard/physics-glbb.html";
            } else {
                alert("Pilih salah satu sebelum melanjuti pembelajaran!");
            }
        });
    }
});

function highlightSelectedCard(cardId) {
    document.querySelectorAll('.card').forEach(card => card.style.backgroundColor = 'white');
    document.getElementById(cardId).style.backgroundColor = '#6FE5A7';
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('selected');
    });
    const selectedCard = document.getElementById(cardId);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
}

