import { auth, createUserWithEmailAndPassword, database, ref, get, set } from "./firebase.js";

document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.getElementById("signupForm");
    const errorMessage = document.getElementById("signupErrorMessage");

    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const fullName = document.getElementById("signup-name").value.trim();
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value.trim();
        const enteredSecretKey = document.getElementById("signup-secret").value.trim();

        // ✅ Check if Full Name contains only letters (no numbers)
        const nameRegex = /^[A-Za-z\s]+$/; // Allows only letters and spaces
        if (!nameRegex.test(fullName)) {
            errorMessage.textContent = "Full Name cannot contain numbers or special characters.";
            errorMessage.style.display = "block";
            return;
        }

        try {
            // 🔹 1. Fetch stored secret key from Firebase Database
            const secretRef = ref(database, "secret"); 
            const snapshot = await get(secretRef);

            if (!snapshot.exists()) {
                errorMessage.textContent = "Error: Secret key not found in Firebase.";
                errorMessage.style.display = "block";
                return;
            }

            const correctSecretKey = snapshot.val(); // Get stored secret key

            // 🔹 2. Check if the entered key matches
            if (enteredSecretKey !== correctSecretKey) {
                errorMessage.textContent = "Invalid Secret Key!";
                errorMessage.style.display = "block";
                return;
            }

            // 🔹 3. Register user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 🔹 4. Save user info to Firebase Database
            await set(ref(database, "users/" + user.uid), {
                fullName: fullName,
                email: email
            });

            // ✅ Show confirmation message on the page instead of an alert
            errorMessage.style.color = "green";
            errorMessage.textContent = "Account created successfully!";
            errorMessage.style.display = "block";

            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);

        } catch (error) {
            // 🔹 Show error message if sign-up fails
            errorMessage.textContent = "Error: " + error.message;
            errorMessage.style.display = "block";
        }
    });
});
