import { useState } from 'react';
import { fmtFecha } from '../lib/formato.js';
import Icono from './Icono.jsx';

// Solicitudes para sumarse a entregas que te compartieron (v3.1).
// Aparece arriba de todo, en cualquier sección, hasta que respondas.
// La entrega NO aparece en tus listas hasta que aceptás.
export default function Solicitudes({ invitaciones, uid, onAceptar, onRechazar }) {
  const [respondiendo, setRespondiendo] = useState(null); // id de la que se está guardando

  if (invitaciones.length === 0) return null;

  const responder = async (tarea, aceptar) => {
    setRespondiendo(tarea.id);
    await (aceptar ? onAceptar(tarea) : onRechazar(tarea));
    setRespondiendo(null);
  };

  return (
    <section className="card solicitudes" aria-label="Solicitudes para sumarte a entregas">
      <div className="card-h">
        <h2><Icono nombre="sobre" /> {invitaciones.length === 1 ? 'Tenés una solicitud' : `Tenés ${invitaciones.length} solicitudes`}</h2>
      </div>

      {invitaciones.map(t => {
        const quien = t.invitadosInfo?.[uid]?.invitadoPor || 'Alguien';
        const ocupada = respondiendo === t.id;
        return (
          <div className="solicitud" key={t.id}>
            <div className="solicitud-txt">
              <p><b>{quien}</b> te invitó a <b>{t.titulo}</b></p>
              <p className="solicitud-meta">
                <span className="tag">{t.materia}</span>
                <span>{t.fechaEntrega ? `entrega ${fmtFecha(t.fechaEntrega)}` : 'sin fecha'}</span>
                <span>{t.miembros.length} {t.miembros.length === 1 ? 'persona' : 'personas'}</span>
              </p>
            </div>
            <div className="solicitud-btns">
              <button className="btn btn-sm" disabled={ocupada} onClick={() => responder(t, false)}>Rechazar</button>
              <button className="btn btn-sm btn-pri" disabled={ocupada} onClick={() => responder(t, true)}>
                {ocupada ? 'Un segundo…' : 'Aceptar'}
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}
