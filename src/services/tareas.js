// TODO lo que habla con Firebase está en este archivo.
// Los componentes no importan nada de Firebase: llaman a estas funciones.
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.js';

// Cada usuario tiene su propia carpeta:
//   usuarios/{uid}/tareas/{id}             → las entregas
//   usuarios/{uid}/config/preferencias     → horas por día, etc.
const coleccion = uid => collection(db, 'usuarios', uid, 'tareas');
const documento = (uid, id) => doc(db, 'usuarios', uid, 'tareas', id);
const preferencias = uid => doc(db, 'usuarios', uid, 'config', 'preferencias');

// Completa los campos que falten (por ejemplo, en entregas creadas con versiones anteriores).
const completar = t => ({
  fechaEntrega: '', horasEstimadas: 0, subtareas: [], notas: '', links: [], horasReales: 0, ...t,
});

// SESIÓN: avisa cuando hay un usuario. Si no hay, inicia una sesión anónima.
export function escucharSesion(alEntrar, alFallar) {
  return onAuthStateChanged(auth, usuario => {
    if (usuario) alEntrar(usuario.uid);
    else signInAnonymously(auth).catch(alFallar);
  });
}

// ---------- entregas ----------
export async function leerTareas(uid) {
  const resultado = await getDocs(query(coleccion(uid), orderBy('creada')));
  return resultado.docs.map(d => completar({ id: d.id, ...d.data() }));
}

export async function crearTarea(uid, datos) {
  const nueva = completar({ ...datos, estado: 'pendiente', creada: Date.now() });
  const ref = await addDoc(coleccion(uid), nueva);
  return { id: ref.id, ...nueva };
}

// "cambios" tiene solo los campos que cambian. Ej: { estado: 'revision' }
export function actualizarTarea(uid, id, cambios) {
  return updateDoc(documento(uid, id), cambios);
}

export function borrarTarea(uid, id) {
  return deleteDoc(documento(uid, id));
}

// ---------- preferencias ----------
// Devuelve null si la persona todavía no las configuró (primera vez que entra).
export async function leerPreferencias(uid) {
  const snap = await getDoc(preferencias(uid));
  return snap.exists() ? snap.data() : null;
}

export function guardarPreferencias(uid, cambios) {
  return setDoc(preferencias(uid), cambios, { merge: true }); // merge: no pisa lo que ya había
}
