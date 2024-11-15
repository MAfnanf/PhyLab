import { auth } from '../../back_end/firebase.js';
import { createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";
import { db } from "../../back_end/firebase.js";

document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');

    if (!registerForm) {
        console.error('Register form not found');
        return;
    }

    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirm-password').value.trim();
        const username = document.getElementById('username').value.trim();
        const fullname = document.getElementById('fullname').value.trim();


        console.log("Form submitted");

        console.log("Email:", email);
        console.log("Password:", password);

        // Simple validation
        if (!email || !password || !confirmPassword) {
            alert("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            alert("Password must be at least 8 characters long.");
            return;
        }

        try {
            // Try creating the user with Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                fullname: fullname,
                username: username,
                email: email,
                uid: user.uid
            });

            console.log("User data saved to Firestore.");
            console.log("User created:", user);

            // Send email verification
            await sendEmailVerification(user);
            console.log("Verification email sent.");

            alert("Registration successful! Please verify your email.");
            window.location.href = "../Login_Dashboard/physics-login.html";
        } catch (error) {
            console.error('Registration error:', error);
            console.error('Error saving user data:', error);
            alert(`Registration failed: ${error.message}`);
        }

        auth.onAuthStateChanged(user => {
            if (user) {
                console.log("User is logged in:", user);
            } else {
                console.log("No user logged in.");
            }
            
        });
        const usernameInput = document.getElementById('username-input').value;

        //   Save the username to localStorage
        if (usernameInput) { // assuming a username is provided
            const userData = { username: usernameInput };
            localStorage.setItem('userData', JSON.stringify(userData));
        };
    });
});
