import { database, ref, push, set } from "./firebase.js"; // ✅ Correct imports

document.addEventListener("DOMContentLoaded", function () {
    const contactForm = document.getElementById("contact-form");
    const messageDisplay = document.getElementById("contact-message");

    contactForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevents page refresh

        // Get form values
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        // ✅ Name Validation: Only allow letters & spaces
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!name.match(nameRegex)) {
            messageDisplay.innerHTML = `<p style="color: red;">Invalid name. Only letters and spaces are allowed.</p>`;
            return;
        }

        // ✅ Field Validation
        if (name === "" || email === "" || message === "") {
            messageDisplay.innerHTML = `<p style="color: red;">Please fill in all fields.</p>`;
            return;
        }

        // Firebase Reference
        const questionsRef = ref(database, "questions");
        const newQuestionRef = push(questionsRef);

        // Save data in Firebase
        set(newQuestionRef, {
            name: name,
            email: email,
            message: message,
            timestamp: new Date().toISOString()
        })
        .then(() => {
            messageDisplay.innerHTML = `<p style="color: green;">Message sent successfully!</p>`;
            contactForm.reset(); // Clear the form

            // ✅ Hide success message after 4 seconds
            setTimeout(() => {
                messageDisplay.innerHTML = "";
            }, 4000);
        })
        .catch((error) => {
            console.error("Error submitting message: ", error);
            messageDisplay.innerHTML = `<p style="color: red;">Failed to send message. Try again.</p>`;
        });
    });
});
