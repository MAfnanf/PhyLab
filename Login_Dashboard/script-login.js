document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('.login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault(); 

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (username === "" || password === "") {
            alert("Please enter both username and password.");
            return;
        }

        const correctUsername = "admin";
        const correctPassword = "password123";

        if (username === correctUsername && password === correctPassword) {
            alert("Login successful!");
            window.location.href = "dashboard.html"; 
        } else {
            alert("Invalid username or password. Please try again.");
        }
    });
});
