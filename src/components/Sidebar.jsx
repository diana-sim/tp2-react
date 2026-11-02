import Icono from './Icono.jsx';

// Menú lateral: tres secciones. "Mis entregas" tiene adentro las distintas vistas.
const SECCIONES = [
  { clave: 'hoy',      texto: 'Hoy' },
  { clave: 'entregas', icono: 'lista', texto: 'Mis entregas', contador: true },
  { clave: 'ritmo',    texto: 'Mi ritmo' },
];

export default function Sidebar({ seccion, activas, onIrA, onNueva }) {
  return (
    <aside className="side">
      <div className="logo">
        <div className="logo-m"><Icono nombre="check" /></div>
        <div>
          <div className="logo-t">Al día</div>
          <div className="logo-s">¿Estás al día?</div>
        </div>
      </div>

      {SECCIONES.map(s => (
        <button key={s.clave} className={'nav' + (seccion === s.clave ? ' on' : '')} onClick={() => onIrA(s.clave)}>
          <Icono nombre={s.icono || s.clave} />
          {s.texto}
          {s.contador && activas > 0 && <span className="cnt">{activas}</span>}
        </button>
      ))}

      <div className="side-pie">
        <button className="btn btn-pri btn-ancho" onClick={onNueva}>+ Nueva entrega</button>
      </div>
    </aside>
  );
}
