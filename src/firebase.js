import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Leemos las claves del archivo .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Nos conectamos a nuestro proyecto de Firebase
const app = initializeApp(firebaseConfig)

// Exportamos lo que vamos a usar en la app
export const db = getFirestore(app) // la base de datos
export const auth = getAuth(app)    // el login anónimo