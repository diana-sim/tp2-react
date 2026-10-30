import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase.js';
import FormNueva from './components/FormNueva.jsx';
import Tablero from './components/Tablero.jsx';

// App sigue siendo el "dueño" de las tareas. Lo nuevo es que ahora,
// antes de cambiar el estado, le pedimos a Firestore que guarde el cambio.
// Si Firestore falla, NO tocamos la pantalla y mostramos un error.
export default function App() {
  const [tareas, setTareas] = useState([]);       // arranca vacío: los datos vienen de Firestore
  const [uid, setUid] = useState(null);           // id del usuario anónimo
  const [cargando, setCargando] = useState(true); // true mientras traemos los datos
  const [error, setError] = useState('');         // mensaje de error ('' = no hay)
  const [aviso, setAviso] = useState('');         // mensaje de éxito que aparece abajo

  // ---------- 1. AL ABRIR LA APP: iniciar sesión y LEER ----------
  // useEffect ejecuta código DESPUÉS de dibujar. Con [] al final,
  // se ejecuta una sola vez, cuando la app aparece en pantalla.
  useEffect(() => {
    // onAuthStateChanged "escucha" la sesión: se ejecuta al abrir la app
    // y cada vez que alguien inicia o cierra sesión.
    const dejarDeEscuchar = onAuthStateChanged(auth, async usuario => {
      if (!usuario) {
        // No hay sesión: pedimos una anónima. Cuando se concrete,
        // esta misma función se vuelve a ejecutar, ya con un usuario.
        signInAnonymously(auth).catch(() => {
          setError('No se pudo iniciar sesión. Revisá tu conexión y recargá.');
          setCargando(false);
        });
        return;
      }

      setUid(usuario.uid);
      try {
        // LEER: traemos todos los documentos de usuarios/{uid}/tareas,
        // ordenados por fecha de creación.
        const consulta = query(collection(db, 'usuarios', usuario.uid, 'tareas'), orderBy('creada'));
        const resultado = await getDocs(consulta);
        // Cada documento trae su id por un lado y sus datos por otro: los juntamos.
        setTareas(resultado.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {
        setError('No se pudieron cargar tus entregas.');
      } finally {
        setCargando(false); // pase lo que pase, dejamos de mostrar "cargando"
      }
    });

    // Al salir, dejamos de escuchar la sesión (limpieza del efecto).
    return dejarDeEscuchar;
  }, []);

  // El aviso de éxito se borra solo a los 2 segundos.
  useEffect(() => {
    if (!aviso) return;
    const temporizador = setTimeout(() => setAviso(''), 2000);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  // Atajo: la referencia a la colección de este usuario.
  const coleccion = () => collection(db, 'usuarios', uid, 'tareas');

  // ---------- 2. AGREGAR ----------
  // "async" + "await": esperamos a que Firestore responda antes de seguir.
  const agregar = async (titulo, materia) => {
    setError('');
    try {
      const nueva = { titulo, materia, estado: 'pendiente', creada: Date.now() };
      const ref = await addDoc(coleccion(), nueva); // Firestore genera el id
      // Recién ahora, con el guardado confirmado, actualizamos la pantalla.
      // "prev => ..." usa la versión más reciente del estado (importante después de un await).
      setTareas(prev => [...prev, { id: ref.id, ...nueva }]);
      setAviso('Entrega guardada');
      return true; // le avisamos a FormNueva que salió bien
    } catch {
      setError('No se pudo guardar la entrega. Probá de nuevo.');
      return false;
    }
  };

  // ---------- 3. MODIFICAR (mover de columna) ----------
  const mover = async (id, estado) => {
    setError('');
    try {
      // doc(...) apunta a UN documento puntual; updateDoc cambia solo el campo "estado".
      await updateDoc(doc(db, 'usuarios', uid, 'tareas', id), { estado });
      setTareas(prev => prev.map(t => (t.id === id ? { ...t, estado } : t)));
    } catch {
      setError('No se pudo mover la entrega.');
    }
  };

  // ---------- 4. ELIMINAR ----------
  const eliminar = async id => {
    setError('');
    try {
      await deleteDoc(doc(db, 'usuarios', uid, 'tareas', id));
      setTareas(prev => prev.filter(t => t.id !== id));
      setAviso('Entrega eliminada');
    } catch {
      setError('No se pudo eliminar la entrega.');
    }
  };

  // ---------- LO QUE SE DIBUJA ----------
  return (
    <main className="app">
      <header className="head">
        <div>
          <h1>Tablero</h1>
          <p className="sub">Arrastrá una entrega a otra columna para cambiarle el estado.</p>
        </div>
      </header>

      {error && <p className="error error-pag">{error}</p>}

      {/* Mientras carga mostramos un mensaje; cuando termina, el tablero. */}
      {cargando ? (
        <p className="cargando">Cargando tus entregas…</p>
      ) : (
        <>
          <FormNueva onAgregar={agregar} />
          <Tablero tareas={tareas} onMover={mover} onEliminar={eliminar} />
        </>
      )}

      {aviso && <div className="toast">{aviso}</div>}
    </main>
  );
}