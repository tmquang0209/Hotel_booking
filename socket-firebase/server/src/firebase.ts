// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAG2EsA15hfY1NExqoiOmYlGWuCH3oBTgM",
    authDomain: "renthub-b15b8.firebaseapp.com",
    projectId: "renthub-b15b8",
    storageBucket: "renthub-b15b8.appspot.com",
    messagingSenderId: "1003276640186",
    appId: "1:1003276640186:web:a57c808b6f5c2dc3c48783",
    measurementId: "G-EQMDY4NCGM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
