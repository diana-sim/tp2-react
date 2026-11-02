import Icono from './Icono.jsx';

// Menú lateral: tres secciones. "Mis entregas" tiene adentro las distintas vistas.
const SECCIONES = [
  { clave: 'hoy',      texto: 'Hoy' },
  { clave: 'entregas', icono: 'lista', texto: 'Mis entregas', contador: true },
  { clave: 'ritmo',    texto: 'Mi ritmo' },
];

// Opciones del selector de datos (solo para desarrollo).
const MODOS = [
  { clave: 'real', texto: 'Reales' },
  { clave: 'vacio', texto: 'Vacía' },
  { clave: 'demo', texto: 'Ejemplos' },
];

export default function Sidebar({ seccion, activas, onIrA, onNueva, modo, onCambiarModo }) {
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
        {/* modo === null en producción: el selector no se muestra */}
        {modo && (
          <div className="dev">
            <span className="dev-l">Dev · datos</span>
            <div className="dev-ops">
              {MODOS.map(m => (
                <button key={m.clave} className={'dev-op' + (modo === m.clave ? ' on' : '')} onClick={() => onCambiarModo(m.clave)}>
                  {m.texto}
                </button>
              ))}
            </div>
          </div>
        )}
        <button className="btn btn-pri btn-ancho" onClick={onNueva}>+ Nueva entrega</button>
      </div>
    </aside>
  );
}
