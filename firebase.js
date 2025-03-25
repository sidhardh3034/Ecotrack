import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";
import { 
  getDatabase, 
  ref, 
  push, 
  set, 
  get, 
  onValue, 
  update  // ✅ Added `update`
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";  
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// 🔹 Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDv3YuOtglg3jFxT_1bkPhwq0qRX9Iv5KA",
  authDomain: "iotsasi-bd17f.firebaseapp.com",
  databaseURL: "https://iotsasi-bd17f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "iotsasi-bd17f",
  storageBucket: "iotsasi-bd17f.appspot.com",
  messagingSenderId: "179051809098",
  appId: "1:179051809098:web:ae2ea3d221c436532ad9b3",
  measurementId: "G-B6BQDRLQSE",
};

// 🔹 Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// 🔹 Function to Submit Contact Form Data
function submitContactForm(name, email, message) {
  const questionsRef = ref(database, "questions");
  const newQuestionRef = push(questionsRef); // Creates a unique entry
  
  set(newQuestionRef, {
    name: name,
    email: email,
    message: message,
    timestamp: new Date().toISOString(),
  }).then(() => {
    alert("Message submitted successfully!");
  }).catch((error) => {
    console.error("Error submitting message:", error);
    alert("Error submitting message. Please try again.");
  });
}

// 🔹 Export Services for Easy Import
export { 
  app, 
  database, 
  ref, 
  push, 
  set, 
  get, 
  onValue,  
  update,  // ✅ Exported `update`
  analytics, 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  submitContactForm 
};  
