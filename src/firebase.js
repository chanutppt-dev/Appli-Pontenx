import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDxvIoW6avR4EujHE482Bob-taW76_Jlt8",
  authDomain: "appli-ptx.firebaseapp.com",
  projectId: "appli-ptx",
  storageBucket: "appli-ptx.firebasestorage.app",
  messagingSenderId: "228676425341",
  appId: "1:228676425341:web:b5d76c0e46987fcac30314"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = null;

export default app;