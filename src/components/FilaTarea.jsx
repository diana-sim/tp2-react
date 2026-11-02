import { situacion, diasRestantes, progreso } from '../lib/calculos.js';
import { fmtFecha, textoDias } from '../lib/formato.js';
import BarraProgreso from './BarraProgreso.jsx';
import EtiquetaSituacion from './EtiquetaSituacion.jsx';

// Una fila de la vista Lista (y de "Hoy").
export default function FilaTarea({ tarea, ritmo, hpd, onAbrir }) {
  const sit = situacion(tarea, ritmo.factor, hpd);
  const terminada = tarea.estado === 'terminada';

  return (
    <button className="fila" onClick={() => onAbrir(tarea.id)}>
      <div className="fila-izq">
        <div className="fila-tit">{tarea.titulo}</div>
        <div className="fila-meta">
          <span className="tag">{tarea.materia}</span>
          <span>{fmtFecha(tarea.fechaEntrega)}</span>
          {!terminada && tarea.fechaEntrega && <span>{textoDias(diasRestantes(tarea))}</span>}
        </div>
      </div>

      <div className="prog">
        <BarraProgreso tarea={tarea} color={terminada ? 'gris' : sit.color} />
        <div className="prog-t">{progreso(tarea)}%</div>
      </div>

      <div className="fila-sit">
        <EtiquetaSituacion sit={sit} />
        <div className="fila-frase">{sit.frase}</div>
      </div>
    </button>
  );
}
