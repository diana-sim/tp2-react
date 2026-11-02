// Funciones para mostrar datos de forma legible. No calculan nada de la app.

// 5.4 → "5 h 25" · 0.5 → "30 min" · 6 → "6 h"  (redondea a 5 minutos)
export const fmtHoras = h => {
  const minutos = Math.round((h * 60) / 5) * 5;
  const hs = Math.floor(minutos / 60);
  const min = minutos % 60;
  if (hs === 0) return `${min} min`;
  return min ? `${hs} h ${min}` : `${hs} h`;
};

// Pasa horas a "días de estudio" según cuántas horas por día estudiás.
// 2 h con 3 h/día → "menos de un día" · 7 h → "2 días"
export const fmtDiasEstudio = (horas, hpd) => {
  const dias = Math.abs(horas) / hpd;
  if (dias < 1) return 'menos de un día';
  const n = Math.round(dias);
  return `${n} ${n === 1 ? 'día' : 'días'}`;
};

export const fmtFecha = f =>
  f ? new Date(f + 'T12:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) : 'sin fecha';

export const textoDias = d =>
  d === null ? '' : d < 0 ? `venció hace ${-d} d` : d === 0 ? 'vence hoy' : d === 1 ? 'vence mañana' : `en ${d} días`;

export const fechaDeHoy = () =>
  new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

export const saludo = () => {
  const h = new Date().getHours();
  return h < 13 ? 'Buen día' : h < 20 ? 'Buenas tardes' : 'Buenas noches';
};

// Fecha local como texto "2026-11-13" (el mismo formato que guarda el input de fecha).
export const claveFecha = d =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
