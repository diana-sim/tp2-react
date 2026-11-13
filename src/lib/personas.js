// Cómo mostramos a las personas que comparten una entrega.
// La ficha es { email, nombre } y viene de miembrosInfo, dentro de la propia entrega.

// Nombre para mostrar: el nombre si lo cargó, y si no la parte del email antes de la arroba.
export const nombreVisible = ficha =>
  ficha?.nombre?.trim() || (ficha?.email || '').split('@')[0] || 'Alguien';

// Una o dos letras para el circulito. "Diana Sim" → "DS" · "fede@mail.com" → "F"
export const iniciales = ficha => {
  const nombre = nombreVisible(ficha).trim();
  const partes = nombre.split(/[\s.]+/).filter(Boolean);
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
  return nombre.slice(0, 1).toUpperCase();
};

// Color estable por persona: la misma persona siempre tiene el mismo color,
// en cualquier compu, porque sale de su propio id.
const COLORES = ['#B3A7E0', '#86C3D8', '#F0B47E', '#A8C86E', '#F2A8C4', '#8FB8A0'];
export const colorDe = uid => {
  let suma = 0;
  for (const letra of String(uid)) suma += letra.charCodeAt(0);
  return COLORES[suma % COLORES.length];
};
