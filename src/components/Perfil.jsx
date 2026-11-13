import { useEffect, useRef, useState } from 'react';

// Opciones del selector de datos de prueba (solo para desarrollo).
const MODOS = [
  { clave: 'real', texto: 'Reales' },
  { clave: 'vacio', texto: 'Vacía' },
  { clave: 'demo', texto: 'Ejemplos' },
];

// Perfil abajo del menú lateral (como en Notion): avatar + nombre + email.
// Al tocarlo se abre un menú con: editar nombre, datos de prueba (solo dev) y cerrar sesión.
export default function Perfil({ nombre, email, onCambiarNombre, onSalir, modo, onCambiarModo }) {
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState(nombre);
  const caja = useRef(null); // referencia al elemento, para saber si un clic fue afuera

  // Cerrar el menú al hacer clic afuera o apretar Escape
  useEffect(() => {
    if (!abierto) return;
    const alClic = e => caja.current && !caja.current.contains(e.target) && setAbierto(false);
    const alTecla = e => e.key === 'Escape' && setAbierto(false);
    document.addEventListener('mousedown', alClic);
    document.addEventListener('keydown', alTecla);
    return () => {
      document.removeEventListener('mousedown', alClic);
      document.removeEventListener('keydown', alTecla);
    };
  }, [abierto]);

  const inicial = (nombre || email || '?').trim()[0].toUpperCase();

  const guardarNombre = async e => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    if (await onCambiarNombre(nuevoNombre.trim())) setEditando(false);
  };

  return (
    <div className="perfil" ref={caja}>
      <button className="perfil-btn" onClick={() => { setAbierto(!abierto); setEditando(false); setNuevoNombre(nombre); }}
              aria-expanded={abierto} aria-label="Abrir menú de perfil">
        <span className="avatar">{inicial}</span>
        {/* En el botón va solo el nombre: los emails pueden ser muy largos.
            El email completo se ve al abrir el menú. */}
        <span className="perfil-txt">
          <span className="perfil-nom">{nombre || 'Mi perfil'}</span>
        </span>
        <span className="perfil-flecha" aria-hidden="true">⌃</span>
      </button>

      {abierto && (
        <div className="perfil-menu" role="menu">
          <div className="perfil-cab">
            <span className="avatar avatar-g">{inicial}</span>
            <div>
              <div className="perfil-nom">{nombre || 'Sin nombre'}</div>
              {/* <wbr /> marca dónde puede cortar la línea: antes del @, así un email largo queda
                  "nombre" arriba y "@dominio.com" abajo, en vez de cortarse por la mitad */}
              <div className="perfil-mail perfil-mail-completo">
                {email.split('@')[0]}<wbr />{email.includes('@') && '@' + email.split('@')[1]}
              </div>
            </div>
          </div>

          {editando ? (
            <form className="perfil-form" onSubmit={guardarNombre}>
              <input className="campo" autoFocus placeholder="¿Cómo te llamás?" aria-label="Tu nombre"
                     value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} />
              <button className="btn btn-sm btn-pri" type="submit">Guardar</button>
            </form>
          ) : (
            <button className="perfil-op" onClick={() => setEditando(true)}>
              {nombre ? 'Cambiar mi nombre' : 'Agregar mi nombre'}
            </button>
          )}

          {/* modo === null en producción: el selector de datos de prueba no se muestra */}
          {modo && (
            <div className="dev">
              <span className="dev-l">Dev · datos</span>
              <div className="dev-ops">
                {MODOS.map(m => (
                  <button key={m.clave} className={'dev-op' + (modo === m.clave ? ' on' : '')}
                          onClick={() => { onCambiarModo(m.clave); setAbierto(false); }}>
                    {m.texto}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="perfil-sep"></div>
          <button className="perfil-op perfil-salir" onClick={onSalir}>Cerrar sesión</button>
        </div>
      )}
    </div>
  );
}
