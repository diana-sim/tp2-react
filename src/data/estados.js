// Las columnas del tablero.
// Es un dato fijo (no cambia mientras la app corre), por eso vive afuera
// de los componentes y no en un useState.
export const ESTADOS = [
  { clave: 'pendiente', titulo: 'Pendientes',  color: '#B3A7E0' },
  { clave: 'en-curso',  titulo: 'En curso',    color: '#86C3D8' },
  { clave: 'revision',  titulo: 'En revisión', color: '#F0B47E' },
  { clave: 'terminada', titulo: 'Terminadas',  color: '#A8C86E' },
];

// Datos de ejemplo para que el tablero no arranque vacío.
// En la próxima versión esto se reemplaza por lo que venga de Firestore.
export const TAREAS_INICIALES = [
  { id: '1', titulo: 'TP2 — App React + Firebase', materia: 'Frontend II',  estado: 'en-curso' },
  { id: '2', titulo: 'Boceto motion Pasito',       materia: 'Motion',       estado: 'revision' },
  { id: '3', titulo: 'Informe técnico TPF',        materia: 'Tecno IV',     estado: 'pendiente' },
  { id: '4', titulo: 'Dirección de arte corto 360', materia: 'Multimedia 3', estado: 'pendiente' },
  { id: '5', titulo: 'TP1 — Sitio estático',        materia: 'Frontend II',  estado: 'terminada' },
];
