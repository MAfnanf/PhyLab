let selectedOption = "";

document.getElementById('glb-card').addEventListener('click', () => {
  selectedOption = "GLB";
  highlightSelectedCard('glb-card');
});

document.getElementById('glbb-card').addEventListener('click', () => {
  selectedOption = "GLBB";
  highlightSelectedCard('glbb-card');
});

document.getElementById('glbb-card').addEventListener('click', () => {
  selectedOption = "GLBB";
  highlightSelectedCard('glbb-card');
});

document.querySelector('.cta-button').addEventListener('click', () => {
  if (selectedOption === "GLB") {
    window.location.href = "physics-glb.html";
  } else if (selectedOption === "GLBB") {
    window.location.href = "physics-glbb.html";
  } else {
    alert("Pilih salah satu sebelum melanjuti pembelajaran!");
  }
});

function highlightSelectedCard(cardId) {
  document.querySelectorAll('.card').forEach(card => card.style.backgroundColor = 'white');
  document.getElementById(cardId).style.backgroundColor = '#6FE5A7';
}
//tes