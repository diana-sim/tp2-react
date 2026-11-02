import { useState } from 'react';
import { entregasCerradas, horasEstimadas, describirRitmo, MIN_CERRADAS } from '../lib/calculos.js';
import { fmtHoras, fmtFecha } from '../lib/formato.js';
import Mascota from '../components/Mascota.jsx';

const OPCIONES_HORAS = [1, 2, 3, 4, 5, 6, 8];

// Sección "Mi ritmo": qué aprendió la app sobre cómo estimás, y tu disponibilidad.
export default function VistaRitmo({ tareas, ritmo, hpd, onAbrir, onCambiarHoras }) {
  const [guardando, setGuardando] = useState(false);
  const desc = describirRitmo(ritmo);
  const cerradas = entregasCerradas(tareas).sort((a, b) => (b.fechaEntrega || '').localeCompare(a.fechaEntrega || ''));
  const maximo = Math.max(1, ...cerradas.map(t => Math.max(horasEstimadas(t), t.horasReales)));

  // Desvío por materia: ¿en cuáles le errás más?
  const porMateria = {};
  cerradas.forEach(t => {
    const m = (porMateria[t.materia] ||= { est: 0, real: 0, n: 0 });
    m.est += horasEstimadas(t); m.real += t.horasReales; m.n += 1;
  });
  const materias = Object.entries(porMateria)
    .map(([nombre, m]) => ({ nombre, n: m.n, pct: Math.round((m.real / m.est - 1) * 100) }))
    .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));

  const cambiarHoras = async h => {
    setGuardando(true);
    await onCambiarHoras(h);
    setGuardando(false);
  };

  return (
    <>
      <div className="head">
        <div>
          <h1>Mi ritmo</h1>
          <p className="sub">Un extra: si cargás cuánto tiempo creés que te lleva cada entrega y cuánto te llevó, aprendo cómo calculás el tiempo.</p>
        </div>
      </div>

      <div className="rejilla">
        {/* ---------- la frase principal ---------- */}
        <div className="card ritmo-hero">
          {/* Posti a la izquierda mientras la app todavía está aprendiendo */}
          {!ritmo.conocido && <Mascota pose="pensando" tamano={84} />}
          <div className="ritmo-hero-txt">
          <p className={'ritmo-tit grande ritmo-' + desc.tipo}>{desc.titulo}</p>
          <p className="ritmo-txt">{desc.texto}</p>
          {ritmo.conocido && desc.tipo !== 'bien' && (
            <p className="aviso">Por ejemplo: si calculás 4 h, conviene reservar {fmtHoras(4 * ritmo.factor)}.</p>
          )}
          {!ritmo.conocido && (
            <div className="progreso-aprendo" aria-label={`${ritmo.cerradas} de ${MIN_CERRADAS} entregas`}>
              {Array.from({ length: MIN_CERRADAS }, (_, i) => <i key={i} className={i < ritmo.cerradas ? 'on' : ''}></i>)}
              <span>{ritmo.cerradas} de {MIN_CERRADAS} entregas terminadas</span>
            </div>
          )}
          <p className="aviso">
            Se calcula con todas tus entregas terminadas: horas reales ÷ horas que calculaste.
            {ritmo.cerradas > 0 && ` Basado en ${ritmo.cerradas} ${ritmo.cerradas === 1 ? 'entrega' : 'entregas'}.`}
          </p>
          </div>
        </div>

        {/* ---------- disponibilidad ---------- */}
        <div className="card">
          <div className="card-h"><h2>Tu tiempo para estudiar</h2></div>
          <p className="aviso aviso-arriba">Horas por día que le podés dedicar a la facu. Con esto calculo si llegás a cada entrega.</p>
          <div className="opciones">
            {OPCIONES_HORAS.map(h => (
              <button key={h} className={'opcion' + (h === hpd ? ' on' : '')} disabled={guardando}
                      onClick={() => h !== hpd && cambiarHoras(h)}>{h} h</button>
            ))}
          </div>
          <p className="aviso">Un "día de estudio" en la app equivale a {hpd} {hpd === 1 ? 'hora' : 'horas'}.</p>
        </div>
      </div>

      {/* ---------- historial ---------- */}
      <div className="card">
        <div className="card-h">
          <h2>Calculado vs. real</h2>
          <span className="leyenda-mini"><i className="l-est"></i> calculado <i className="l-real"></i> real</span>
        </div>
        {cerradas.length === 0 ? (
          <p className="aviso aviso-arriba">Cuando termines una entrega y cargues cuánto te llevó, aparece acá.</p>
        ) : (
          cerradas.map(t => {
            const est = horasEstimadas(t);
            const pct = Math.round((t.horasReales / est - 1) * 100);
            return (
              <button key={t.id} className="comp" onClick={() => onAbrir(t.id)}>
                <div className="comp-t">
                  <span className="comp-nom">{t.titulo}</span>
                  <span className="comp-meta">{t.materia} · {fmtFecha(t.fechaEntrega)}</span>
                </div>
                <div className="comp-barras">
                  <div className="comp-b"><i className="l-est" style={{ width: (est / maximo) * 100 + '%' }}></i><span>{fmtHoras(est)}</span></div>
                  <div className="comp-b"><i className="l-real" style={{ width: (t.horasReales / maximo) * 100 + '%' }}></i><span>{fmtHoras(t.horasReales)}</span></div>
                </div>
                <span className="comp-dif">{Math.abs(pct) < 5 ? 'justo' : `${pct > 0 ? '+' : '−'}${Math.abs(pct)}%`}</span>
              </button>
            );
          })
        )}
      </div>

      {materias.length > 1 && (
        <div className="card">
          <div className="card-h"><h2>Por materia</h2></div>
          {materias.map(m => (
            <div key={m.nombre} className="materia-f">
              <span>{m.nombre} <span className="nota">({m.n})</span></span>
              <span className="fuerte">
                {Math.abs(m.pct) < 5 ? 'estimás bien' : m.pct > 0 ? `te lleva un ${m.pct}% más` : `te lleva un ${-m.pct}% menos`}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
