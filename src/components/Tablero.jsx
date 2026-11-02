import { useState } from 'react';
import { ESTADOS } from '../data/estados.js';
import Columna from './Columna.jsx';

// Vista Tablero: las 4 columnas, y recuerda qué ficha se está arrastrando.
export default function Tablero({ tareas, ritmo, hpd, onAbrir, onMover }) {
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
          ritmo={ritmo}
          hpd={hpd}
          arrastrando={arrastrando}
          onArrastrar={setArrastrando}
          onSoltar={soltarEn}
          onMover={onMover}
          onAbrir={onAbrir}
        />
      ))}
    </div>
  );
}
