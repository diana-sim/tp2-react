# Al día · ¿Estás al día?

TP2 · Desarrollo Frontend II · UADE

Organizador de entregas para **estudiantes universitarios**, pensado especialmente para quienes
tienen *time blindness* (por ejemplo, con TDAH) y necesitan **ver** sus tareas para organizarse.

Funciona como un gestor de proyectos de la facu: cargás tus entregas con su materia y fecha,
las desarmás en partes y las mirás de la forma que te resulte más cómoda.

**Secciones:**
- **Hoy:** por dónde empezar, qué vence en las próximas 2 semanas y cómo vienen tus entregas.
- **Mis entregas:** las mismas entregas en tres vistas a elección: **Lista** (por urgencia),
  **Tablero** (kanban por estado) y **Calendario** (por fecha). La vista favorita se recuerda.
- **Detalle** (panel lateral): estado, avance, partes, notas y links de cada entrega.
- **Mi ritmo** (extra): si cargás cuánto tiempo creés que te lleva cada entrega y cuánto te llevó,
  la app aprende cómo estimás ("subestimás tus tareas en un 30%") y te avisa si no llegás.

Los datos se guardan en Cloud Firestore, con un usuario anónimo por navegador.

## Tecnologías

- React + Vite
- Firebase (Authentication anónima + Cloud Firestore)
- Vercel (publicación)

## Cómo ejecutarlo

1. Clonar el repositorio e instalar dependencias:
   ```bash
   npm install
   ```
2. Copiar `.env.example` como `.env` y completar con los datos de la app web de Firebase
   (Configuración del proyecto → General → Tus apps).
3. En la consola de Firebase:
   - Authentication → Método de acceso → activar **Anónimo**.
   - Crear Cloud Firestore (edición Standard, región southamerica-east1).
   - Publicar las reglas del archivo `firestore.rules`.
4. Levantar el proyecto:
   ```bash
   npm run dev
   ```

## Dónde está cada cosa

- `src/firebase.js`: conexión con Firebase (lee las variables del `.env`)
- `src/services/tareas.js`: **todas** las operaciones con Firebase
  (sesión anónima, `getDocs`, `getDoc`, `addDoc`, `updateDoc`, `setDoc`, `deleteDoc`)
- `src/App.jsx`: estado principal y navegación entre secciones
- `src/views/`: las secciones (Hoy, Mis entregas, Mi ritmo)
- `src/components/`: piezas reutilizables (panel de detalle, tablero, calendario, formularios…)
- `src/lib/calculos.js`: progreso, ritmo y situación de cada entrega (se calculan, no se guardan)
- `src/lib/formato.js`: cómo se muestran horas, fechas y "días de estudio"
- `firestore.rules`: reglas de seguridad de la base

## Estructura de datos

```
usuarios/{uid}/tareas/{id}
{
  titulo, materia, fechaEntrega, estado, creada,
  horasEstimadas,            // si no tiene partes
  horasReales,               // se carga al terminarla
  notas,
  subtareas: [{ id, titulo, horas, estado }],
  links: [{ id, etiqueta, url }]
}

usuarios/{uid}/config/preferencias
{ vistaPreferida, horasPorDia }
```
