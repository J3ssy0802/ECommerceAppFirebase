import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBmEnt2SMKEqQDdiLr7HV1ppzH90q3rGuw",
  authDomain: "codingtemple-2448e.firebaseapp.com",
  projectId: "codingtemple-2448e",
  storageBucket: "codingtemple-2448e.firebasestorage.app",
  messagingSenderId: "892175113960",
  appId: "1:892175113960:web:f34aa7c024fb45b201335d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
