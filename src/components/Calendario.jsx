import { useState } from 'react';
import { situacion } from '../lib/calculos.js';
import { claveFecha, fmtFecha } from '../lib/formato.js';
import MarcaCompartida from './MarcaCompartida.jsx';

const DIAS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

// Una entrega dentro del calendario, coloreada según su situación.
function Chip({ t, ritmo, hpd, onAbrir }) {
  const sit = situacion(t, ritmo.factor, hpd);
  return (
    <button className={'chip chip-' + sit.color} onClick={() => onAbrir(t.id)} title={`${t.titulo} · ${sit.etiqueta}`}>
      <MarcaCompartida tarea={t} tamano={12} />{t.titulo}
    </button>
  );
}

// Vista Calendario: un mes, con cada entrega en su fecha.
export default function Calendario({ tareas, ritmo, hpd, onAbrir }) {
  // Guardamos el primer día del mes que se está mirando.
  const [mes, setMes] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });

  const cambiarMes = n => setMes(new Date(mes.getFullYear(), mes.getMonth() + n, 1));
  const irAHoy = () => { const d = new Date(); setMes(new Date(d.getFullYear(), d.getMonth(), 1)); };

  // Agrupamos las entregas por fecha: { '2026-11-13': [tarea, tarea] }
  const porFecha = {};
  tareas.forEach(t => {
    if (!t.fechaEntrega) return;
    (porFecha[t.fechaEntrega] ||= []).push(t);
  });
  const sinFecha = tareas.filter(t => !t.fechaEntrega);

  // Armamos las celdas: huecos al principio (para que el día 1 caiga en su día de la semana) + los días del mes.
  const huecos = (mes.getDay() + 6) % 7; // getDay: 0 = domingo. Lo pasamos a 0 = lunes.
  const diasDelMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
  const celdas = [
    ...Array(huecos).fill(null),
    ...Array.from({ length: diasDelMes }, (_, i) => new Date(mes.getFullYear(), mes.getMonth(), i + 1)),
  ];
  while (celdas.length % 7) celdas.push(null);

  const hoy = claveFecha(new Date());
  const props = { ritmo, hpd, onAbrir }; // lo que necesita cada Chip
  const delMes = celdas.filter(Boolean).flatMap(d => porFecha[claveFecha(d)] || []);

  return (
    <div className="cal">
      <div className="cal-h">
        <h2>{mes.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</h2>
        <div className="cal-nav">
          <button className="btn btn-sm" onClick={() => cambiarMes(-1)} aria-label="Mes anterior">←</button>
          <button className="btn btn-sm" onClick={irAHoy}>Hoy</button>
          <button className="btn btn-sm" onClick={() => cambiarMes(1)} aria-label="Mes siguiente">→</button>
        </div>
      </div>

      <div className="cal-grid">
        {DIAS.map(d => <div key={d} className="cal-dia-n">{d}</div>)}
        {celdas.map((d, i) => {
          if (!d) return <div key={i} className="cal-celda vacia"></div>;
          const clave = claveFecha(d);
          const deEseDia = porFecha[clave] || [];
          return (
            <div key={i} className={'cal-celda' + (clave === hoy ? ' hoy' : '') + (clave < hoy ? ' pasado' : '')}>
              <span className="cal-num">{d.getDate()}</span>
              <div className="cal-chips">
                {deEseDia.slice(0, 3).map(t => <Chip key={t.id} t={t} {...props} />)}
                {deEseDia.length > 3 && <span className="cal-mas">+{deEseDia.length - 3} más</span>}
              </div>
              {/* en el celular, en lugar de los nombres se ven puntitos */}
              <div className="cal-puntos">
                {deEseDia.map(t => <i key={t.id} className={'pt-' + situacion(t, ritmo.factor, hpd).color}></i>)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lista del mes: solo se ve en el celular, donde las celdas son chiquitas */}
      {delMes.length > 0 && (
        <div className="cal-lista">
          {delMes.map(t => (
            <div key={t.id} className="cal-lista-f">
              <span className="cal-lista-d">{fmtFecha(t.fechaEntrega)}</span>
              <Chip t={t} {...props} />
            </div>
          ))}
        </div>
      )}

      {sinFecha.length > 0 && (
        <div className="cal-sinfecha">
          <span className="nota">Sin fecha:</span>
          {sinFecha.map(t => <Chip key={t.id} t={t} {...props} />)}
        </div>
      )}
    </div>
  );
}
