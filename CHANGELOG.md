# Historial de versiones

Registro de los cambios de cada versión publicada de **Al día**.

## v3.1 — Solicitudes, responsables e ícono de compartida

- **Compartir con solicitud:** invitar a alguien ya no lo suma directo. Le llega una
  solicitud ("Sofi te invitó a TP2") arriba de todo, en cualquier sección, y elige
  **Aceptar** o **Rechazar**. Hasta que acepta, la entrega no aparece en sus listas.
- **Invitar al crear:** en *Nueva entrega* se pueden sumar emails para invitar desde el principio.
  Antes de crear se verifica que tengan cuenta; si alguno no existe, se avisa y no se crea nada.
- **Invitaciones pendientes:** en "Compartida con" se ven las solicitudes enviadas
  ("esperando respuesta") y se pueden cancelar.
- **Responsable por parte, más visible:** cada parte muestra el circulito con las iniciales de
  quien se encarga, y al crear una parte nueva ya se puede elegir el responsable.
- **Ícono de compartida:** las entregas con más de una persona llevan un ícono de personitas
  al lado del título (lista, tablero, calendario, Hoy y detalle).
- **Reglas de Firestore:** la persona invitada puede leer la entrega y responder su solicitud,
  y nadie puede sumar miembros a mano: solo se entra aceptando.
- **Modo prueba:** "Ejemplos" trae 2 solicitudes ficticias para probar el flujo.

## v3 — Entregas compartidas

Hasta acá la app era personal: cada quien veía solo sus entregas. Ahora una entrega
puede tener varias personas y repartirse el trabajo.

- **Compartir una entrega:** desde el detalle se suma a alguien por su email y los dos
  ven la misma entrega, con los mismos cambios.
- **Responsable por parte:** cada parte de la entrega puede asignarse a una persona,
  para saber quién hace qué.
- **Quién está en la entrega:** avatares con las iniciales en el encabezado del detalle
  y lista de personas con su email.
- **Salir o quitar:** el propietario puede quitar a alguien; cada quien puede salirse de
  una entrega que le compartieron. Al sacar a una persona, sus partes quedan sin asignar.
- **Eliminar:** solo puede eliminar la entrega quien la creó. Los demás la editan, no la borran.
- **Directorio de personas:** al entrar, cada cuenta deja su email y su nombre en
  `usuarios/{uid}`. Hace falta para poder encontrar a quién invitar.
- **Nuevo lugar de los datos:** las entregas pasaron de `usuarios/{uid}/tareas/{id}` a una
  colección propia `tareas/{id}` con una lista de miembros. Era la única forma de que
  dos personas pudieran acceder a la misma entrega.
- **Migración automática:** la primera vez que alguien entra con la v3, sus entregas
  anteriores se copian al formato nuevo. Las originales quedan como respaldo.
- **Reglas de Firestore nuevas:** el permiso ya no es "solo el dueño de la carpeta" sino
  "cualquiera que esté en la lista de miembros de esta entrega".

## v2 — Cuentas, perfil y menú

- **Cuentas con email y contraseña:** pantalla de login y registro
  (`src/components/Login.jsx`, `src/services/auth.js`), con mensajes de error traducidos.
  Antes la identidad era anónima y los datos quedaban atados al navegador; ahora la
  persona entra desde cualquier compu o celular y encuentra sus entregas.
- **Perfil:** menú con el nombre y el email de la cuenta, cambio de nombre y cerrar sesión.
- **Menú lateral colapsable:** se puede achicar a solo íconos para ganar espacio,
  y la preferencia se recuerda en Firestore.

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
