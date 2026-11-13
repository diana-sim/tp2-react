import { useState } from 'react';
import Modal from './Modal.jsx';
import Icono from './Icono.jsx';
import Mascota from './Mascota.jsx';

const VISTAS = [
  { clave: 'lista',      titulo: 'Lista',      texto: 'Todo junto, ordenado por urgencia' },
  { clave: 'tablero',    titulo: 'Tablero',    texto: 'Columnas según en qué estado está cada cosa' },
  { clave: 'calendario', titulo: 'Calendario', texto: 'Cada entrega en su fecha, mes a mes' },
];

// Primera vez que se abre la app: presenta la idea y deja elegir la vista favorita.
export default function Bienvenida({ onElegir }) {
  const [vista, setVista] = useState('lista');
  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState(false);

  const confirmar = async () => {
    setGuardando(true);
    const salioBien = await onElegir(vista, nombre.trim());
    if (!salioBien) setGuardando(false);
  };

  return (
    <Modal titulo="¿Estás al día?">
      <div className="con-mascota">
        <Mascota pose="saludando" tamano={84} />
        <p className="bienv-lead">¡Hola! Soy Posti. <b>Al día</b> es una forma nueva de organizar la facu: tus entregas, sus partes y sus fechas, vistas como a vos te sirva.</p>
      </div>

      <label className="lbl-c" htmlFor="b-nombre">¿Cómo te llamás?</label>
      <input id="b-nombre" className="campo" placeholder="Tu nombre" autoFocus
             value={nombre} onChange={e => setNombre(e.target.value)} />

      <label className="lbl-c">¿Cómo te gusta ver tus cosas?</label>
      <div className="vistas-op">
        {VISTAS.map(v => (
          <button key={v.clave} type="button" className={'vista-op' + (v.clave === vista ? ' on' : '')} onClick={() => setVista(v.clave)}>
            <Icono nombre={v.clave} />
            <b>{v.titulo}</b>
            <span>{v.texto}</span>
          </button>
        ))}
      </div>
      <p className="aviso">Las tres muestran las mismas entregas: podés cambiar de vista cuando quieras.</p>

      <div className="fila-f">
        <button className="btn btn-pri" onClick={confirmar} disabled={guardando}>
          {guardando ? 'Guardando…' : 'Empezar'}
        </button>
      </div>
    </Modal>
  );
}
