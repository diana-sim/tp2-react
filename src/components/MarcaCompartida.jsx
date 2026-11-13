import Icono from './Icono.jsx';

// Iconito de "personitas" al lado del título cuando la entrega está compartida
// (tiene más de un miembro). Las invitaciones pendientes no cuentan: todavía no aceptaron.
export default function MarcaCompartida({ tarea, tamano = 14 }) {
  const cantidad = (tarea.miembros || []).length;
  if (cantidad < 2) return null;
  const texto = `Compartida con ${cantidad - 1} ${cantidad === 2 ? 'persona' : 'personas'}`;
  return (
    <span className="marca-compartida" title={texto} aria-label={texto} role="img">
      <Icono nombre="grupo" tamano={tamano} />
    </span>
  );
}
