import { useEffect, useMemo, useState } from 'react';
import {
  escucharSesion, leerTareas, crearTarea, actualizarTarea, borrarTarea, leerPreferencias, guardarPreferencias,
} from './services/tareas.js';
import { calcularRitmo, HORAS_POR_DIA_DEFECTO } from './lib/calculos.js';
import Sidebar from './components/Sidebar.jsx';
import FormNueva from './components/FormNueva.jsx';
import Bienvenida from './components/Bienvenida.jsx';
import PanelDetalle from './components/PanelDetalle.jsx';
import VistaHoy from './views/VistaHoy.jsx';
import VistaEntregas from './views/VistaEntregas.jsx';
import VistaRitmo from './views/VistaRitmo.jsx';

// App es el dueño de los datos y decide qué sección se muestra.
export default function App() {
  // ---------- datos ----------
  const [tareas, setTareas] = useState([]);
  const [prefs, setPrefs] = useState(null); // { vistaPreferida, horasPorDia }
  const [uid, setUid] = useState(null);

  // ---------- interfaz ----------
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [seccion, setSeccion] = useState('hoy');          // 'hoy' | 'entregas' | 'ritmo'
  const [vista, setVista] = useState('lista');            // 'lista' | 'tablero' | 'calendario'
  const [abierta, setAbierta] = useState(null);           // id de la entrega abierta en el panel
  const [creando, setCreando] = useState(false);
  const [bienvenida, setBienvenida] = useState(false);    // primera vez: presentar la app

  // ---------- al abrir: sesión anónima + lectura ----------
  useEffect(() => {
    const dejarDeEscuchar = escucharSesion(
      async id => {
        setUid(id);
        try {
          // Promise.all: pide las dos cosas a la vez y espera a que lleguen ambas.
          const [lista, preferencias] = await Promise.all([leerTareas(id), leerPreferencias(id)]);
          setTareas(lista);
          setPrefs(preferencias);
          if (preferencias?.vistaPreferida) setVista(preferencias.vistaPreferida);
          else setBienvenida(true); // nunca eligió vista: es la primera vez
        } catch {
          setError('No se pudieron cargar tus entregas. Revisá tu conexión y recargá.');
        } finally {
          setCargando(false);
        }
      },
      () => {
        setError('No se pudo iniciar sesión. Revisá tu conexión y recargá.');
        setCargando(false);
      }
    );
    return dejarDeEscuchar;
  }, []);

  useEffect(() => {
    if (!aviso) return;
    const temporizador = setTimeout(() => setAviso(''), 2600);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  // ---------- valores derivados ----------
  const hpd = prefs?.horasPorDia || HORAS_POR_DIA_DEFECTO;   // horas de estudio por día
  const ritmo = useMemo(() => calcularRitmo(tareas), [tareas]);
  const tareaAbierta = tareas.find(t => t.id === abierta);
  const activas = tareas.filter(t => t.estado !== 'terminada').length;
  const materias = [...new Set(tareas.map(t => t.materia))]; // para sugerir al escribir

  // ---------- operaciones (siempre: primero Firestore, después la pantalla) ----------
  const crear = async datos => {
    setError('');
    try {
      const nueva = await crearTarea(uid, datos);
      setTareas(prev => [...prev, nueva]);
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
      await actualizarTarea(uid, id, cambios);
      setTareas(prev => prev.map(t => (t.id === id ? { ...t, ...cambios } : t)));
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
      await borrarTarea(uid, id);
      setTareas(prev => prev.filter(t => t.id !== id));
      setAbierta(null);
      setAviso('Entrega eliminada');
    } catch {
      setError('No se pudo eliminar la entrega.');
    }
  };

  const mover = (id, estado) => {
    const t = tareas.find(x => x.id === id);
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
  const cambiarVista = v => {
    setVista(v);
    guardarPreferencia({ vistaPreferida: v });
  };

  // Primera vez: eligió su vista favorita en la bienvenida.
  const empezar = async v => {
    const salioBien = await guardarPreferencia({ vistaPreferida: v });
    if (salioBien) { setVista(v); setBienvenida(false); setSeccion('entregas'); }
    return salioBien;
  };

  const irA = s => { setAbierta(null); setSeccion(s); };
  const verEntregas = v => { if (v) cambiarVista(v); irA('entregas'); };

  if (cargando) return <p className="cargando">Cargando tus entregas…</p>;

  // Lo que comparten las tres secciones
  const comunes = { tareas, ritmo, hpd, onAbrir: setAbierta, onNueva: () => setCreando(true) };

  return (
    <div className="app">
      <Sidebar seccion={seccion} activas={activas} onIrA={irA} onNueva={() => setCreando(true)} />

      <main className="main">
        {error && <p className="error error-pag">{error}</p>}

        {seccion === 'hoy' && <VistaHoy {...comunes} onVerEntregas={verEntregas} onVerRitmo={() => irA('ritmo')} />}
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
