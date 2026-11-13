// Todo lo que lee o escribe entregas en Firestore está en este archivo.
// (El login está en services/auth.js y el directorio de personas en services/usuarios.js.)
// Los componentes no importan nada de Firebase: llaman a estas funciones.
//
// ---------- DÓNDE VIVEN LOS DATOS (cambió en la v3) ----------
//
// Hasta la v2 las entregas estaban DENTRO de cada usuario:
//     usuarios/{uid}/tareas/{id}
// Eran privadas por diseño: las reglas decían "solo el dueño de esta carpeta entra",
// así que no había forma de que otra persona viera una entrega ajena.
//
// Para poder compartirlas hubo que sacarlas afuera, a una colección propia:
//     tareas/{id}   →  { ..., propietario: uid, miembros: [uid, ...], miembrosInfo: {...} }
//
// Ahora la entrega no está adentro de nadie: lleva su propia lista de miembros,
// y las reglas dicen "entra cualquiera que esté en esa lista".
// Las preferencias siguen siendo privadas, en usuarios/{uid}/config/preferencias.
//
// migrarTareasViejas() trae al modelo nuevo las entregas creadas con v1 y v2.
import {
  addDoc, arrayRemove, arrayUnion, collection, deleteDoc, deleteField, doc,
  getDoc, getDocs, query, setDoc, updateDoc, where, writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase.js';

const tareas = () => collection(db, 'tareas');
const documento = id => doc(db, 'tareas', id);
const preferencias = uid => doc(db, 'usuarios', uid, 'config', 'preferencias');
const tareasViejas = uid => collection(db, 'usuarios', uid, 'tareas');

// Completa los campos que falten (por ejemplo, en entregas de versiones anteriores).
const completar = t => ({
  fechaEntrega: '', horasEstimadas: 0, subtareas: [], notas: '', links: [], horasReales: 0,
  miembros: [], miembrosInfo: {}, propietario: '', ...t,
});

// Las más viejas primero. Antes lo hacía Firestore con orderBy, pero combinar
// un filtro por miembros con un orden por fecha obliga a crear un índice a mano,
// así que para una lista de este tamaño conviene ordenar acá.
const porFecha = lista => [...lista].sort((a, b) => (a.creada || 0) - (b.creada || 0));

// Ficha mínima de una persona, para mostrar quién está en la entrega
// sin tener que ir a buscar su nombre a otra colección cada vez.
const fichaDe = perfil => ({ email: perfil?.email || '', nombre: perfil?.nombre || '' });

// ---------- entregas ----------

// Trae todas las entregas donde la persona figura como miembro:
// las propias y las que le compartieron.
export async function leerTareas(uid) {
  const resultado = await getDocs(query(tareas(), where('miembros', 'array-contains', uid)));
  return porFecha(resultado.docs.map(d => completar({ id: d.id, ...d.data() })));
}

// Al crear, quien la crea queda como propietario y como primer miembro.
export async function crearTarea(uid, datos, perfil) {
  const nueva = completar({
    ...datos,
    estado: 'pendiente',
    creada: Date.now(),
    propietario: uid,
    miembros: [uid],
    miembrosInfo: { [uid]: fichaDe(perfil) },
  });
  const ref = await addDoc(tareas(), nueva);
  return { id: ref.id, ...nueva };
}

// "cambios" tiene solo los campos que cambian. Ej: { estado: 'revision' }
// Ya no hace falta el uid: la entrega no está adentro de nadie.
export function actualizarTarea(id, cambios) {
  return updateDoc(documento(id), cambios);
}

export function borrarTarea(id) {
  return deleteDoc(documento(id));
}

// ---------- compartir ----------

// Suma una persona a la entrega.
// arrayUnion agrega sin duplicar y sin pisar lo que otro haya agregado al mismo tiempo.
export function sumarMiembro(id, persona) {
  return updateDoc(documento(id), {
    miembros: arrayUnion(persona.uid),
    [`miembrosInfo.${persona.uid}`]: fichaDe(persona),
  });
}

// Saca una persona de la entrega y libera las partes que tenía asignadas,
// para que no queden con un responsable que ya no está.
export function quitarMiembro(tarea, uid) {
  const subtareas = (tarea.subtareas || []).map(s => (s.asignadoA === uid ? { ...s, asignadoA: null } : s));
  return updateDoc(documento(tarea.id), {
    miembros: arrayRemove(uid),
    [`miembrosInfo.${uid}`]: deleteField(),
    subtareas,
  });
}

// Cuando alguien cambia su nombre, lo actualizamos en todas las entregas
// que comparte, así los demás ven el nombre nuevo y no el viejo.
export async function actualizarFichaEnTareas(uid, perfil) {
  const resultado = await getDocs(query(tareas(), where('miembros', 'array-contains', uid)));
  if (resultado.empty) return;
  const lote = writeBatch(db);
  resultado.docs.forEach(d => lote.update(d.ref, { [`miembrosInfo.${uid}`]: fichaDe(perfil) }));
  await lote.commit();
}

// ---------- migración de v1/v2 a v3 ----------

// Copia las entregas que estaban dentro del usuario a la colección compartida.
// Las originales NO se borran: quedan como respaldo por si algo sale mal.
// La marca migradoV3 se guarda en el mismo lote, así nunca se duplica:
// o se copia todo y queda marcado, o no pasa nada.
export async function migrarTareasViejas(uid, perfil) {
  const viejas = await getDocs(tareasViejas(uid));
  const lote = writeBatch(db);

  viejas.docs.forEach(d => {
    const datos = completar({ ...d.data() });
    delete datos.id;
    lote.set(doc(tareas()), {
      ...datos,
      propietario: uid,
      miembros: [uid],
      miembrosInfo: { [uid]: fichaDe(perfil) },
    });
  });

  lote.set(preferencias(uid), { migradoV3: true }, { merge: true });
  await lote.commit();
  return viejas.size;
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
