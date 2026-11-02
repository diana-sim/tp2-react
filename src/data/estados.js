// Datos fijos de la app: no cambian mientras corre, por eso no son estado.

// Columnas del tablero (estado de cada entrega).
export const ESTADOS = [
  { clave: 'pendiente', titulo: 'Pendientes',  color: '#B3A7E0' },
  { clave: 'en-curso',  titulo: 'En curso',    color: '#86C3D8' },
  { clave: 'revision',  titulo: 'En revisión', color: '#F0B47E' },
  { clave: 'terminada', titulo: 'Terminadas',  color: '#A8C86E' },
];

// Columnas del mini tablero de subtareas (dentro del detalle de una entrega).
export const ESTADOS_SUB = [
  { clave: 'pendiente', titulo: 'Sin arrancar', color: '#B3A7E0' },
  { clave: 'en-curso',  titulo: 'En proceso',   color: '#86C3D8' },
  { clave: 'hecha',     titulo: 'Terminadas',   color: '#A8C86E' },
];
