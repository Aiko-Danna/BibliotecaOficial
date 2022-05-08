import firebase from 'firebase';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAvcEdSEug5XsnjObIZIAp_XrBAO28rIcg",
  authDomain: "libros-27f9e.firebaseapp.com",
  projectId: "libros-27f9e",
  storageBucket: "libros-27f9e.appspot.com",
  messagingSenderId: "111488179942",
  appId: "1:111488179942:web:16f84d593ea9ee3ab62527"
};

firebase.initializeApp(firebaseConfig);
export default firebase.firestore();