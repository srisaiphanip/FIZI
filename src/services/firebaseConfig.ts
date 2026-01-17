import { initializeApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// TODO: Replace with your Firebase config
// Get this from Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
    apiKey: "AIzaSyDCquX8QEQbXd5_bn7K221BMSdeLn0SrGA",
    authDomain: "advi-fc220.firebaseapp.com",
    projectId: "advi-fc220",
    storageBucket: "advi-fc220.firebasestorage.app",
    messagingSenderId: "1057242418550",
    appId: "1:1057242418550:web:37b5a9f27d68c07469be57",
    measurementId: "G-69V53L1LJF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with React Native Persistence
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics (optional, only available on web)
let analytics;
if (typeof window !== 'undefined') {
    try {
        analytics = getAnalytics(app);
    } catch (error) {

    }
}

export { analytics };
export default app;
