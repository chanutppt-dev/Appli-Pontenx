// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";
import { getMessaging, isSupported } from "firebase/messaging";
// import { getMessaging, isSupported } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxvIoW6avR4EujHE482Bob-taW76_Jlt8",
  authDomain: "appli-ptx.firebaseapp.com",
  projectId: "appli-ptx",
  storageBucket: "appli-ptx.firebasestorage.app",
  messagingSenderId: "228676425341",
  appId: "1:228676425341:web:b5d76c0e46987fcac30314"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
// export const storage = getStorage(app);
export const storage = getStorage(app);

// Notifications push (PWA)
export const getMessagingInstance = async () => {
  // export const getMessagingInstance = async () => { ... };
  const supported = await isSupported();
  if (supported) {
    return getMessaging(app);
  }
  return null;
};

export default app;
