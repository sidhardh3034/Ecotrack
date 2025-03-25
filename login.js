import { auth, signInWithEmailAndPassword, database, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const errorMessage = document.getElementById("loginErrorMessage");

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userRef = ref(database, "users/" + user.uid);
            const snapshot = await get(userRef);

            if (!snapshot.exists()) {
                errorMessage.textContent = "Access Denied: User not registered properly.";
                errorMessage.style.display = "block";
                return;
            }

            // ✅ Show success message in green
            errorMessage.style.color = "green";
            errorMessage.textContent = "Successful Login!";
            errorMessage.style.display = "block";

            // ✅ Hide message after 4 seconds and redirect
            setTimeout(() => {
                errorMessage.style.display = "none";
                window.location.href = "admin_dashboard.html";
            }, 4000);

        } catch (error) {
            // ❌ Show error message in red
            errorMessage.style.color = "red";
            errorMessage.textContent = "Error: " + error.message;
            errorMessage.style.display = "block";
        }
    });
});
