// Datos FICTICIOS para probar la app (modo dev). No se guardan en Firestore.
// Las fechas se calculan desde hoy, así siempre hay entregas con distintos niveles de urgencia.

const fecha = dias => {
  const d = new Date(Date.now() + dias * 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const id = () => crypto.randomUUID();
const parte = (titulo, horas, estado) => ({ id: id(), titulo, horas, estado });

// Misma forma que una entrega real (ver services/tareas.js)
export const entregaDePrueba = datos => ({
  id: id(), estado: 'pendiente', creada: Date.now(), fechaEntrega: '', horasEstimadas: 0,
  horasReales: 0, notas: '', links: [], subtareas: [], ...datos,
});

export const crearDemo = () => [
  // ---------- vencida ----------
  entregaDePrueba({ titulo: 'Resumen de lectura: Bauhaus', materia: 'Historia del Diseño', fechaEntrega: fecha(-2) }),

  // ---------- en riesgo (estimada, no llega) ----------
  entregaDePrueba({
    titulo: 'Informe técnico TPF', materia: 'Tecno IV', fechaEntrega: fecha(2), estado: 'en-curso',
    notas: 'El profe pidió normas APA y planos en A3.',
    subtareas: [parte('Memoria descriptiva', 4, 'hecha'), parte('Cálculos de mecanismo', 5, 'en-curso'), parte('Planos de conjunto', 4, 'pendiente')],
  }),

  // ---------- vence pronto (sin estimar) ----------
  entregaDePrueba({ titulo: 'Parcial de Matemática II', materia: 'Matemática II', fechaEntrega: fecha(1) }),

  // ---------- justo ----------
  entregaDePrueba({
    titulo: 'TP2 — App React + Firebase', materia: 'Frontend II', fechaEntrega: fecha(4), estado: 'en-curso',
    links: [{ id: id(), etiqueta: 'Repositorio', url: 'https://github.com' }],
    subtareas: [parte('Definir idea', 2, 'hecha'), parte('Conectar Firestore', 5, 'hecha'), parte('Diseño de vistas', 6, 'en-curso'), parte('Deploy y bitácora', 3, 'pendiente')],
  }),

  // ---------- esta semana (sin estimar, en revisión) ----------
  entregaDePrueba({
    titulo: 'Lámina de anatomía', materia: 'Dibujo II', fechaEntrega: fecha(5), estado: 'revision',
    subtareas: [parte('Bocetos', 0, 'hecha'), parte('Pasado en limpio', 0, 'hecha'), parte('Escaneo', 0, 'pendiente')],
  }),

  // ---------- con tiempo ----------
  entregaDePrueba({ titulo: 'Dirección de arte corto 360', materia: 'Multimedia 3', fechaEntrega: fecha(18), horasEstimadas: 10 }),

  // ---------- más adelante ----------
  entregaDePrueba({ titulo: 'Monografía final', materia: 'Sociología', fechaEntrega: fecha(26) }),

  // ---------- sin fecha ----------
  entregaDePrueba({ titulo: 'Ideas para el proyecto final', materia: 'Taller de Diseño' }),

  // ---------- terminadas (alimentan "Mi ritmo") ----------
  entregaDePrueba({
    titulo: 'TP1 — Sitio estático', materia: 'Frontend II', fechaEntrega: fecha(-20), estado: 'terminada', horasReales: 13,
    subtareas: [parte('Maquetado HTML/CSS', 5, 'hecha'), parte('Publicar en GitHub Pages', 3, 'hecha')],
  }),
  entregaDePrueba({ titulo: 'Carpeta de preproducción', materia: 'Animación', fechaEntrega: fecha(-9), estado: 'terminada', horasEstimadas: 14, horasReales: 19 }),
  entregaDePrueba({ titulo: 'Parcial de teoría', materia: 'Tecno IV', fechaEntrega: fecha(-30), estado: 'terminada', horasEstimadas: 10, horasReales: 9 }),
  entregaDePrueba({ titulo: 'Ensayo de historia', materia: 'Historia del Diseño', fechaEntrega: fecha(-4), estado: 'terminada', horasEstimadas: 4 }),
];
