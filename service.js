import { database, ref, push, set, get } from "./firebase.js";

// ✅ Function to Register a Complaint
function registerComplaint(event) {
    event.preventDefault();

    const name = document.querySelector("#register-name").value.trim();
    const email = document.querySelector("#register-email").value.trim();
    const details = document.querySelector("#register-details").value.trim();
    const messageDisplay = document.querySelector("#complaint-id-display");

    // ✅ Name Validation: Only allow letters & spaces
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!name.match(nameRegex)) {
        messageDisplay.innerHTML = `<p style="color: red;">Invalid name. Only letters and spaces are allowed.</p>`;
        return;
    }

    if (!name || !email || !details) {
        messageDisplay.innerHTML = `<p style="color: red;">All fields are required!</p>`;
        return;
    }

    // ✅ Store timestamp in ISO format
    const timestamp = new Date().toISOString(); // Example: "2025-03-26T00:20:39.000Z"

    const complaintRef = ref(database, "complaints");
    const newComplaintRef = push(complaintRef);
    const complaintID = newComplaintRef.key;  // Get unique Complaint ID

    set(newComplaintRef, { 
        complaintID, 
        name, 
        email, 
        details, 
        status: "Pending",
        timestamp // ✅ Save timestamp in ISO format
    })
    .then(() => {
        messageDisplay.innerHTML = 
            `<p style="color: green;">Complaint registered successfully! Your Complaint ID: <strong>${complaintID}</strong></p>`;
        document.querySelector("#register-form").reset();
    }).catch(error => {
        console.error("Error submitting complaint:", error);
        messageDisplay.innerHTML = `<p style="color: red;">Error submitting complaint. Please try again.</p>`;
    });
}

async function checkComplaintStatus(event) {
    event.preventDefault();

    const email = document.querySelector("#status-email").value.trim();
    const complaintID = document.querySelector("#status-id").value.trim();
    const statusDisplay = document.querySelector("#status-result");

    if (!email || !complaintID) {
        statusDisplay.innerHTML = `<p style="color: red;">Both fields are required!</p>`;
        return;
    }

    try {
        const complaintRef = ref(database, `complaints/${complaintID}`);
        const snapshot = await get(complaintRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            if (data.email === email) {  
                let output = `<p style="color: green;">Complaint Status: <strong>${data.status}</strong></p>`;
                
                if (data.timestamp) { // ✅ Convert ISO timestamp to readable format
                    try {
                        output += `<p>Registered on: <strong>${new Date(data.timestamp).toLocaleString()}</strong></p>`;
                    } catch (error) {
                        console.error("Error parsing timestamp:", error);
                    }
                }

                statusDisplay.innerHTML = output;
            } else {
                statusDisplay.innerHTML = `<p style="color: red;">No complaint found with this email.</p>`;
            }
        } else {
            statusDisplay.innerHTML = `<p style="color: red;">No complaint found.</p>`;
        }
    } catch (error) {
        console.error("Error checking complaint status:", error);
        statusDisplay.innerHTML = `<p style="color: red;">Error fetching data.</p>`;
    }
}

// ✅ Attach Event Listeners after DOM loads
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#register-form").addEventListener("submit", registerComplaint);
    document.querySelector("#status-form").addEventListener("submit", checkComplaintStatus);
});
