import { ESTADOS } from '../data/estados.js';

// Una tarjeta del tablero. No tiene estado propio: todo lo recibe por props.
export default function Ficha({ tarea, fantasma, onArrastrar, onMover, onEliminar }) {
  // Posición de la columna actual, para saber si se puede ir a la izquierda o derecha.
  const i = ESTADOS.findIndex(e => e.clave === tarea.estado);
  const anterior = ESTADOS[i - 1];
  const siguiente = ESTADOS[i + 1];

  return (
    <article
      className={'ficha' + (fantasma ? ' fantasma' : '')}
      draggable
      onDragStart={() => onArrastrar(tarea.id)}
      onDragEnd={() => onArrastrar(null)}
    >
      <div className="ficha-top">
        <span className="tag">{tarea.materia}</span>
        <button className="x" onClick={() => onEliminar(tarea.id)} aria-label="Eliminar entrega">×</button>
      </div>

      <div className="ficha-t">{tarea.titulo}</div>

      {/* En el celular no se puede arrastrar: estos botones hacen lo mismo. */}
      <div className="ficha-p">
        <button className="flecha" disabled={!anterior}
                onClick={() => onMover(tarea.id, anterior.clave)}
                aria-label="Mover a la columna anterior">←</button>
        <button className="flecha" disabled={!siguiente}
                onClick={() => onMover(tarea.id, siguiente.clave)}
                aria-label="Mover a la columna siguiente">→</button>
      </div>
    </article>
  );
}
