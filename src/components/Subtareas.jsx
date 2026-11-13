import { useState } from 'react';
import { ESTADOS_SUB } from '../data/estados.js';
import { nombreVisible, iniciales, colorDe } from '../lib/personas.js';

// Mini tablero de subtareas (partes de la entrega) dentro del detalle. Es opcional.
// Recibe la lista y una función onCambiar(nuevaLista) que guarda en Firestore.
// Es el mismo patrón del tablero grande, pero más chico.
// Desde la v3, si la entrega está compartida, cada parte puede tener un responsable.
export default function Subtareas({ subtareas, onCambiar, miembros = [], miembrosInfo = {}, uid }) {
  const [titulo, setTitulo] = useState('');
  const [horas, setHoras] = useState('');
  const [responsable, setResponsable] = useState(''); // al crear una parte ya se puede asignar
  const [error, setError] = useState('');
  const [arrastrando, setArrastrando] = useState(null);
  const [encima, setEncima] = useState(null);

  // El selector de responsable solo tiene sentido si hay con quién repartir.
  const compartida = miembros.length > 1;

  // AGREGAR una subtarea
  const agregar = async e => {
    e.preventDefault();
    if (!titulo.trim()) return setError('Escribí un nombre para la subtarea.');
    const h = horas === '' ? 0 : parseFloat(horas); // las horas son opcionales
    if (isNaN(h) || h < 0) return setError('Las horas tienen que ser un número positivo.');
    setError('');
    const nueva = { id: crypto.randomUUID(), titulo: titulo.trim(), horas: h, estado: 'pendiente', asignadoA: responsable || null };
    const salioBien = await onCambiar([...subtareas, nueva]);
    if (salioBien) { setTitulo(''); setHoras(''); setResponsable(''); }
  };

  // MOVER: cambia el estado de una subtarea
  const mover = (id, estado) => onCambiar(subtareas.map(s => (s.id === id ? { ...s, estado } : s)));

  // ASIGNAR: quién se hace cargo de esta parte ('' = sin asignar)
  const asignar = (id, quien) =>
    onCambiar(subtareas.map(s => (s.id === id ? { ...s, asignadoA: quien || null } : s)));

  // Clic en una subtarea: pasa al estado siguiente (pendiente → en curso → hecha → pendiente).
  // Sirve en el celular, donde arrastrar no anda.
  const avanzar = s => {
    const orden = ESTADOS_SUB.map(e => e.clave);
    mover(s.id, orden[(orden.indexOf(s.estado) + 1) % orden.length]);
  };

  const borrar = (e, id) => {
    e.stopPropagation(); // que no cuente también como clic para avanzar
    onCambiar(subtareas.filter(s => s.id !== id));
  };

  const soltar = estado => {
    if (arrastrando) mover(arrastrando, estado);
    setArrastrando(null);
    setEncima(null);
  };

  return (
    <div className="bloque">
      <div className="bloque-h">
        <h3>Partes de la entrega</h3>
        {subtareas.length > 0 && (
          <span className="nota">
            {compartida ? 'arrastrá, tocá para avanzar y repartí quién hace qué' : 'arrastrá entre columnas o tocá para avanzar'}
          </span>
        )}
      </div>

      {subtareas.length === 0 && (
        <p className="aviso aviso-arriba">Desarmala en pasos chicos: es más fácil arrancar y ver cuánto avanzaste.</p>
      )}

      {subtareas.length > 0 && <div className="mini-board">
        {ESTADOS_SUB.map(col => {
          const dentro = subtareas.filter(s => s.estado === col.clave);
          return (
            <div key={col.clave} className={'mini-col' + (encima === col.clave ? ' sobre' : '')}
                 onDragOver={e => { e.preventDefault(); setEncima(col.clave); }}
                 onDragLeave={() => setEncima(null)}
                 onDrop={() => soltar(col.clave)}>
              <div className="mini-h">
                <span className="punto" style={{ background: col.color }}></span>
                <span className="nom">{col.titulo}</span>
                <span className="num">{dentro.length}</span>
              </div>
              {dentro.length === 0 && <div className="mini-vacia">—</div>}
              {dentro.map(s => (
                <div key={s.id} className={'mini-f' + (arrastrando === s.id ? ' fantasma' : '')}
                     draggable
                     onDragStart={() => setArrastrando(s.id)}
                     onDragEnd={() => { setArrastrando(null); setEncima(null); }}
                     onClick={() => avanzar(s)}>
                  <div className={'mini-t' + (col.clave === 'hecha' ? ' ok' : '')}>{s.titulo}</div>

                  {compartida && (
                    // Responsable: circulito con sus iniciales + selector para cambiarlo.
                    // El clic no tiene que avanzar el estado de la parte, por eso lo frenamos acá.
                    <div className="mini-resp">
                    {s.asignadoA && miembros.includes(s.asignadoA) ? (
                      <span className="avatar avatar-xs" style={{ background: colorDe(s.asignadoA) }} aria-hidden="true">
                        {iniciales(miembrosInfo[s.asignadoA])}
                      </span>
                    ) : (
                      <span className="avatar avatar-xs avatar-vacio" aria-hidden="true">?</span>
                    )}
                    <select className={'mini-asig' + (s.asignadoA ? ' asignada' : '')}
                            value={s.asignadoA || ''}
                            aria-label={`Responsable de ${s.titulo}`}
                            onClick={e => e.stopPropagation()}
                            onChange={e => { e.stopPropagation(); asignar(s.id, e.target.value); }}>
                      <option value="">Sin asignar</option>
                      {miembros.map(m => (
                        <option key={m} value={m}>
                          {nombreVisible(miembrosInfo[m])}{m === uid ? ' (vos)' : ''}
                        </option>
                      ))}
                    </select>
                    </div>
                  )}

                  <div className="mini-p">
                    <span>{s.horas ? `${s.horas} h` : ''}</span>
                    <button className="x" onClick={e => borrar(e, s.id)} aria-label="Eliminar subtarea">×</button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>}

      {error && <p className="error error-sub">{error}</p>}
      <form className="fila-f" onSubmit={agregar}>
        <input className="campo crece" placeholder="Ej: Leer la bibliografía" aria-label="Nombre de la parte"
               value={titulo} onChange={e => { setTitulo(e.target.value); setError(''); }} />
        <input className="campo campo-hs-opc" type="number" min="0" step="0.5" placeholder="hs (opc.)" aria-label="Horas estimadas (opcional)"
               value={horas} onChange={e => { setHoras(e.target.value); setError(''); }} />
        {compartida && (
          <select className="campo campo-resp" value={responsable} aria-label="Quién se encarga"
                  onChange={e => setResponsable(e.target.value)}>
            <option value="">¿Quién se encarga?</option>
            {miembros.map(m => (
              <option key={m} value={m}>{nombreVisible(miembrosInfo[m])}{m === uid ? ' (vos)' : ''}</option>
            ))}
          </select>
        )}
        <button className="btn btn-sm" type="submit">+ Agregar</button>
      </form>
    </div>
  );
}
