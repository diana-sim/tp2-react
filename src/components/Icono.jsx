// Íconos simples dibujados con SVG (se ven igual en cualquier compu, sin depender de fuentes).
const TRAZOS = {
  hoy: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  lista: <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  tablero: <><rect x="3" y="4" width="5" height="16" rx="1.5" /><rect x="10" y="4" width="5" height="11" rx="1.5" /><rect x="17" y="4" width="4" height="7" rx="1.5" /></>,
  calendario: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  mas: <path d="M12 5v14M5 12h14" />,
  colapsar: <path d="M11 6l-6 6 6 6M19 6l-6 6 6 6" />,
  expandir: <path d="M5 6l6 6-6 6M13 6l6 6-6 6" />,
  ritmo: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2.5M10 2h4" /></>,
};

export default function Icono({ nombre }) {
  return (
    <svg className="icono" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {TRAZOS[nombre]}
    </svg>
  );
}
