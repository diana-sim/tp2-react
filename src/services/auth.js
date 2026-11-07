// TODO lo de cuentas de usuario (login, registro, salir) está en este archivo.
// Usa Firebase Authentication con email y contraseña.
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase.js';

// SESIÓN: Firebase avisa cada vez que alguien entra o sale.
// Llama a alCambiar(usuario) con el usuario conectado, o con null si no hay nadie.
// Devuelve una función para dejar de escuchar.
export function escucharSesion(alCambiar) {
  return onAuthStateChanged(auth, alCambiar);
}

// SIGNUP: crea la cuenta y deja a la persona conectada.
export function registrarse(email, contrasena) {
  return createUserWithEmailAndPassword(auth, email, contrasena);
}

// LOGIN
export function ingresar(email, contrasena) {
  return signInWithEmailAndPassword(auth, email, contrasena);
}

// LOGOUT
export function salir() {
  return signOut(auth);
}

// Firebase devuelve errores en inglés con un código (ej: 'auth/weak-password').
// Los traducimos a mensajes claros.
export function mensajeDeError(error) {
  const mensajes = {
    'auth/invalid-email': 'El email no es válido.',
    'auth/invalid-credential': 'El email o la contraseña no coinciden.',
    'auth/user-not-found': 'El email o la contraseña no coinciden.',
    'auth/wrong-password': 'El email o la contraseña no coinciden.',
    'auth/email-already-in-use': 'Ya hay una cuenta con ese email. Probá ingresar.',
    'auth/weak-password': 'La contraseña tiene que tener al menos 6 caracteres.',
    'auth/too-many-requests': 'Demasiados intentos. Esperá un ratito y probá de nuevo.',
    'auth/network-request-failed': 'No hay conexión. Revisá tu internet.',
  };
  return mensajes[error.code] || 'Algo salió mal. Probá de nuevo.';
}
