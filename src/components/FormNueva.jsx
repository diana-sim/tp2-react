import { useState } from 'react';
import { sugerirReserva } from '../lib/calculos.js';
import { buscarPorEmail } from '../services/usuarios.js';
import Modal from './Modal.jsx';
import Icono from './Icono.jsx';

const EMAIL_VALIDO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Crear una entrega. Lo único obligatorio es título, materia y fecha.
// Extras opcionales: tiempo estimado e invitar gente desde el principio (v3.1).
export default function FormNueva({ materias, ritmo, miEmail, onCrear, onCerrar }) {
  const [campos, setCampos] = useState({ titulo: '', materia: '', fechaEntrega: '', horas: '' });
  const [emails, setEmails] = useState([]);   // a quién invitar (todavía sin verificar)
  const [emailNuevo, setEmailNuevo] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cambiar = (nombre, valor) => {
    setCampos({ ...campos, [nombre]: valor });
    setError('');
  };

  // Sumar un email a la lista de invitados (con Enter o con el botón).
  // Acá solo revisamos el formato; si existe la cuenta se chequea al crear.
  const sumarEmail = () => {
    const email = emailNuevo.trim().toLowerCase();
    if (!email) return;
    if (!EMAIL_VALIDO.test(email)) return setError('Ese email no parece válido.');
    if (email === (miEmail || '').toLowerCase()) return setError('Ese es tu email: vos ya vas a estar en la entrega.');
    if (emails.includes(email)) return setError('Ya agregaste ese email.');
    setEmails([...emails, email]);
    setEmailNuevo('');
    setError('');
  };

  // La sugerencia se recalcula en cada tecla: es la "ayuda en el momento" de la app.
  const sugerencia = sugerirReserva(parseFloat(campos.horas), ritmo);

  const enviar = async e => {
    e.preventDefault();
    if (!campos.titulo.trim()) return setError('Poné un título a la entrega.');
    if (!campos.materia.trim()) return setError('Falta la materia.');
    if (!campos.fechaEntrega) return setError('Falta la fecha de entrega.');
    const horas = campos.horas === '' ? 0 : parseFloat(campos.horas);
    if (isNaN(horas) || horas < 0) return setError('Las horas tienen que ser un número positivo.');

    // Si quedó un email escrito sin agregar, lo sumamos igual (es lo que la persona espera).
    const pendiente = emailNuevo.trim().toLowerCase();
    const todos = pendiente && !emails.includes(pendiente) ? [...emails, pendiente] : emails;
    if (pendiente && !EMAIL_VALIDO.test(pendiente)) return setError('Revisá el email que quedó escrito: no parece válido.');

    setGuardando(true);

    // Antes de crear nada, buscamos las cuentas. Si alguna no existe, avisamos y no se crea la entrega,
    // así no queda una entrega a medias con invitaciones que fallaron.
    let personas = [];
    try {
      personas = await Promise.all(todos.map(buscarPorEmail));
    } catch {
      setGuardando(false);
      return setError('No se pudo verificar a quién invitar. Revisá tu conexión y probá de nuevo.');
    }
    const faltan = todos.filter((_, i) => !personas[i]);
    if (faltan.length) {
      setGuardando(false);
      return setError(`No hay ninguna cuenta con ${faltan.join(', ')}. Pedile que se registre o sacalo de la lista.`);
    }

    const salioBien = await onCrear({
      titulo: campos.titulo.trim(), materia: campos.materia.trim(),
      fechaEntrega: campos.fechaEntrega, horasEstimadas: horas,
    }, personas);
    if (!salioBien) {
      setError('No se pudo guardar. Revisá tu conexión y probá de nuevo.');
      setGuardando(false);
    }
  };

  return (
    <Modal titulo="Nueva entrega" onCerrar={onCerrar}>
      <form onSubmit={enviar}>
        {error && <p className="error">{error}</p>}

        <label className="lbl-c" htmlFor="f-titulo">Título</label>
        <input id="f-titulo" className="campo" placeholder="TP2 — App React + Firebase" autoFocus
               value={campos.titulo} onChange={e => cambiar('titulo', e.target.value)} />

        <div className="grid2">
          <div>
            <label className="lbl-c" htmlFor="f-materia">Materia</label>
            {/* list + datalist: sugiere las materias que ya usaste */}
            <input id="f-materia" className="campo" placeholder="Frontend II" list="lista-materias"
                   value={campos.materia} onChange={e => cambiar('materia', e.target.value)} />
            <datalist id="lista-materias">{materias.map(m => <option key={m} value={m} />)}</datalist>
          </div>
          <div>
            <label className="lbl-c" htmlFor="f-fecha">Fecha de entrega</label>
            <input id="f-fecha" className="campo" type="date"
                   value={campos.fechaEntrega} onChange={e => cambiar('fechaEntrega', e.target.value)} />
          </div>
        </div>

        <label className="lbl-c" htmlFor="f-horas">Tiempo estimado <span className="nota">(opcional)</span></label>
        <div className="fila-horas">
          <input id="f-horas" className="campo campo-hs" type="number" min="0" step="0.5" placeholder="hs"
                 value={campos.horas} onChange={e => cambiar('horas', e.target.value)} />
          <span className="aviso">Si lo cargás, te aviso si llegás con el tiempo que tenés.</span>
        </div>
        {sugerencia && <p className="sugerencia">{sugerencia}</p>}

        {/* ---------- invitar desde el principio (opcional) ---------- */}
        <label className="lbl-c" htmlFor="f-invitar">Invitar a alguien <span className="nota">(opcional)</span></label>
        <div className="fila-horas">
          <input id="f-invitar" className="campo crece" type="email" placeholder="email@de.tu.companero"
                 value={emailNuevo}
                 onChange={e => { setEmailNuevo(e.target.value); setError(''); }}
                 // Enter agrega el email a la lista en vez de enviar todo el formulario
                 onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); sumarEmail(); } }} />
          <button type="button" className="btn btn-sm" onClick={sumarEmail}>Agregar</button>
        </div>
        {emails.length > 0 && (
          <div className="invitar-chips">
            {emails.map(m => (
              <span className="invitar-chip" key={m}>
                <Icono nombre="grupo" tamano={12} /> {m}
                <button type="button" className="x" aria-label={`Sacar a ${m}`}
                        onClick={() => setEmails(emails.filter(x => x !== m))}>×</button>
              </span>
            ))}
          </div>
        )}
        <p className="aviso">Le llega una solicitud y decide si se suma. También podés invitar después, desde la entrega.</p>

        <div className="fila-f">
          <button className="btn btn-pri" type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Crear entrega'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
