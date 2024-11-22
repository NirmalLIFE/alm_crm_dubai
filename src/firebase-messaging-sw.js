importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js");
firebase.initializeApp({
  apiKey: "AIzaSyBBKv_LdCNFhr4IMr9Msq5NXLU_lvx2mxY",
  authDomain: "maraghi-crm.firebaseapp.com",
  projectId: "maraghi-crm",
  storageBucket: "maraghi-crm.appspot.com",
  messagingSenderId: "1062000739352",
  appId: "1:1062000739352:web:fd5d6e73bfca0d90752f6d"
});
const messaging = firebase.messaging();