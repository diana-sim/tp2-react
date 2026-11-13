import { ESTADOS } from '../data/estados.js';
import { ordenarPorUrgencia, situacion, describirRitmo, proximosDias, horasEstimadas } from '../lib/calculos.js';
import { saludo, fechaDeHoy, claveFecha } from '../lib/formato.js';
import FilaTarea from '../components/FilaTarea.jsx';
import MarcaCompartida from '../components/MarcaCompartida.jsx';
import Mascota from '../components/Mascota.jsx';

// Sección "Hoy": un resumen para arrancar el día sin tener que mirar todo.
export default function VistaHoy({ tareas, ritmo, hpd, nombre, onAbrir, onNueva, onVerEntregas, onVerRitmo }) {
  // "Buenas noches, Diana" (si no cargó nombre, solo "Buenas noches")
  const titulo = nombre ? `${saludo()}, ${nombre}` : saludo();

  // Primera vez: explicamos cómo funciona en vez de mostrar tarjetas vacías.
  if (tareas.length === 0) {
    return (
      <>
        <div className="head"><div><h1>{titulo}</h1><p className="sub cap">{fechaDeHoy()}</p></div></div>
        <div className="card bienv con-mascota">
          <Mascota pose="saludando" tamano={110} />
          <div>
          <h2>Organizá la facu a tu manera</h2>
          <ol className="pasos-bienv">
            <li><b>Cargá tus entregas</b> con su materia y su fecha.</li>
            <li><b>Elegí cómo verlas:</b> en lista, en tablero o en calendario.</li>
            <li><b>Desarmalas en partes</b> y mirá cómo avanzás.</li>
          </ol>
          <p className="aviso aviso-arriba">Extra: si me contás cuánto tiempo te lleva cada cosa, aprendo tu ritmo y te aviso si no llegás.</p>
          <button className="btn btn-pri" onClick={onNueva}>+ Nueva entrega</button>
          </div>
        </div>
      </>
    );
  }

  const activas = tareas.filter(t => t.estado !== 'terminada');
  const vencenPronto = activas.filter(t => ['vencida', 'riesgo', 'pronto'].includes(situacion(t, ritmo.factor, hpd).clave));
  const urgentes = ordenarPorUrgencia(activas, ritmo.factor, hpd).slice(0, 3);
  const agenda = proximosDias(tareas, 14);
  const desc = describirRitmo(ritmo);
  // Terminadas que tenían estimación pero no se contó cuánto llevaron (sin eso no aprendo).
  const sinContar = tareas.filter(t => t.estado === 'terminada' && !t.horasReales && horasEstimadas(t) > 0);
  const comunes = { ritmo, hpd, onAbrir };

  const hoy = claveFecha(new Date());
  const manana = claveFecha(new Date(Date.now() + 86400000));
  const nombreDia = f => (f === hoy ? 'Hoy' : f === manana ? 'Mañana' : new Date(f + 'T12:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }));

  const resumen = activas.length === 0
    ? 'No tenés entregas pendientes.'
    : `${activas.length} ${activas.length === 1 ? 'entrega activa' : 'entregas activas'}` +
      (vencenPronto.length ? ` · ${vencenPronto.length} ${vencenPronto.length === 1 ? 'necesita' : 'necesitan'} atención` : ' · Estás al día');

  return (
    <>
      <div className="head">
        <div>
          <h1>{titulo}</h1>
          <p className="sub"><span className="cap">{fechaDeHoy()}</span> · {resumen}</p>
        </div>
        <button className="btn btn-pri" onClick={onNueva}>+ Nueva entrega</button>
      </div>

      {/* Posti comenta cómo venís */}
      <div className={'card banner ' + (vencenPronto.length ? 'banner-atencion' : 'banner-ok')}>
        <Mascota pose={vencenPronto.length ? 'preocupada' : 'festejando'} tamano={64} />
        <p>
          {activas.length === 0
            ? <><b>No tenés nada pendiente.</b> ¡A descansar!</>
            : vencenPronto.length
              ? <><b>{vencenPronto.length === 1 ? 'Una entrega necesita' : `${vencenPronto.length} entregas necesitan`} atención.</b> Empezá por la primera de abajo: de a una se puede.</>
              : <><b>¡Estás al día!</b> No hay nada vencido ni en riesgo. Seguí así.</>}
        </p>
      </div>

      <div className="card">
        <div className="card-h">
          <h2>Empezá por acá</h2>
          <button className="link-btn" onClick={() => onVerEntregas('lista')}>Ver lista →</button>
        </div>
        {urgentes.length === 0
          ? <p className="aviso">No tenés entregas activas. Buen momento para descansar.</p>
          : <div className="filas">{urgentes.map(t => <FilaTarea key={t.id} tarea={t} {...comunes} />)}</div>}
      </div>

      <div className="rejilla">
        {/* ---------- agenda ---------- */}
        <div className="card">
          <div className="card-h">
            <h2>Próximas 2 semanas</h2>
            <button className="link-btn" onClick={() => onVerEntregas('calendario')}>Ver calendario →</button>
          </div>
          {agenda.length === 0 ? (
            <p className="aviso">No vence nada en los próximos 14 días.</p>
          ) : (
            agenda.map(([fecha, lista]) => (
              <div key={fecha} className="agenda-f">
                <span className={'agenda-d' + (fecha === hoy ? ' hoy' : '')}>{nombreDia(fecha)}</span>
                <div className="agenda-l">
                  {lista.map(t => (
                    <button key={t.id} className={'chip chip-' + situacion(t, ritmo.factor, hpd).color} onClick={() => onAbrir(t.id)}>
                      <MarcaCompartida tarea={t} tamano={12} />
                      {t.titulo} <span className="chip-m">· {t.materia}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div>
          {/* ---------- cómo vas ---------- */}
          <div className="card">
            <div className="card-h">
              <h2>Cómo vas</h2>
              <button className="link-btn" onClick={() => onVerEntregas('tablero')}>Ver tablero →</button>
            </div>
            <div className="estados-barra">
              {ESTADOS.map(e => {
                const n = tareas.filter(t => t.estado === e.clave).length;
                return n ? <i key={e.clave} style={{ flex: n, background: e.color }} title={`${e.titulo}: ${n}`}></i> : null;
              })}
            </div>
            {ESTADOS.map(e => (
              <div key={e.clave} className="estado-f">
                <span className="punto" style={{ background: e.color }}></span>
                {e.titulo}
                <span className="estado-n">{tareas.filter(t => t.estado === e.clave).length}</span>
              </div>
            ))}
          </div>

          {/* ---------- tu ritmo (extra) ---------- */}
          <div className="card ritmo-mini">
            <div className="card-h"><h2>Tu ritmo</h2><span className="nota">extra</span></div>
            <p className={'ritmo-tit ritmo-' + desc.tipo}>{desc.titulo}</p>
            {sinContar.length > 0 && (
              <p className="aviso">
                {sinContar.length === 1 ? 'Una entrega terminada no tiene' : `${sinContar.length} entregas terminadas no tienen`} las
                horas reales cargadas: <button className="link-btn link-inline" onClick={() => onAbrir(sinContar[0].id)}>{sinContar[0].titulo}</button>
              </p>
            )}
            <button className="link-btn" onClick={onVerRitmo}>Ver mi ritmo →</button>
          </div>
        </div>
      </div>
    </>
  );
}
