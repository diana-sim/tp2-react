import { useEffect } from 'react';

// Ventana centrada con fondo oscuro. La usan "Nueva entrega" y "Bienvenida".
// children = lo que pongas entre <Modal> y </Modal>.
export default function Modal({ titulo, onCerrar, children }) {
  // Cerrar con la tecla Escape (si se puede cerrar)
  useEffect(() => {
    if (!onCerrar) return;
    const alApretar = e => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', alApretar);
    return () => window.removeEventListener('keydown', alApretar);
  }, [onCerrar]);

  return (
    <>
      <div className="fondo-mod" onClick={onCerrar}></div>
      <div className="mod-cont">
        <div className="mod" role="dialog" aria-label={titulo}>
          <div className="mod-h">
            <h2>{titulo}</h2>
            {onCerrar && <button type="button" className="x x-grande" onClick={onCerrar} aria-label="Cerrar">×</button>}
          </div>
          <div className="mod-b">{children}</div>
        </div>
      </div>
    </>
  );
}
