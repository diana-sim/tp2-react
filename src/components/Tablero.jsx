import { useState } from 'react';
import { ESTADOS } from '../data/estados.js';
import Columna from './Columna.jsx';

// El tablero arma las 4 columnas y recuerda qué ficha se está arrastrando.
// Ese dato ("arrastrando") es estado de interfaz: solo le importa al tablero,
// por eso vive acá y no en App.
export default function Tablero({ tareas, onMover, onEliminar }) {
  const [arrastrando, setArrastrando] = useState(null);

  const soltarEn = estado => {
    if (arrastrando) onMover(arrastrando, estado);
    setArrastrando(null);
  };

  return (
    <div className="board">
      {ESTADOS.map(est => (
        <Columna
          key={est.clave}
          estado={est}
          tareas={tareas.filter(t => t.estado === est.clave)}
          arrastrando={arrastrando}
          onArrastrar={setArrastrando}
          onSoltar={soltarEn}
          onMover={onMover}
          onEliminar={onEliminar}
        />
      ))}
    </div>
  );
}
