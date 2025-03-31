import { database, ref, onValue, update } from "./firebase.js";

// Global variable for the Chart instance
let wasteChart;

// Function to show a popup notification when waste level > 50%
function showPopup(message) {
    const existingPopup = document.querySelector(".popup-notification");
    if (existingPopup) return; // Prevent multiple popups

    const popup = document.createElement("div");
    popup.className = "popup-notification";
    popup.innerHTML = `
        <span>${message}</span>
        <button class="close-popup">&times;</button>
    `;

    document.body.appendChild(popup);

    // Close popup when button is clicked
    popup.querySelector(".close-popup").addEventListener("click", () => {
        popup.remove();
    });

    // Auto-remove popup after 5 seconds
    setTimeout(() => popup.remove(), 5000);
}

// Function to Fetch Waste Bin Data & Update Chart
function fetchWasteBinData() {
    const wasteRef = ref(database, "dustbins");

    onValue(wasteRef, (snapshot) => {
        const data = snapshot.val();
        const tableBody = document.getElementById("wasteTable");
        tableBody.innerHTML = "";

        let binLabels = [];
        let binLevels = [];

        if (data) {
            Object.entries(data).forEach(([binID, bin]) => {
                binLabels.push(binID);
                binLevels.push(bin.wasteLevel || 0);

                let status = "Empty";
                if (bin.wasteLevel >= 80) {
                    status = "Full";
                } else if (bin.wasteLevel > 0) {
                    status = "Medium";
                }

                const level = bin.wasteLevel !== undefined ? `${Math.round(bin.wasteLevel)}%` : "N/A";

                // ✅ Keep Waste Bin Timestamp Correct (Stored in Seconds)
                let lastUpdated = "N/A";
                if (bin.timestamp) {
                    const timestamp = parseInt(bin.timestamp); // Waste bin timestamp is in **seconds**, not ISO
                    if (!isNaN(timestamp) && timestamp > 0) {
                        lastUpdated = new Date(timestamp * 1000).toLocaleString(); // Convert seconds → readable time
                    }
                }

                // ✅ Show Popup if Waste Level > 50%
                if (bin.wasteLevel > 50) {
                    showPopup(`⚠ Alert: Bin ${binID} is over ${bin.wasteLevel}% full!`);
                }

                const row = `
                    <tr>
                        <td>${binID}</td>
                        <td>${status}</td>
                        <td>${level}</td>
                        <td>${lastUpdated}</td>
                        <td>VJCET</td> <!-- Default location -->
                    </tr>
                `;
                tableBody.innerHTML += row;
            });

            // ✅ Restore Chart
            updateWasteChart(binLabels, binLevels);
        } else {
            tableBody.innerHTML = "<tr><td colspan='5'>No waste bin data available</td></tr>";
        }
    }, (error) => {
        console.error("Error fetching waste bin data:", error);
    });
}

// Function to Initialize & Update the Bar Chart
function updateWasteChart(labels, data) {
    const ctx = document.getElementById("wasteChart").getContext("2d");

    if (wasteChart) {
        wasteChart.destroy(); // Destroy previous instance before updating
    }

    wasteChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Waste Level (%)",
                data: data,
                backgroundColor: data.map(level => level >= 80 ? "red" : level > 50 ? "orange" : "green"),
                borderColor: "white",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: "Waste Level (%)",
                        color: "white"
                    },
                    ticks: { color: "white" }
                },
                x: {
                    title: {
                        display: true,
                        text: "Dustbin ID",
                        color: "white"
                    },
                    ticks: { color: "white" }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
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
                // ✅ Complaint Timestamp Stored in ISO Format (No Change Here)
                let timestamp = "N/A";
                if (complaint.timestamp) {
                    try {
                        timestamp = new Date(complaint.timestamp).toLocaleString(); // Convert ISO timestamp
                    } catch (error) {
                        console.error("Error parsing timestamp:", error);
                    }
                }

                const name = complaint.name || "Anonymous";
                const email = complaint.email || "N/A";
                const complaintText = complaint.details || "No details provided.";
                const status = complaint.status || "Pending";

                const row = `
                    <tr>
                        <td>${timestamp}</td>
                        <td>${name}</td>
                        <td>${email}</td>
                        <td>${complaintText}</td>
                        <td>${status}</td>
                        <td>
                            ${status === "Pending" ? `<button class="resolve-btn" onclick="resolveComplaint('${id}')">Resolve</button>` : "Resolved"}
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

// Add CSS for popup notification
const style = document.createElement("style");
style.innerHTML = `
    .popup-notification {
        position: fixed;
        bottom: 20px;
        left: 20px; /* ✅ Popup appears on the left */
        background: rgba(255, 0, 0, 0.9);
        color: white;
        padding: 15px;
        border-radius: 5px;
        box-shadow: 0px 0px 10px rgba(0,0,0,0.3);
        font-size: 14px;
        font-weight: bold;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .popup-notification .close-popup {
        background: none;
        border: none;
        color: white;
        font-size: 16px;
        cursor: pointer;
    }
`;
document.head.appendChild(style);

// Fetch Data When Page Loads
document.addEventListener("DOMContentLoaded", function () {
    fetchWasteBinData();
    fetchComplaintData();
});
