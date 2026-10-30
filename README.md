# Carga — gestor de entregas

TP2 · Desarrollo Frontend II · UADE

Tablero kanban para organizar las entregas de la facultad. Cada entrega se puede
crear, mover entre columnas (Pendientes, En curso, En revisión, Terminadas) y eliminar.
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
- `src/App.jsx`: login anónimo y operaciones con Firestore
  (`getDocs`, `addDoc`, `updateDoc`, `deleteDoc`)
- `src/components/`: Tablero, Columna, Ficha y FormNueva
- `firestore.rules`: reglas de seguridad de la base

## Estructura de datos

`usuarios/{uid}/tareas/{id}` → `{ titulo, materia, estado, creada }`