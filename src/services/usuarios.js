// Directorio de personas. Es nuevo en la v3 y existe por un solo motivo:
// para compartir una entrega con alguien hay que poder encontrarlo por su email.
//
//   usuarios/{uid}  →  { email, nombre }
//
// Cada persona deja su ficha acá al iniciar sesión. Las reglas de Firestore
// permiten leer este directorio a cualquiera que tenga sesión iniciada
// (hace falta para buscar), pero escribir solo la propia ficha.
import { collection, doc, getDocs, limit, query, setDoc, where } from 'firebase/firestore';
import { db } from '../firebase.js';

// Guarda o actualiza la ficha de quien está conectado. Se llama al entrar.
// merge: true → no pisa lo que ya estaba guardado.
export function registrarUsuario(uid, email, nombre = '') {
  const ficha = { email: (email || '').toLowerCase() };
  if (nombre) ficha.nombre = nombre;
  return setDoc(doc(db, 'usuarios', uid), ficha, { merge: true });
}

// Busca una persona por su email para invitarla a una entrega.
// Devuelve { uid, email, nombre } o null si esa persona no tiene cuenta todavía.
export async function buscarPorEmail(email) {
  const buscado = (email || '').trim().toLowerCase();
  if (!buscado) return null;
  const resultado = await getDocs(
    query(collection(db, 'usuarios'), where('email', '==', buscado), limit(1)),
  );
  if (resultado.empty) return null;
  const encontrado = resultado.docs[0];
  return { uid: encontrado.id, email: buscado, ...encontrado.data() };
}
