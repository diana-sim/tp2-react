import { progreso, progresoEnCurso } from '../lib/calculos.js';

// Barra de dos tramos: horas terminadas (color según la situación) + horas en proceso (celeste claro).
const COLORES = { rojo: '#F2A8C4', ambar: '#F0B47E', oliva: '#A8C86E', gris: '#D8D4CA', celeste: '#86C3D8' };

export default function BarraProgreso({ tarea, color }) {
  return (
    <div className="barra" role="progressbar" aria-valuenow={progreso(tarea)} aria-valuemin="0" aria-valuemax="100">
      <i style={{ width: progreso(tarea) + '%', background: COLORES[color] }}></i>
      <i style={{ width: progresoEnCurso(tarea) + '%', background: '#DCEAF1' }}></i>
    </div>
  );
}
