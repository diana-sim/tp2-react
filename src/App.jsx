import { useEffect, useMemo, useState } from 'react';
import {
  leerTareas, crearTarea, actualizarTarea, borrarTarea, leerPreferencias, guardarPreferencias,
  sumarMiembro, quitarMiembro, migrarTareasViejas, actualizarFichaEnTareas,
} from './services/tareas.js';
import { registrarUsuario } from './services/usuarios.js';
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
          const preferencias = await leerPreferencias(id);
          const ficha = { email: u.email, nombre: preferencias?.nombre || '' };

          // Dejamos su email en el directorio para que puedan invitarla a entregas.
          await registrarUsuario(id, u.email, ficha.nombre);

          // Primera vez con la v3: las entregas de antes estaban dentro del usuario.
          // Las copiamos a la colección compartida. Si falla, la app sigue funcionando.
          let migradas = 0;
          if (!preferencias?.migradoV3) {
            try {
              migradas = await migrarTareasViejas(id, ficha);
            } catch {
              setError('No se pudieron pasar tus entregas al formato nuevo. Probá recargar la página.');
            }
          }

          const lista = await leerTareas(id);
          setTareas(lista);
          setPrefs({ ...preferencias, migradoV3: true });
          setColapsado(!!preferencias?.menuColapsado);
          if (preferencias?.vistaPreferida) setVista(preferencias.vistaPreferida);
          else setBienvenida(true); // nunca eligió vista: es la primera vez
          if (migradas > 0) setAviso(`Listo: ${migradas} ${migradas === 1 ? 'entrega preparada' : 'entregas preparadas'} para compartir`);
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
  const perfil = { email: usuario?.email || '', nombre };    // cómo me ven los demás en una entrega compartida
  // En modo prueba las entregas son ficticias y su "dueño" es el usuario demo.
  const uidVista = enPrueba ? 'demo' : uid;
  const ritmo = useMemo(() => calcularRitmo(lista), [lista]);
  const tareaAbierta = lista.find(t => t.id === abierta);
  const activas = lista.filter(t => t.estado !== 'terminada').length;
  const materias = [...new Set(lista.map(t => t.materia))]; // para sugerir al escribir

  // ---------- operaciones (siempre: primero Firestore, después la pantalla) ----------
  const crear = async datos => {
    setError('');
    try {
      const nueva = enPrueba ? entregaDePrueba(datos) : await crearTarea(uid, datos, perfil);
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
      if (!enPrueba) await actualizarTarea(id, cambios);
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
      if (!enPrueba) await borrarTarea(id);
      setLista(prev => prev.filter(t => t.id !== id));
      setAbierta(null);
      setAviso('Entrega eliminada');
    } catch {
      setError('No se pudo eliminar la entrega.');
    }
  };

  // ---------- compartir una entrega ----------
  // Después de tocar la lista de miembros releemos la entrega desde el estado local:
  // los cambios que hace la otra persona se ven al recargar.
  const sumarPersona = async persona => {
    if (enPrueba) { setError('En modo prueba no se puede compartir: son entregas ficticias.'); return false; }
    try {
      await sumarMiembro(tareaAbierta.id, persona);
      setTareas(prev => prev.map(t => (t.id === tareaAbierta.id
        ? { ...t,
            miembros: [...t.miembros, persona.uid],
            miembrosInfo: { ...t.miembrosInfo, [persona.uid]: { email: persona.email, nombre: persona.nombre || '' } } }
        : t)));
      setAviso('Entrega compartida');
      return true;
    } catch {
      setError('No se pudo compartir la entrega. Probá de nuevo.');
      return false;
    }
  };

  const quitarPersona = async quien => {
    if (enPrueba) return false;
    const tarea = tareaAbierta;
    try {
      await quitarMiembro(tarea, quien);
      if (quien === uid) {
        // Me salí de una entrega que me habían compartido: deja de aparecerme.
        setTareas(prev => prev.filter(t => t.id !== tarea.id));
        setAbierta(null);
        setAviso('Saliste de la entrega');
        return true;
      }
      setTareas(prev => prev.map(t => {
        if (t.id !== tarea.id) return t;
        const info = { ...t.miembrosInfo };
        delete info[quien];
        return {
          ...t,
          miembros: t.miembros.filter(m => m !== quien),
          miembrosInfo: info,
          subtareas: t.subtareas.map(sub => (sub.asignadoA === quien ? { ...sub, asignadoA: null } : sub)),
        };
      }));
      setAviso('Persona quitada de la entrega');
      return true;
    } catch {
      setError('No se pudo quitar a esa persona. Probá de nuevo.');
      return false;
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
                 onCambiarNombre: async n => {
                   const salioBien = await guardarPreferencia({ nombre: n });
                   // Que el nombre nuevo se vea también en las entregas que comparte.
                   if (salioBien && !enPrueba) {
                     try {
                       await registrarUsuario(uid, usuario.email, n);
                       await actualizarFichaEnTareas(uid, { email: usuario.email, nombre: n });
                       setTareas(prev => prev.map(t => (t.miembrosInfo?.[uid]
                         ? { ...t, miembrosInfo: { ...t.miembrosInfo, [uid]: { email: usuario.email, nombre: n } } }
                         : t)));
                     } catch { /* el nombre ya quedó guardado; los demás lo verán al recargar */ }
                   }
                   return salioBien;
                 },
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
          uid={uidVista}
          onSumarMiembro={sumarPersona}
          onQuitarMiembro={quitarPersona}
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
