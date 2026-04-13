import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // 1. Import the Auth module

const firebaseConfig = {
  apiKey: "AIzaSyD_wMz179yY5U-B45DZGUd_xTMs45LuXbI",
  authDomain: "mzansibuilds-3127e.firebaseapp.com",
  projectId: "mzansibuilds-3127e",
  storageBucket: "mzansibuilds-3127e.firebasestorage.app",
  messagingSenderId: "779210077047",
  appId: "1:779210077047:web:5fdda3cbbda96fe70d6772"
};

// 2. Initialize the Firebase App
const app = initializeApp(firebaseConfig);

// 3. Initialize and export Auth
export const auth = getAuth(app);
export default app;