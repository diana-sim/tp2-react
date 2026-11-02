import { useMemo, useState } from 'react';
import { ordenarPorUrgencia } from '../lib/calculos.js';
import FilaTarea from '../components/FilaTarea.jsx';
import Tablero from '../components/Tablero.jsx';
import Calendario from '../components/Calendario.jsx';
import Icono from '../components/Icono.jsx';

// Las tres formas de mirar LAS MISMAS entregas.
const VISTAS = [
  { clave: 'lista',      texto: 'Lista' },
  { clave: 'tablero',    texto: 'Tablero' },
  { clave: 'calendario', texto: 'Calendario' },
];

const FILTROS = [
  { clave: 'activas',    texto: 'Activas',    pasa: t => t.estado !== 'terminada' },
  { clave: 'terminadas', texto: 'Terminadas', pasa: t => t.estado === 'terminada' },
  { clave: 'todas',      texto: 'Todas',      pasa: () => true },
];

const DESCRIPCION = {
  lista: 'Ordenadas por urgencia real: arriba lo que está más al límite, no lo que vence antes.',
  tablero: 'Arrastrá una entrega a otra columna para cambiarle el estado.',
  calendario: 'Cada entrega en su fecha, con el color de cómo venís.',
};

// Sección "Mis entregas": selector de vista + filtros compartidos.
export default function VistaEntregas({ tareas, ritmo, hpd, vista, onCambiarVista, onAbrir, onMover, onNueva }) {
  const [filtro, setFiltro] = useState('activas');
  const [busqueda, setBusqueda] = useState('');

  // El buscador vale para las tres vistas. El filtro de estado no se usa en el
  // Tablero, porque ahí los estados ya son las columnas.
  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    const { pasa } = FILTROS.find(f => f.clave === filtro);
    return tareas
      .filter(t => vista === 'tablero' || pasa(t))
      .filter(t => !texto || t.titulo.toLowerCase().includes(texto) || t.materia.toLowerCase().includes(texto));
  }, [tareas, filtro, busqueda, vista]);

  const comunes = { ritmo, hpd, onAbrir };

  return (
    <>
      <div className="head">
        <div>
          <h1>Mis entregas</h1>
          <p className="sub">{DESCRIPCION[vista]}</p>
        </div>
        <button className="btn btn-pri" onClick={onNueva}>+ Nueva entrega</button>
      </div>

      <div className="barra-vistas">
        {/* Selector de vista: botones pegados, uno activo a la vez */}
        <div className="selector" role="tablist" aria-label="Elegí cómo ver tus entregas">
          {VISTAS.map(v => (
            <button key={v.clave} role="tab" aria-selected={vista === v.clave}
                    className={'selector-op' + (vista === v.clave ? ' on' : '')} onClick={() => onCambiarVista(v.clave)}>
              <Icono nombre={v.clave} /> {v.texto}
            </button>
          ))}
        </div>

        {vista !== 'tablero' && (
          <div className="tabs">
            {FILTROS.map(f => (
              <button key={f.clave} className={'tab' + (filtro === f.clave ? ' on' : '')} onClick={() => setFiltro(f.clave)}>
                {f.texto} <span className="tab-n">{tareas.filter(f.pasa).length}</span>
              </button>
            ))}
          </div>
        )}

        <input className="campo buscar" placeholder="Buscar por título o materia…" aria-label="Buscar"
               value={busqueda} onChange={e => setBusqueda(e.target.value)} />
      </div>

      {tareas.length === 0 ? (
        <div className="card">
          <div className="vacio">
            <h3>Todavía no cargaste entregas</h3>
            <p>Empezá por la que más te preocupa: con una sola ya te puedo ayudar.</p>
            <button className="btn btn-pri" onClick={onNueva}>+ Nueva entrega</button>
          </div>
        </div>
      ) : vista === 'lista' ? (
        <div className="card">
          {visibles.length === 0
            ? <div className="vacio"><h3>Nada por acá</h3><p>Probá con otro filtro o búsqueda.</p></div>
            : <div className="filas">{ordenarPorUrgencia(visibles, ritmo.factor, hpd).map(t => <FilaTarea key={t.id} tarea={t} {...comunes} />)}</div>}
        </div>
      ) : vista === 'tablero' ? (
        <Tablero tareas={visibles} {...comunes} onMover={onMover} />
      ) : (
        <Calendario tareas={visibles} {...comunes} />
      )}
    </>
  );
}
