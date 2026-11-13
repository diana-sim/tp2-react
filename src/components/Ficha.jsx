import { ESTADOS } from '../data/estados.js';
import { situacion, progreso } from '../lib/calculos.js';
import { fmtFecha } from '../lib/formato.js';
import BarraProgreso from './BarraProgreso.jsx';
import EtiquetaSituacion from './EtiquetaSituacion.jsx';
import MarcaCompartida from './MarcaCompartida.jsx';

// Una tarjeta del tablero. Tocarla abre el detalle; arrastrarla o usar las flechas la cambia de columna.
export default function Ficha({ tarea, ritmo, hpd, fantasma, onArrastrar, onMover, onAbrir }) {
  const i = ESTADOS.findIndex(e => e.clave === tarea.estado);
  const anterior = ESTADOS[i - 1];
  const siguiente = ESTADOS[i + 1];
  const sit = situacion(tarea, ritmo.factor, hpd);

  // Las flechas están DENTRO de la ficha, que también es clickeable.
  // stopPropagation evita que el clic en la flecha abra además el detalle.
  const moverA = (e, destino) => {
    e.stopPropagation();
    onMover(tarea.id, destino.clave);
  };

  return (
    <article
      className={'ficha' + (fantasma ? ' fantasma' : '')}
      draggable
      onDragStart={() => onArrastrar(tarea.id)}
      onDragEnd={() => onArrastrar(null)}
      onClick={() => onAbrir(tarea.id)}
    >
      <div className="ficha-top">
        <span className="tag">{tarea.materia}</span>
        <span className="ficha-fecha">{fmtFecha(tarea.fechaEntrega)}</span>
      </div>

      <div className="ficha-t"><MarcaCompartida tarea={tarea} />{tarea.titulo}</div>
      <BarraProgreso tarea={tarea} color={tarea.estado === 'terminada' ? 'gris' : sit.color} />

      <div className="ficha-p">
        <EtiquetaSituacion sit={sit} />
        <span className="ficha-pct">{progreso(tarea)}%</span>
        {/* En el celular no se puede arrastrar: estas flechas hacen lo mismo. */}
        <span className="ficha-flechas">
          <button className="flecha" disabled={!anterior} onClick={e => moverA(e, anterior)}
                  aria-label="Mover a la columna anterior">←</button>
          <button className="flecha" disabled={!siguiente} onClick={e => moverA(e, siguiente)}
                  aria-label="Mover a la columna siguiente">→</button>
        </span>
      </div>
    </article>
  );
}
