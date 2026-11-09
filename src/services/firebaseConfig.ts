import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, Auth } from 'firebase/auth';
// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cấu hình Firebase Project
export const firebaseConfig = {
  apiKey: "AIzaSyADZ0cdwxgl1K4EcIma2e3Im6mek4iGw5g",
  authDomain: "app05-chat.firebaseapp.com",
  databaseURL: "https://app05-chat-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "app05-chat",
  storageBucket: "app05-chat.firebasestorage.app",
  messagingSenderId: "484940176543",
  appId: "1:484940176543:web:10fa556d9f636fb0bf56aa",
  measurementId: "G-0SKLGTMKZH"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (e) {
  auth = getAuth(app);
}

const database: Database = getDatabase(app);

export { app, auth, database };
