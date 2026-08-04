import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyApsN595keyX4BoOIyzOPOAhj7r_6SwBAA",
  authDomain: "credicobro.firebaseapp.com",
  projectId: "credicobro",
  storageBucket: "credicobro.firebasestorage.app",
  messagingSenderId: "724882466550",
  appId: "1:724882466550:web:0f29db6ed8d934ddbb6ed7",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };