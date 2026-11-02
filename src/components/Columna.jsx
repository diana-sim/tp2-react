import { useState } from 'react';
import Ficha from './Ficha.jsx';

export default function Columna({ estado, tareas, ritmo, hpd, arrastrando, onArrastrar, onSoltar, onMover, onAbrir }) {
  // Solo para el resaltado cuando pasás una ficha por encima.
  const [encima, setEncima] = useState(false);

  return (
    <section
      className={'col' + (encima ? ' sobre' : '')}
      onDragOver={e => { e.preventDefault(); setEncima(true); }} // sin preventDefault no se puede soltar
      onDragLeave={() => setEncima(false)}
      onDrop={() => { setEncima(false); onSoltar(estado.clave); }}
    >
      <div className="col-h">
        <span className="punto" style={{ background: estado.color }}></span>
        <span className="nom">{estado.titulo}</span>
        <span className="num">{tareas.length}</span>
      </div>

      {tareas.length === 0 && <div className="col-vacia">Soltá una entrega acá</div>}

      {tareas.map(t => (
        <Ficha
          key={t.id}
          tarea={t}
          ritmo={ritmo}
          hpd={hpd}
          fantasma={arrastrando === t.id}
          onArrastrar={onArrastrar}
          onMover={onMover}
          onAbrir={onAbrir}
        />
      ))}
    </section>
  );
}
