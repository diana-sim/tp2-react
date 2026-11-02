// Cálculos derivados. Nada de esto se guarda en Firestore:
// se calcula cada vez a partir de los datos, así nunca queda desactualizado.
import { fmtHoras, fmtDiasEstudio, textoDias } from './formato.js';

// Si la persona todavía no eligió cuántas horas por día estudia, usamos esto.
export const HORAS_POR_DIA_DEFECTO = 3;
// Cuántas entregas cerradas hacen falta para empezar a corregir estimaciones.
export const MIN_CERRADAS = 3;

// ============================================================
// Horas de una entrega
// ============================================================
const sumar = lista => lista.reduce((total, s) => total + (s.horas || 0), 0);

export const tieneSubtareas = t => t.subtareas.length > 0;
// Las partes pueden tener horas o no. Si tienen, la estimación sale de ahí.
export const usaHorasDePartes = t => sumar(t.subtareas) > 0;

// Estimación: suma de las partes si tienen horas; si no, el número que cargó la persona (0 = sin estimar).
export const horasEstimadas = t => (usaHorasDePartes(t) ? sumar(t.subtareas) : t.horasEstimadas || 0);
export const tieneEstimacion = t => horasEstimadas(t) > 0;

// Qué fracción (0 a 1) de la entrega está en cierto estado.
// Si las partes tienen horas, pesa cada una según sus horas; si no, todas valen lo mismo.
const fraccion = (t, estado) => {
  if (!tieneSubtareas(t)) return 0;
  const partes = t.subtareas.filter(s => s.estado === estado);
  return usaHorasDePartes(t) ? sumar(partes) / sumar(t.subtareas) : partes.length / t.subtareas.length;
};

export const progreso = t => (t.estado === 'terminada' ? 100 : Math.round(fraccion(t, 'hecha') * 100));
export const progresoEnCurso = t => (t.estado === 'terminada' ? 0 : Math.round(fraccion(t, 'en-curso') * 100));

export const horasHechas = t => (t.estado === 'terminada' ? horasEstimadas(t) : horasEstimadas(t) * fraccion(t, 'hecha'));
export const horasEnCurso = t => (t.estado === 'terminada' ? 0 : horasEstimadas(t) * fraccion(t, 'en-curso'));
export const horasFaltan = t => horasEstimadas(t) - horasHechas(t);
export const cuentaHechas = t => t.subtareas.filter(s => s.estado === 'hecha').length;

// Días hasta la entrega (negativo si ya venció). null si no tiene fecha.
export const diasRestantes = t => {
  if (!t.fechaEntrega) return null;
  return Math.ceil((new Date(t.fechaEntrega + 'T23:59') - new Date()) / 86400000);
};

// ============================================================
// TU RITMO: cuánto subestimás o sobrestimás
// ============================================================
export const entregasCerradas = tareas =>
  tareas.filter(t => t.estado === 'terminada' && t.horasReales > 0 && horasEstimadas(t) > 0);

// Ritmo = horas reales totales / horas estimadas totales de las entregas cerradas.
// Ej: estimaste 20 h en total y te llevaron 27 h → 1,35 → subestimás un 35%.
// Recién se aplica a las estimaciones nuevas cuando hay MIN_CERRADAS entregas cerradas.
export const calcularRitmo = tareas => {
  const cerradas = entregasCerradas(tareas);
  const estimado = cerradas.reduce((a, t) => a + horasEstimadas(t), 0);
  const real = cerradas.reduce((a, t) => a + t.horasReales, 0);
  const bruto = cerradas.length ? real / estimado : 1;
  const conocido = cerradas.length >= MIN_CERRADAS;
  return { cerradas: cerradas.length, bruto, conocido, factor: conocido ? bruto : 1 };
};

// Lo traduce a una frase que se entienda sin números raros.
export const describirRitmo = ritmo => {
  if (!ritmo.conocido) {
    const faltan = MIN_CERRADAS - ritmo.cerradas;
    return {
      tipo: 'aprendiendo',
      titulo: 'Todavía estoy conociendo tu ritmo',
      texto: `Cerrá ${faltan} ${faltan === 1 ? 'entrega más' : 'entregas más'} cargando cuánto te llevaron y empiezo a ajustar tus estimaciones.`,
    };
  }
  const pct = Math.round(Math.abs(ritmo.factor - 1) * 100);
  if (pct < 5) return { tipo: 'bien', pct, titulo: 'Estimás bastante bien', texto: 'Lo que calculás coincide con lo que tardás.' };
  if (ritmo.factor > 1) return { tipo: 'sub', pct, titulo: `Subestimás tus tareas en un ${pct}%`, texto: `Te llevan un ${pct}% más de lo que calculás.` };
  return { tipo: 'sobre', pct, titulo: `Sobrestimás tus tareas en un ${pct}%`, texto: `Te llevan un ${pct}% menos de lo que calculás.` };
};

// Frase para cuando la persona carga una estimación: cuánto conviene reservar.
export const sugerirReserva = (horas, ritmo) => {
  if (!horas || horas <= 0) return '';
  if (!ritmo.conocido) return 'Cuando cierres algunas entregas, te voy a sugerir cuánto tiempo reservar según tu ritmo.';
  const d = describirRitmo(ritmo);
  if (d.tipo === 'bien') return `Solés estimar bien: reservá ${fmtHoras(horas)}.`;
  const verbo = d.tipo === 'sub' ? 'subestimar' : 'sobrestimar';
  return `Calculás ${fmtHoras(horas)}. Como solés ${verbo} un ${d.pct}%, reservá ${fmtHoras(horas * ritmo.factor)}.`;
};

// ============================================================
// SITUACIÓN de una entrega: ¿llego o no llego?
// ============================================================
// margen = horas de estudio que tenés hasta la fecha − horas que te faltan (ajustadas por tu ritmo)
export const calcularMargen = (t, factor, hpd) => {
  const dias = diasRestantes(t);
  if (dias === null) return null;
  return Math.max(dias, 0) * hpd - horasFaltan(t) * factor;
};

// Devuelve todo lo necesario para mostrar el estado de una entrega en palabras.
// Sin estimación, se guía por la fecha. Con estimación, además calcula si llegás.
export const situacion = (t, factor, hpd) => {
  if (t.estado === 'terminada') {
    return { clave: 'cerrada', color: 'gris', etiqueta: 'Terminada', frase: t.horasReales ? `Te llevó ${fmtHoras(t.horasReales)}` : '' };
  }
  if (!t.fechaEntrega) return { clave: 'sinfecha', color: 'gris', etiqueta: 'Sin fecha', frase: 'Agregale una fecha' };

  const dias = diasRestantes(t);
  const partes = tieneSubtareas(t) ? `${cuentaHechas(t)} de ${t.subtareas.length} partes listas` : '';
  if (dias < 0) return { clave: 'vencida', color: 'rojo', etiqueta: 'Vencida', margen: dias * hpd, frase: textoDias(dias) };

  // ---- sin estimación: solo la fecha ----
  if (!tieneEstimacion(t)) {
    const margen = dias * hpd; // para poder ordenar junto con las estimadas
    if (dias <= 2) return { clave: 'pronto', color: 'ambar', etiqueta: 'Vence pronto', margen, frase: partes };
    if (dias <= 7) return { clave: 'semana', color: 'celeste', etiqueta: 'Esta semana', margen, frase: partes };
    return { clave: 'adelante', color: 'gris', etiqueta: 'Más adelante', margen, frase: partes };
  }

  // ---- con estimación: ¿llegás con el tiempo que tenés? ----
  const margen = calcularMargen(t, factor, hpd);
  const d = fmtDiasEstudio(margen, hpd);
  const plural = !(d.startsWith('menos') || d.startsWith('1 ')); // "sobra 1 día" / "sobran 2 días"
  if (margen < 0) return { clave: 'riesgo', color: 'rojo', etiqueta: 'En riesgo', margen, frase: `A este ritmo no llegás: te ${plural ? 'faltan' : 'falta'} ${d} de estudio` };
  if (margen < hpd * 2) return { clave: 'justo', color: 'ambar', etiqueta: 'Justo', margen, frase: `Te ${plural ? 'sobran' : 'sobra'} ${d} de estudio` };
  return { clave: 'tiempo', color: 'oliva', etiqueta: 'Con tiempo', margen, frase: `Te ${plural ? 'sobran' : 'sobra'} ${d} de estudio` };
};

// Orden por urgencia: primero lo que está más al límite. Sin fecha y terminadas, al final.
export const ordenarPorUrgencia = (tareas, factor, hpd) =>
  [...tareas].sort((a, b) => {
    const sa = situacion(a, factor, hpd), sb = situacion(b, factor, hpd);
    const pa = sa.clave === 'cerrada' ? 2 : sa.clave === 'sinfecha' ? 1 : 0;
    const pb = sb.clave === 'cerrada' ? 2 : sb.clave === 'sinfecha' ? 1 : 0;
    if (pa !== pb) return pa - pb;
    return (sa.margen ?? 0) - (sb.margen ?? 0);
  });

// Entregas que vencen en los próximos N días, agrupadas por fecha (para la agenda de "Hoy").
export const proximosDias = (tareas, n) => {
  const grupos = {};
  tareas.forEach(t => {
    const d = diasRestantes(t);
    if (t.estado === 'terminada' || d === null || d < 0 || d > n) return;
    (grupos[t.fechaEntrega] ||= []).push(t);
  });
  return Object.entries(grupos).sort(([a], [b]) => a.localeCompare(b));
};
