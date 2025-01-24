// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBjlpHCyrpUrH0AKgyxLsfbGDXupu0FgAk",
  authDomain: "smartchat-c47f7.firebaseapp.com",
  projectId: "smartchat-c47f7",
  storageBucket: "smartchat-c47f7.firebasestorage.app",
  messagingSenderId: "841291113214",
  appId: "1:841291113214:web:6d3008a94a73a708e93baf",
  measurementId: "G-0P7GMF37JN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // 用戶認證
export const db = getFirestore(app); // Firestore 資料庫