import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: 'csc13010-thinksage-ai.firebaseapp.com',
  projectId: 'csc13010-thinksage-ai',
  storageBucket: 'csc13010-thinksage-ai.firebasestorage.app',
  messagingSenderId: '285124049347',
  appId: '1:285124049347:web:49ddc80b751cf3e4c62576',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
