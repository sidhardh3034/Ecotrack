import { database, ref, onValue, update } from "./firebase.js";

// Function to Fetch Waste Bin Data
function fetchWasteBinData() {
    const wasteRef = ref(database, "dustbins");

    onValue(wasteRef, (snapshot) => {
        const data = snapshot.val();
        const tableBody = document.getElementById("wasteTable");
        tableBody.innerHTML = "";

        if (data) {
            Object.entries(data).forEach(([binID, bin]) => {
                const location = "VJCET"; // Default location for now
                let status = "Empty";

                if (bin.wasteLevel >= 80) {
                    status = "Full";
                } else if (bin.wasteLevel > 0) {
                    status = "Medium";
                }

                const level = bin.wasteLevel !== undefined ? `${Math.round(bin.wasteLevel)}%` : "N/A";
                const lastUpdated = bin.timestamp ? new Date(bin.timestamp).toLocaleString() : "N/A"; 

                const row = `
                    <tr>
                        <td>${binID}</td>
                        <td>${status}</td>
                        <td>${level}</td>
                        <td>${lastUpdated}</td>
                        <td>${location}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        } else {
            tableBody.innerHTML = "<tr><td colspan='5'>No waste bin data available</td></tr>";
        }
    }, (error) => {
        console.error("Error fetching waste bin data:", error);
    });
}

// Function to Fetch Complaint Data
function fetchComplaintData() {
    const complaintRef = ref(database, "complaints");

    onValue(complaintRef, (snapshot) => {
        const data = snapshot.val();
        const tableBody = document.getElementById("complaint-data");
        tableBody.innerHTML = "";

        if (data) {
            Object.entries(data).forEach(([id, complaint]) => {
                const timestamp = complaint.timestamp ? new Date(complaint.timestamp).toLocaleString() : "N/A";
                const name = complaint.name || "Anonymous";
                const email = complaint.email || "N/A";
                const complaintText = complaint.details || "No details provided.";
                const status = complaint.status || "Pending";  // Default to "Pending"

                const row = `
                    <tr>
                        <td>${timestamp}</td>
                        <td>${name}</td>
                        <td>${email}</td>
                        <td>${complaintText}</td>
                        <td>${status}</td>
                        <td>
                            ${status === "Pending" ? `<button onclick="resolveComplaint('${id}')">Resolve</button>` : "Resolved"}
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        } else {
            tableBody.innerHTML = "<tr><td colspan='6'>No complaints available</td></tr>";
        }
    }, (error) => {
        console.error("Error fetching complaint data:", error);
    });
}

// Function to Resolve a Complaint
window.resolveComplaint = function (complaintId) {
    const complaintRef = ref(database, `complaints/${complaintId}`);
    
    update(complaintRef, {
        status: "Resolved"
    }).then(() => {
        console.log("Complaint resolved successfully.");
        fetchComplaintData(); // Refresh the table
    }).catch((error) => {
        console.error("Error resolving complaint:", error);
    });
};

// Fetch Data When Page Loads
document.addEventListener("DOMContentLoaded", function () {
    fetchWasteBinData();
    fetchComplaintData();
});
