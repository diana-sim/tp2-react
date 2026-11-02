import { useState } from 'react';
import { sugerirReserva } from '../lib/calculos.js';
import Modal from './Modal.jsx';

// Crear una entrega. Lo único obligatorio es título, materia y fecha. El tiempo estimado es un extra.
export default function FormNueva({ materias, ritmo, onCrear, onCerrar }) {
  const [campos, setCampos] = useState({ titulo: '', materia: '', fechaEntrega: '', horas: '' });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cambiar = (nombre, valor) => {
    setCampos({ ...campos, [nombre]: valor });
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

    setGuardando(true);
    const salioBien = await onCrear({
      titulo: campos.titulo.trim(), materia: campos.materia.trim(),
      fechaEntrega: campos.fechaEntrega, horasEstimadas: horas,
    });
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

        <div className="fila-f">
          <button className="btn btn-pri" type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Crear entrega'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
