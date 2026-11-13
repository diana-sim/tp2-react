import Icono from './Icono.jsx';
import Perfil from './Perfil.jsx';

// Menú lateral: logo, la acción principal (nueva entrega), las secciones y, abajo, el perfil.
// Se puede colapsar: queda angosto, solo con íconos (como en Firebase o Notion).
const SECCIONES = [
  { clave: 'hoy',      texto: 'Hoy' },
  { clave: 'entregas', icono: 'lista', texto: 'Mis entregas', contador: true },
  { clave: 'ritmo',    texto: 'Mi ritmo' },
];

export default function Sidebar({ seccion, activas, onIrA, onNueva, perfil, colapsado, onAlternar }) {
  return (
    <aside className="side">
      <div className="logo">
        <div className="logo-m"><Icono nombre="check" /></div>
        <div className="logo-txt">
          <div className="logo-t">Al día</div>
          <div className="logo-s">¿Estás al día?</div>
        </div>
        <button className="side-toggle" onClick={onAlternar}
                aria-label={colapsado ? 'Expandir menú' : 'Colapsar menú'} title={colapsado ? 'Expandir menú' : 'Colapsar menú'}>
          <Icono nombre={colapsado ? 'expandir' : 'colapsar'} />
        </button>
      </div>

      {/* La acción principal va arriba de todo, como "Nueva página" en Notion */}
      <button className="btn btn-pri btn-ancho side-nueva" onClick={onNueva} title="Nueva entrega" aria-label="Nueva entrega">
        <Icono nombre="mas" /><span className="side-txt">Nueva entrega</span>
      </button>

      {SECCIONES.map(s => (
        <button key={s.clave} className={'nav' + (seccion === s.clave ? ' on' : '')} onClick={() => onIrA(s.clave)}
                title={colapsado ? s.texto : undefined} aria-label={s.texto}>
          <Icono nombre={s.icono || s.clave} />
          <span className="side-txt">{s.texto}</span>
          {s.contador && activas > 0 && <span className="cnt">{activas}</span>}
        </button>
      ))}

      <div className="side-pie">
        {/* perfil = { nombre, email, onCambiarNombre, onSalir, modo, onCambiarModo } */}
        <Perfil {...perfil} />
      </div>
    </aside>
  );
}
