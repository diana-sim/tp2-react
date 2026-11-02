// Anillo de progreso dibujado con SVG.
// El truco: un círculo con borde punteado donde el "trazo" mide lo mismo que el porcentaje.
export default function Anillo({ pct, curso = 0, color }) {
  const r = 32;
  const circunferencia = 2 * Math.PI * r;
  const tramo = p => `${(circunferencia * p) / 100} ${circunferencia}`;

  return (
    <svg width="82" height="82" viewBox="0 0 82 82" aria-label={`${pct}% completado`}>
      <circle cx="41" cy="41" r={r} fill="none" stroke="#F0EDE6" strokeWidth="9" />
      {curso > 0 && (
        <circle cx="41" cy="41" r={r} fill="none" stroke="#DCEAF1" strokeWidth="9"
                strokeDasharray={tramo(pct + curso)} transform="rotate(-90 41 41)" />
      )}
      {pct > 0 && (
        <circle cx="41" cy="41" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
                strokeDasharray={tramo(pct)} transform="rotate(-90 41 41)" />
      )}
      <text x="41" y="46" textAnchor="middle" fontSize="17" fontWeight="600" fill="#23221F">{pct}%</text>
    </svg>
  );
}
