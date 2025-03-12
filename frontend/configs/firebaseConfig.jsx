import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = { 
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, 
  authDomain : "thoughtsage-test.firebaseapp.com" , 
  projectId : "thoughtsage-test" , 
  storageBucket : "thoughtsage-test.firebasestorage.app" , 
  messagingSenderId : "429100442214" , 
  appId : "1:429100442214:web:b5ed09a04b57f22cfa83a7" , 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
