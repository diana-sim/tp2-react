# Historial de versiones

Registro de los cambios de cada versión publicada de **Al día**.

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
