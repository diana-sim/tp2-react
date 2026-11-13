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

- **Entregas compartidas:** una entrega puede tener varias personas. Se invita a alguien por su
  email, esa persona recibe una **solicitud** y decide si se suma. Una vez adentro, todos ven los
  mismos cambios y cada parte puede tener un responsable. Las compartidas llevan un ícono de personitas.

Cada persona entra con su email y contraseña. Sus datos se guardan en Cloud Firestore
y la acompañan en cualquier compu o celular.

## Tecnologías

- React + Vite
- Firebase (Authentication con email + Cloud Firestore)
- Vercel (publicación)

## Cómo ejecutarlo

1. Clonar el repositorio e instalar dependencias:
   ```bash
   npm install
   ```
2. Copiar `.env.example` como `.env` y completar con los datos de la app web de Firebase
   (Configuración del proyecto → General → Tus apps).
3. En la consola de Firebase:
   - Authentication → Método de acceso → activar **Correo electrónico/contraseña**.
   - Crear Cloud Firestore (edición Standard, región southamerica-east1).
   - Publicar las reglas del archivo `firestore.rules`.
4. Levantar el proyecto:
   ```bash
   npm run dev
   ```

## Dónde está cada cosa

- `src/firebase.js`: conexión con Firebase (lee las variables del `.env`)
- `src/services/auth.js`: login, signup y logout
  (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signOut`)
- `src/services/tareas.js`: **todas** las operaciones con Firestore sobre entregas
  (`getDocs`, `getDoc`, `addDoc`, `updateDoc`, `setDoc`, `deleteDoc`,
  `arrayUnion`, `arrayRemove`, `writeBatch`)
- `src/services/usuarios.js`: directorio de personas, para poder invitar por email
- `src/components/Compartir.jsx`: invitar personas (solicitud), cancelar invitaciones y quitar miembros
- `src/components/Solicitudes.jsx`: aviso para aceptar o rechazar solicitudes recibidas
- `src/lib/personas.js`: cómo se muestra cada persona (nombre, iniciales)
- `src/App.jsx`: estado principal y navegación entre secciones
- `src/views/`: las secciones (Hoy, Mis entregas, Mi ritmo)
- `src/components/`: piezas reutilizables (panel de detalle, tablero, calendario, formularios…)
- `src/lib/calculos.js`: progreso, ritmo y situación de cada entrega (se calculan, no se guardan)
- `src/lib/formato.js`: cómo se muestran horas, fechas y "días de estudio"
- `firestore.rules`: reglas de seguridad de la base

## Estructura de datos

```
tareas/{id}
{
  titulo, materia, fechaEntrega, estado, creada,
  horasEstimadas,            // si no tiene partes
  horasReales,               // se carga al terminarla
  notas,
  subtareas: [{ id, titulo, horas, estado, asignadoA }],   // asignadoA = uid o null
  links: [{ id, etiqueta, url }],

  propietario: uid,                          // quien la creó: la puede eliminar
  miembros: [uid, ...],                      // quiénes acceden: lo que miran las reglas
  miembrosInfo: { uid: { email, nombre } }   // para mostrar quién es quién sin otra consulta
}

usuarios/{uid}
{ email, nombre }                            // directorio: sirve para invitar por email

usuarios/{uid}/config/preferencias
{ vistaPreferida, horasPorDia, nombre, menuColapsado, migradoV3 }
```

### Por qué las entregas no están dentro de cada usuario

Hasta la v2 vivían en `usuarios/{uid}/tareas/{id}` y las reglas decían "solo el dueño de
esta carpeta entra". Era imposible compartirlas: nadie más podía siquiera leer ahí.

En la v3 la entrega pasó a una colección propia y lleva su lista de `miembros`. La regla
cambió a "entra quien esté en la lista". Las entregas creadas antes se copian solas al
formato nuevo la primera vez que la persona entra (`migrarTareasViejas` en
`src/services/tareas.js`); las originales quedan como respaldo y la marca `migradoV3`
evita que se dupliquen.

### Solicitudes para sumarse (v3.1)

Invitar ya no suma a la persona directamente. La entrega guarda dos listas:
`miembros` (los que ya están) e `invitados` (los que tienen una solicitud pendiente).
Quien está en `invitados` puede leer la entrega para ver de qué se trata, pero no le aparece
en sus listas hasta que acepta. Al aceptar, en una sola escritura sale de `invitados` y entra
a `miembros`. Las reglas de Firestore lo hacen cumplir: un miembro no puede agregar miembros
a mano, y la persona invitada solo puede sumarse o sacarse a sí misma.

### Una aclaración sobre el directorio de usuarios

Para invitar a alguien hay que poder encontrarlo, así que `usuarios/{uid}` se puede leer
desde cualquier cuenta con sesión iniciada. Por eso ese documento guarda solo el email y
el nombre, y nada más. Resolverlo de forma más cerrada (que el email no sea consultable)
pide Cloud Functions, que necesita el plan de pago de Firebase.

### Consultas e índices

La lista se trae con `where('miembros', 'array-contains', uid)` y se ordena por fecha en el
navegador. Combinar ese filtro con un `orderBy` obligaría a crear un índice compuesto a
mano en la consola de Firebase; para una lista de este tamaño no vale la pena.
