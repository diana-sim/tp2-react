# Historial de versiones

Registro de los cambios de cada versión publicada de **Al día**.

## v1.1 — Posti y modo de prueba

- **Mascota:** Posti, un post-it que acompaña con 4 poses:
  saluda en la bienvenida, piensa en las pantallas vacías y en *Mi ritmo* mientras aprende,
  festeja cuando estás al día o terminás una entrega, y se preocupa (con calma) cuando algo
  está en riesgo o vencido.
- **Hoy:** banner con Posti que resume cómo venís ("¡Estás al día!" o "Una entrega necesita atención").
- **Entregas vencidas:** aviso nuevo en el detalle con qué hacer (cambiar la fecha, hablar con el profe o marcarla como terminada).
- **Mi ritmo:** Posti a la izquierda de la tarjeta principal, centrado y con más aire.
- **Modo de prueba (solo desarrollo):** selector *Dev · datos* para ver la app con tus datos,
  vacía o con 12 entregas de ejemplo con distintos niveles de urgencia. Los datos de prueba
  viven en memoria y no se guardan en Firestore. No aparece en la versión publicada.

## v1 — Primera versión funcional

App en React + Vite conectada a Firebase y publicada en Vercel.

- **Secciones:** Hoy, Mis entregas y Mi ritmo.
- **Mis entregas:** las mismas entregas en tres vistas (Lista por urgencia, Tablero kanban
  por estado y Calendario por fecha), con filtros y buscador compartidos.
- **Detalle en panel lateral:** estado, avance, partes, notas, links y edición de título, materia y fecha.
- **Bienvenida:** presenta la app y deja elegir la vista favorita (se guarda en Firestore).
- **Mi ritmo (extra):** estimado vs. real de cada entrega y cuánto subestimás o sobrestimás.
- **Firestore:** consultar, agregar, modificar y eliminar entregas; preferencias por usuario anónimo.
- **Seguridad y configuración:** reglas de Firestore, `.env.example` y README con instrucciones.
- **Experiencia de uso:** validaciones, estados de carga, avisos de éxito y error, diseño responsive.

## v0 — Prototipo

Prototipo en un solo archivo HTML (`carga 6.html`) usado para definir la idea y el diseño.
Guardaba los datos en el navegador (`localStorage`) y no cumplía los requisitos técnicos del TP.
