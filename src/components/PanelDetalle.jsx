import { useEffect, useState } from 'react';
import { ESTADOS } from '../data/estados.js';
import {
  situacion, diasRestantes, progreso, progresoEnCurso, tieneSubtareas, tieneEstimacion, usaHorasDePartes,
  describirRitmo, cuentaHechas, horasEstimadas, horasHechas, horasEnCurso, horasFaltan, sugerirReserva,
} from '../lib/calculos.js';
import { fmtFecha, fmtHoras, textoDias } from '../lib/formato.js';
import Anillo from './Anillo.jsx';
import Subtareas from './Subtareas.jsx';
import Compartir from './Compartir.jsx';
import { iniciales, nombreVisible } from '../lib/personas.js';
import EtiquetaSituacion from './EtiquetaSituacion.jsx';
import MarcaCompartida from './MarcaCompartida.jsx';
import Mascota from './Mascota.jsx';

const COLOR_ANILLO = { rojo: '#F2A8C4', ambar: '#F0B47E', oliva: '#A8C86E', gris: '#A8C86E', celeste: '#86C3D8' };

// Panel lateral con el detalle de UNA entrega.
// Se abre encima de la sección actual, así al cerrarlo seguís donde estabas.
// onActualizar(cambios, mensaje) guarda en Firestore solo los campos que cambian.
export default function PanelDetalle({
  tarea, ritmo, hpd, materias, uid, onActualizar, onEliminar, onCerrar,
  onInvitar, onCancelarInvitacion, onQuitarMiembro,
}) {
  const sit = situacion(tarea, ritmo.factor, hpd);
  const terminada = tarea.estado === 'terminada';
  const dias = diasRestantes(tarea);

  // Cerrar con Escape
  useEffect(() => {
    const alApretar = e => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', alApretar);
    return () => window.removeEventListener('keydown', alApretar);
  }, [onCerrar]);

  return (
    <>
      <div className="panel-fondo" onClick={onCerrar}></div>
      <aside className="panel" role="dialog" aria-label={tarea.titulo}>
        <div className="panel-h">
          <span className="tag">{tarea.materia}</span>
          {(tarea.miembros || []).length > 1 && (
            <span className="avatares" aria-label={`Compartida con ${tarea.miembros.length} personas`}>
              {tarea.miembros.map(m => (
                <span className="avatar avatar-sm" key={m} title={nombreVisible(tarea.miembrosInfo?.[m])}>
                  {iniciales(tarea.miembrosInfo?.[m])}
                </span>
              ))}
            </span>
          )}
          <button className="x x-grande" onClick={onCerrar} aria-label="Cerrar">×</button>
        </div>

        <div className="panel-b">
          <Encabezado tarea={tarea} materias={materias} onActualizar={onActualizar} />

          <div className="panel-estado">
            <EtiquetaSituacion sit={sit} />
            <span className="panel-frase">{sit.frase}</span>
            <select className="campo campo-estado" value={tarea.estado} aria-label="Estado"
                    onChange={e => onActualizar({ estado: e.target.value })}>
              {ESTADOS.map(est => <option key={est.clave} value={est.clave}>{est.titulo}</option>)}
            </select>
          </div>

          {sit.clave === 'vencida' && (
            <div className="con-mascota aviso-vencida">
              <Mascota pose="preocupada" tamano={56} />
              <p className="alerta">La fecha ya pasó. Si todavía la tenés que entregar, cambiá la fecha con <b>Editar</b> o hablalo con el profe. Si ya la entregaste, marcala como terminada.</p>
            </div>
          )}

          {/* ---------- avance ---------- */}
          <div className="bloque">
            <h3>Avance</h3>
            <div className="dona">
              <Anillo pct={progreso(tarea)} curso={progresoEnCurso(tarea)} color={COLOR_ANILLO[sit.color]} />
              <div className="dona-txt">
                <div className="dona-n">
                  {terminada ? 'Terminada' : tieneSubtareas(tarea) ? `${cuentaHechas(tarea)} de ${tarea.subtareas.length} partes` : 'Sin partes todavía'}
                </div>
                {!terminada && tieneEstimacion(tarea) && (
                  <div className="dona-c">
                    {fmtHoras(horasHechas(tarea))} de {fmtHoras(horasEstimadas(tarea))} hechas
                    {horasEnCurso(tarea) > 0 && ` · ${fmtHoras(horasEnCurso(tarea))} en proceso`}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ---------- partes ---------- */}
          <Subtareas subtareas={tarea.subtareas} onCambiar={subtareas => onActualizar({ subtareas })}
                     miembros={tarea.miembros} miembrosInfo={tarea.miembrosInfo} uid={uid} />

          <Compartir tarea={tarea} uid={uid} onInvitar={onInvitar}
                     onCancelarInvitacion={onCancelarInvitacion} onQuitar={onQuitarMiembro} />

                    <Notas tarea={tarea} onActualizar={onActualizar} />
          <Links tarea={tarea} onActualizar={onActualizar} />

          {/* ---------- tiempo (extra) ---------- */}
          <div className="bloque bloque-extra">
            <div className="bloque-h">
              <h3>Tiempo</h3>
              <span className="nota">extra · alimenta <b>Mi ritmo</b></span>
            </div>
            {!terminada && <Estimacion tarea={tarea} ritmo={ritmo} onActualizar={onActualizar} />}
            {!terminada && sit.clave === 'riesgo' && (
              <div className="con-mascota"><Mascota pose="preocupada" tamano={56} /><p className="alerta">
                Te {dias > 1 ? `quedan ${dias} días` : dias === 1 ? 'queda 1 día' : 'queda hoy'} ({fmtHoras(Math.max(dias, 0) * hpd)} de estudio)
                y, a tu ritmo, necesitás {fmtHoras(horasFaltan(tarea) * ritmo.factor)}. Podés achicar el alcance,
                pedir más tiempo o sumar horas estos días.
              </p></div>
            )}
            <Cierre tarea={tarea} ritmo={ritmo} onActualizar={onActualizar} />
          </div>

          {tarea.propietario === uid ? (
            <button className="btn btn-sm btn-peligro"
                    onClick={() => window.confirm(`¿Eliminar "${tarea.titulo}"? Se elimina para todos y no se puede deshacer.`) && onEliminar()}>
              Eliminar entrega
            </button>
          ) : (
            <p className="aviso">
              Esta entrega la creó {nombreVisible(tarea.miembrosInfo?.[tarea.propietario])}. Podés editarla, pero no eliminarla.
            </p>
          )}
        </div>
      </aside>
    </>
  );
}

// ============================================================
// Partes del panel. Son componentes chicos en el mismo archivo
// porque solo se usan acá.
// ============================================================

// Título y fecha, con modo edición.
function Encabezado({ tarea, materias, onActualizar }) {
  const [editando, setEditando] = useState(false);
  const [campos, setCampos] = useState({ titulo: tarea.titulo, materia: tarea.materia, fechaEntrega: tarea.fechaEntrega });
  const [error, setError] = useState('');

  const guardar = async e => {
    e.preventDefault();
    if (!campos.titulo.trim() || !campos.materia.trim()) return setError('Título y materia no pueden quedar vacíos.');
    if (!campos.fechaEntrega) return setError('Elegí una fecha de entrega.');
    const salioBien = await onActualizar(
      { titulo: campos.titulo.trim(), materia: campos.materia.trim(), fechaEntrega: campos.fechaEntrega }, 'Cambios guardados');
    if (salioBien) { setEditando(false); setError(''); }
  };

  if (!editando) {
    return (
      <div className="panel-tit">
        <h1><MarcaCompartida tarea={tarea} tamano={18} />{tarea.titulo}</h1>
        <p className="sub">
          Entrega {fmtFecha(tarea.fechaEntrega)}
          {tarea.fechaEntrega && tarea.estado !== 'terminada' && ` · ${textoDias(diasRestantes(tarea))}`}
          <button className="link-btn" onClick={() => setEditando(true)}>Editar</button>
        </p>
      </div>
    );
  }

  return (
    <form className="bloque" onSubmit={guardar}>
      {error && <p className="error">{error}</p>}
      <label className="lbl-c" htmlFor="e-titulo">Título</label>
      <input id="e-titulo" className="campo" value={campos.titulo} onChange={e => setCampos({ ...campos, titulo: e.target.value })} />
      <div className="grid2">
        <div>
          <label className="lbl-c" htmlFor="e-materia">Materia</label>
          <input id="e-materia" className="campo" list="lista-materias-e" value={campos.materia}
                 onChange={e => setCampos({ ...campos, materia: e.target.value })} />
          <datalist id="lista-materias-e">{materias.map(m => <option key={m} value={m} />)}</datalist>
        </div>
        <div>
          <label className="lbl-c" htmlFor="e-fecha">Fecha de entrega</label>
          <input id="e-fecha" className="campo" type="date" value={campos.fechaEntrega}
                 onChange={e => setCampos({ ...campos, fechaEntrega: e.target.value })} />
        </div>
      </div>
      <div className="fila-f">
        <button className="btn btn-sm btn-pri" type="submit">Guardar</button>
        <button className="btn btn-sm" type="button" onClick={() => setEditando(false)}>Cancelar</button>
      </div>
    </form>
  );
}

// Estimación general (solo si las partes no tienen horas: si las tienen, la estimación es la suma).
function Estimacion({ tarea, ritmo, onActualizar }) {
  const [horas, setHoras] = useState(tarea.horasEstimadas ? String(tarea.horasEstimadas) : '');

  if (usaHorasDePartes(tarea)) {
    return <p className="aviso aviso-arriba">Estimación: {fmtHoras(horasEstimadas(tarea))} (la suma de las horas de las partes).</p>;
  }

  const guardar = () => {
    const h = parseFloat(horas) || 0;
    if (h !== tarea.horasEstimadas) onActualizar({ horasEstimadas: h }, 'Estimación guardada');
  };
  const sugerencia = sugerirReserva(parseFloat(horas), ritmo);

  return (
    <div>
      <label className="lbl-c" htmlFor="d-horas">¿Cuántas horas creés que te lleva?</label>
      <div className="fila-horas">
        <input id="d-horas" className="campo campo-hs" type="number" min="0" step="0.5" placeholder="hs"
               value={horas} onChange={e => setHoras(e.target.value)} onBlur={guardar} />
        <span className="aviso">Con esto te aviso si llegás con el tiempo que tenés.</span>
      </div>
      {sugerencia && <p className="sugerencia">{sugerencia}</p>}
    </div>
  );
}

// Al terminar: cuánto llevó en realidad (opcional), y comparación sin juicio.
function Cierre({ tarea, ritmo, onActualizar }) {
  const [reales, setReales] = useState('');
  const [error, setError] = useState('');
  const estimado = horasEstimadas(tarea);
  const terminada = tarea.estado === 'terminada';

  // Ya terminada y con horas reales: mostramos cómo le fue.
  if (terminada && tarea.horasReales > 0) {
    const dif = tarea.horasReales - estimado;
    const pct = estimado ? Math.round(Math.abs(dif / estimado) * 100) : 0;
    const comparacion = !estimado
      ? `Te llevó ${fmtHoras(tarea.horasReales)}.`
      : pct < 5
        ? `Calculaste ${fmtHoras(estimado)} y te llevó ${fmtHoras(tarea.horasReales)}. ¡Muy buena estimación!`
        : `Calculaste ${fmtHoras(estimado)} y te llevó ${fmtHoras(tarea.horasReales)} (un ${pct}% ${dif > 0 ? 'más' : 'menos'}).`;
    return (
      <div className="cierre-ok con-mascota">
        <Mascota pose="festejando" tamano={52} />
        <div>
          <p className="dato">{comparacion}</p>
          {estimado > 0 && <p className="aviso">Ya lo sumé a tu ritmo: {describirRitmo(ritmo).titulo.toLowerCase()}.</p>}
        </div>
      </div>
    );
  }

  const guardar = () => {
    const h = reales === '' ? 0 : parseFloat(reales);
    if (isNaN(h) || h < 0) return setError('Las horas tienen que ser un número positivo.');
    if (terminada && !h) return setError('Contame cuántas horas te llevó, aunque sea aproximado.');
    setError('');
    const cambios = terminada ? { horasReales: h } : { estado: 'terminada', ...(h ? { horasReales: h } : {}) };
    onActualizar(cambios, terminada ? 'Listo, lo sumé a tu ritmo' : 'Entrega terminada');
  };

  return (
    <div className="cierre">
      <label className="lbl-c" htmlFor="d-reales">
        {terminada ? '¿Cuánto te llevó en realidad?' : 'Cuando la termines: ¿cuánto te llevó?'} <span className="nota">(opcional)</span>
      </label>
      {error && <p className="error error-sub">{error}</p>}
      <div className="fila-f fila-f-arriba">
        <input id="d-reales" className="campo campo-hs" type="number" min="0" step="0.5" placeholder="hs"
               value={reales} onChange={e => { setReales(e.target.value); setError(''); }} />
        <button className="btn btn-sm btn-pri" onClick={guardar}>{terminada ? 'Guardar' : 'Marcar como terminada'}</button>
      </div>
    </div>
  );
}

// Notas: se guardan al salir del campo, no en cada tecla.
function Notas({ tarea, onActualizar }) {
  const [notas, setNotas] = useState(tarea.notas);
  return (
    <div className="bloque">
      <h3>Notas</h3>
      <textarea className="campo" rows="4" placeholder="Lo que dijo el profe, pendientes, dudas…" aria-label="Notas"
                value={notas} onChange={e => setNotas(e.target.value)}
                onBlur={() => notas !== tarea.notas && onActualizar({ notas }, 'Notas guardadas')}></textarea>
      <p className="aviso">Se guardan solas al salir del campo.</p>
    </div>
  );
}

function Links({ tarea, onActualizar }) {
  const [etiqueta, setEtiqueta] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const agregar = async e => {
    e.preventDefault();
    if (!etiqueta.trim() || !url.trim()) return setError('Completá la etiqueta y la URL.');
    if (!/^https?:\/\//i.test(url.trim())) return setError('La URL tiene que empezar con http:// o https://');
    setError('');
    const nuevo = { id: crypto.randomUUID(), etiqueta: etiqueta.trim(), url: url.trim() };
    if (await onActualizar({ links: [...tarea.links, nuevo] })) { setEtiqueta(''); setUrl(''); }
  };

  return (
    <div className="bloque">
      <h3>Links y material</h3>
      {tarea.links.length === 0 && <p className="aviso">Pegá acá el repo, el Drive, el Figma.</p>}
      {tarea.links.map(l => (
        <div className="link" key={l.id}>
          <a href={l.url} target="_blank" rel="noreferrer">{l.etiqueta}</a>
          <button className="x" aria-label="Eliminar link"
                  onClick={() => onActualizar({ links: tarea.links.filter(x => x.id !== l.id) })}>×</button>
        </div>
      ))}
      {error && <p className="error error-sub">{error}</p>}
      <form className="fila-f" onSubmit={agregar}>
        <input className="campo campo-etiqueta" placeholder="Etiqueta" aria-label="Etiqueta del link"
               value={etiqueta} onChange={e => { setEtiqueta(e.target.value); setError(''); }} />
        <input className="campo crece" placeholder="https://" aria-label="URL"
               value={url} onChange={e => { setUrl(e.target.value); setError(''); }} />
        <button className="btn btn-sm" type="submit">+ Sumar</button>
      </form>
    </div>
  );
}
