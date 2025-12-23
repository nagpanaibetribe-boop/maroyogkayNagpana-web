// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDmkohQTE5Abuguruyfq0oRQAKoJBqPygs",
  authDomain: "nagpanatribe.firebaseapp.com",
  databaseURL: "https://nagpanatribe-default-rtdb.firebaseio.com",
  projectId: "nagpanatribe",
  storageBucket: "nagpanatribe.firebasestorage.app",
  messagingSenderId: "445848527346",
  appId: "1:445848527346:web:2dfca68e4e7c74581d4b6b"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();
