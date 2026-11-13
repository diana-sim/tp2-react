// Datos FICTICIOS para probar la app (modo dev). No se guardan en Firestore.
// Las fechas se calculan desde hoy, así siempre hay entregas con distintos niveles de urgencia.

const fecha = dias => {
  const d = new Date(Date.now() + dias * 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const id = () => crypto.randomUUID();
const parte = (titulo, horas, estado, asignadoA = null) => ({ id: id(), titulo, horas, estado, asignadoA });

// En modo prueba la entrega es "de" un usuario ficticio llamado demo.
// Algunas están compartidas con otro usuario ficticio para poder ver cómo funciona.
const YO = 'demo';
const COMPANERA = 'demo-2';
const OTRO = 'demo-3';
const FICHAS = {
  [YO]: { nombre: 'Usuario demo', email: 'vos@ejemplo.com' },
  [COMPANERA]: { nombre: 'Sofi Rivas', email: 'sofi@ejemplo.com' },
  [OTRO]: { nombre: 'Fede Ortiz', email: 'fede@ejemplo.com' },
};
export const DEMO_COMPANERA = COMPANERA;

// Misma forma que una entrega real (ver services/tareas.js)
export const entregaDePrueba = datos => {
  const miembros = datos?.miembros || [YO];
  return {
    id: id(), estado: 'pendiente', creada: Date.now(), fechaEntrega: '', horasEstimadas: 0,
    horasReales: 0, notas: '', links: [], subtareas: [],
    propietario: YO,
    miembrosInfo: Object.fromEntries(miembros.map(m => [m, FICHAS[m]])),
    ...datos,
    miembros,
  };
};

export const crearDemo = () => [
  // ---------- vencida ----------
  entregaDePrueba({ titulo: 'Resumen de lectura: Bauhaus', materia: 'Historia del Diseño', fechaEntrega: fecha(-2) }),

  // ---------- en riesgo (estimada, no llega) ----------
  entregaDePrueba({
    titulo: 'Informe técnico TPF', materia: 'Tecno IV', fechaEntrega: fecha(2), estado: 'en-curso',
    notas: 'El profe pidió normas APA y planos en A3.',
    miembros: [YO, COMPANERA],
    subtareas: [parte('Memoria descriptiva', 4, 'hecha', YO), parte('Cálculos de mecanismo', 5, 'en-curso', COMPANERA), parte('Planos de conjunto', 4, 'pendiente', null)],
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

// Solicitudes ficticias (v3.1): entregas de otras personas que te invitaron.
// No aparecen en tus listas hasta que las aceptás desde el aviso de arriba.
export const crearInvitacionesDemo = () => [
  entregaDePrueba({
    titulo: 'Maqueta final de Taller', materia: 'Taller de Diseño', fechaEntrega: fecha(12),
    propietario: COMPANERA, miembros: [COMPANERA],
    invitados: [YO], invitadosInfo: { [YO]: { ...FICHAS[YO], invitadoPor: 'Sofi Rivas' } },
    subtareas: [parte('Planos', 4, 'hecha', COMPANERA), parte('Corte láser', 3, 'pendiente'), parte('Armado', 5, 'pendiente')],
  }),
  entregaDePrueba({
    titulo: 'Exposición oral de Sociología', materia: 'Sociología', fechaEntrega: fecha(8),
    propietario: OTRO, miembros: [OTRO, COMPANERA],
    invitados: [YO], invitadosInfo: { [YO]: { ...FICHAS[YO], invitadoPor: 'Fede Ortiz' } },
  }),
];
