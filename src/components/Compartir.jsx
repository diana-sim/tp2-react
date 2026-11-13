import { useState } from 'react';
import { buscarPorEmail } from '../services/usuarios.js';
import { iniciales, nombreVisible } from '../lib/personas.js';

// Bloque "Compartida con" dentro del detalle de una entrega.
// Permite sumar personas por email y sacarlas.
// Recibe la tarea, el uid de quien está mirando, y dos funciones que guardan en Firestore.
export default function Compartir({ tarea, uid, onSumar, onQuitar }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [buscando, setBuscando] = useState(false);

  const miembros = tarea.miembros || [];
  const esPropietario = tarea.propietario === uid;

  const invitar = async e => {
    e.preventDefault();
    const buscado = email.trim().toLowerCase();

    if (!buscado) return setError('Escribí el email de la persona.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(buscado)) return setError('Ese email no parece válido.');
    if (buscado === tarea.miembrosInfo?.[uid]?.email) return setError('Esa sos vos: ya estás en la entrega.');

    setError('');
    setBuscando(true);
    try {
      const persona = await buscarPorEmail(buscado);
      if (!persona) {
        setError('No hay ninguna cuenta con ese email. Pedile que se registre en la app y volvé a probar.');
        return;
      }
      if (miembros.includes(persona.uid)) {
        setError('Esa persona ya está en la entrega.');
        return;
      }
      if (await onSumar(persona)) setEmail('');
    } catch {
      setError('No se pudo compartir. Revisá tu conexión y probá de nuevo.');
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="bloque">
      <div className="bloque-h">
        <h3>Compartida con</h3>
        {miembros.length > 1 && <span className="nota">{miembros.length} personas</span>}
      </div>

      {miembros.length === 1 && (
        <p className="aviso aviso-arriba">
          Por ahora es solo tuya. Sumá a quien curse con vos y los dos van a ver los mismos cambios.
        </p>
      )}

      <ul className="miembros">
        {miembros.map(m => {
          const info = tarea.miembrosInfo?.[m] || {};
          const dueno = m === tarea.propietario;
          const yo = m === uid;
          // El propietario no se puede sacar. A los demás los saca el propietario,
          // y cada quien puede salirse de una entrega que le compartieron.
          const puedeQuitar = !dueno && (esPropietario || yo);

          return (
            <li className="miembro" key={m}>
              <span className="avatar avatar-sm" aria-hidden="true">{iniciales(info)}</span>
              <span className="miembro-txt">
                <span className="miembro-n">{nombreVisible(info)}{yo && ' (vos)'}</span>
                <span className="miembro-e">{dueno ? 'Creó la entrega' : info.email}</span>
              </span>
              {puedeQuitar && (
                <button className="x" aria-label={yo ? 'Salir de la entrega' : `Quitar a ${nombreVisible(info)}`}
                        onClick={() => {
                          const texto = yo
                            ? '¿Salir de esta entrega? Vas a dejar de verla.'
                            : `¿Quitar a ${nombreVisible(info)} de esta entrega?`;
                          if (window.confirm(texto)) onQuitar(m);
                        }}>×</button>
              )}
            </li>
          );
        })}
      </ul>

      {error && <p className="error error-sub">{error}</p>}

      <form className="fila-f" onSubmit={invitar}>
        <input className="campo crece" type="email" placeholder="email@de.tu.companero" aria-label="Email de la persona"
               value={email} onChange={e => { setEmail(e.target.value); setError(''); }} />
        <button className="btn btn-sm" type="submit" disabled={buscando}>
          {buscando ? 'Buscando…' : '+ Sumar'}
        </button>
      </form>
      <p className="aviso">La persona tiene que tener cuenta en la app para poder sumarla.</p>
    </div>
  );
}
