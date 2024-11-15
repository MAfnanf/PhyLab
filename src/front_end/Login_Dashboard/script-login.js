import { auth } from '../../back_end/firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";
import { db } from "../../back_end/firebase.js"

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (email === "" || password === "") {
            alert("Please enter both email and password.");
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);          

            if (user.emailVerified) {
                alert("Login successful!");
                localStorage.setItem('isLoggedIn', 'true');
                window.location.href = "../Main_Dashboard/logged.html";
            } else {
                alert("Please verify your email before logging in.");
            }

            if (docSnap.exists()) {
                const userData = docSnap.data();
                localStorage.setItem('userData', JSON.stringify(userData));
            } else {
                console.log("No such document!");
            }

        } catch (error) {
            console.error('Login error:', error);
            alert(`Login failed: ${error.message}`);
        }

        const userData = { username: usernameInput };
        localStorage.setItem('userData', JSON.stringify(userData));

    });
});
