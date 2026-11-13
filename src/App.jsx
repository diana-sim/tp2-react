import { useEffect, useMemo, useState } from 'react';
import {
  leerTareas, crearTarea, actualizarTarea, borrarTarea, leerPreferencias, guardarPreferencias,
} from './services/tareas.js';
import { escucharSesion, salir } from './services/auth.js';
import Login from './components/Login.jsx';
import { calcularRitmo, HORAS_POR_DIA_DEFECTO } from './lib/calculos.js';
import Sidebar from './components/Sidebar.jsx';
import FormNueva from './components/FormNueva.jsx';
import Bienvenida from './components/Bienvenida.jsx';
import PanelDetalle from './components/PanelDetalle.jsx';
import VistaHoy from './views/VistaHoy.jsx';
import VistaEntregas from './views/VistaEntregas.jsx';
import VistaRitmo from './views/VistaRitmo.jsx';
import { crearDemo, entregaDePrueba } from './data/demo.js';

// Selector de datos de prueba: solo aparece con `npm run dev` (no en Vercel),
// salvo que se active la variable VITE_MODO_DEV=true.
const MOSTRAR_DEV = import.meta.env.DEV || import.meta.env.VITE_MODO_DEV === 'true';

// App es el dueño de los datos y decide qué sección se muestra.
export default function App() {
  // ---------- datos ----------
  const [tareas, setTareas] = useState([]);
  const [prefs, setPrefs] = useState(null); // { vistaPreferida, horasPorDia }
  const [usuario, setUsuario] = useState(null); // la persona conectada (null = nadie)
  const uid = usuario?.uid;                      // su id: es el nombre de su carpeta en Firestore

  // ---------- interfaz ----------
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [seccion, setSeccion] = useState('hoy');          // 'hoy' | 'entregas' | 'ritmo'
  const [vista, setVista] = useState('lista');            // 'lista' | 'tablero' | 'calendario'
  const [abierta, setAbierta] = useState(null);           // id de la entrega abierta en el panel
  const [creando, setCreando] = useState(false);
  const [bienvenida, setBienvenida] = useState(false);    // primera vez: presentar la app
  const [colapsado, setColapsado] = useState(false);      // menú lateral angosto (solo íconos)

  // ---------- modo dev: datos de prueba en memoria (NO se guardan en Firestore) ----------
  const [modo, setModo] = useState('real');               // 'real' | 'vacio' | 'demo'
  const [tareasDemo, setTareasDemo] = useState([]);
  const enPrueba = modo !== 'real';
  const lista = enPrueba ? tareasDemo : tareas;            // las entregas que se muestran
  const setLista = enPrueba ? setTareasDemo : setTareas;   // y cómo se modifican

  // ---------- sesión: Firebase avisa cuando alguien entra o sale ----------
  useEffect(() => {
    const dejarDeEscuchar = escucharSesion(async u => {
        setUsuario(u);
        if (!u) {
          // Nadie conectado (o acaba de salir): vaciamos todo y se muestra el Login.
          setTareas([]); setPrefs(null); setAbierta(null); setModo('real');
          setCargando(false);
          return;
        }
        setCargando(true);
        const id = u.uid;
        try {
          // Promise.all: pide las dos cosas a la vez y espera a que lleguen ambas.
          const [lista, preferencias] = await Promise.all([leerTareas(id), leerPreferencias(id)]);
          setTareas(lista);
          setPrefs(preferencias);
          setColapsado(!!preferencias?.menuColapsado);
          if (preferencias?.vistaPreferida) setVista(preferencias.vistaPreferida);
          else setBienvenida(true); // nunca eligió vista: es la primera vez
        } catch {
          setError('No se pudieron cargar tus entregas. Revisá tu conexión y recargá.');
        } finally {
          setCargando(false);
        }
    });
    return dejarDeEscuchar;
  }, []);

  useEffect(() => {
    if (!aviso) return;
    const temporizador = setTimeout(() => setAviso(''), 2600);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  // ---------- valores derivados ----------
  const hpd = prefs?.horasPorDia || HORAS_POR_DIA_DEFECTO;   // horas de estudio por día
  const nombre = prefs?.nombre || '';                        // para saludar: "Buenas noches, Diana"
  const ritmo = useMemo(() => calcularRitmo(lista), [lista]);
  const tareaAbierta = lista.find(t => t.id === abierta);
  const activas = lista.filter(t => t.estado !== 'terminada').length;
  const materias = [...new Set(lista.map(t => t.materia))]; // para sugerir al escribir

  // ---------- operaciones (siempre: primero Firestore, después la pantalla) ----------
  const crear = async datos => {
    setError('');
    try {
      const nueva = enPrueba ? entregaDePrueba(datos) : await crearTarea(uid, datos);
      setLista(prev => [...prev, nueva]);
      setCreando(false);
      setAbierta(nueva.id);
      setAviso('Entrega creada');
      return true;
    } catch {
      return false; // el formulario muestra el error
    }
  };

  const actualizar = async (id, cambios, mensaje) => {
    setError('');
    try {
      if (!enPrueba) await actualizarTarea(uid, id, cambios);
      setLista(prev => prev.map(t => (t.id === id ? { ...t, ...cambios } : t)));
      if (mensaje) setAviso(mensaje);
      return true;
    } catch {
      setError('No se pudo guardar el cambio. Probá de nuevo.');
      return false;
    }
  };

  const eliminar = async id => {
    setError('');
    try {
      if (!enPrueba) await borrarTarea(uid, id);
      setLista(prev => prev.filter(t => t.id !== id));
      setAbierta(null);
      setAviso('Entrega eliminada');
    } catch {
      setError('No se pudo eliminar la entrega.');
    }
  };

  const mover = (id, estado) => {
    const t = lista.find(x => x.id === id);
    if (!t || t.estado === estado) return;
    const recordatorio = estado === 'terminada' && !t.horasReales ? 'Abrila y contame cuánto te llevó' : null;
    actualizar(id, { estado }, recordatorio);
  };

  // Guarda una preferencia (vista favorita, horas por día) en Firestore.
  const guardarPreferencia = async cambios => {
    try {
      await guardarPreferencias(uid, cambios);
      setPrefs(prev => ({ ...prev, ...cambios }));
      return true;
    } catch {
      setError('No se pudo guardar tu preferencia. Probá de nuevo.');
      return false;
    }
  };

  // La vista cambia al instante; en segundo plano se recuerda como favorita.
  // Colapsar/expandir el menú: cambia al instante y se recuerda en segundo plano.
  const alternarMenu = () => {
    setColapsado(!colapsado);
    guardarPreferencia({ menuColapsado: !colapsado });
  };

  const cambiarVista = v => {
    setVista(v);
    guardarPreferencia({ vistaPreferida: v });
  };

  // Primera vez: en la bienvenida contó su nombre y eligió su vista favorita.
  const empezar = async (v, nombre) => {
    const salioBien = await guardarPreferencia({ vistaPreferida: v, nombre });
    if (salioBien) { setVista(v); setBienvenida(false); setSeccion('entregas'); }
    return salioBien;
  };

  const irA = s => { setAbierta(null); setSeccion(s); };

  const cambiarModo = m => {
    setModo(m);
    setAbierta(null);
    setTareasDemo(m === 'demo' ? crearDemo() : []);
  };
  const verEntregas = v => { if (v) cambiarVista(v); irA('entregas'); };

  if (cargando) return <p className="cargando">Cargando…</p>;
  if (!usuario) return <Login />; // sin sesión: solo se ve el login

  const cerrarSesion = async () => {
    try { await salir(); } catch { setError('No se pudo cerrar la sesión. Probá de nuevo.'); }
  };

  // Lo que comparten las tres secciones
  const comunes = { tareas: lista, ritmo, hpd, onAbrir: setAbierta, onNueva: () => setCreando(true) };

  return (
    <div className={'app' + (colapsado ? ' colapsado' : '')}>
      <Sidebar seccion={seccion} activas={activas} onIrA={irA} onNueva={() => setCreando(true)}
               colapsado={colapsado} onAlternar={alternarMenu}
               perfil={{
                 nombre, email: usuario.email, onSalir: cerrarSesion,
                 onCambiarNombre: n => guardarPreferencia({ nombre: n }),
                 modo: MOSTRAR_DEV ? modo : null, onCambiarModo: cambiarModo,
               }} />

      <main className="main">
        {enPrueba && (
          <p className="aviso-dev">
            Modo prueba: {modo === 'demo' ? 'entregas ficticias' : 'sin entregas'}. Los cambios no se guardan.
            <button className="link-btn" onClick={() => cambiarModo('real')}>Volver a mis datos</button>
          </p>
        )}
        {error && <p className="error error-pag">{error}</p>}

        {seccion === 'hoy' && <VistaHoy {...comunes} nombre={nombre} onVerEntregas={verEntregas} onVerRitmo={() => irA('ritmo')} />}
        {seccion === 'entregas' && <VistaEntregas {...comunes} vista={vista} onCambiarVista={cambiarVista} onMover={mover} />}
        {seccion === 'ritmo' && <VistaRitmo {...comunes} onCambiarHoras={h => guardarPreferencia({ horasPorDia: h })} />}
      </main>

      {/* El detalle se abre como panel lateral ENCIMA de la sección, sin perderla de vista */}
      {tareaAbierta && (
        <PanelDetalle
          key={tareaAbierta.id}
          tarea={tareaAbierta}
          ritmo={ritmo}
          hpd={hpd}
          materias={materias}
          onActualizar={(cambios, mensaje) => actualizar(tareaAbierta.id, cambios, mensaje)}
          onEliminar={() => eliminar(tareaAbierta.id)}
          onCerrar={() => setAbierta(null)}
        />
      )}

      {creando && <FormNueva materias={materias} ritmo={ritmo} onCrear={crear} onCerrar={() => setCreando(false)} />}
      {bienvenida && <Bienvenida onElegir={empezar} />}
      {aviso && <div className="toast">{aviso}</div>}
    </div>
  );
}
