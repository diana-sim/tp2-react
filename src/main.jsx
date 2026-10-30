import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// main.jsx es el punto de entrada. Busca el div 'root'en el html y le dice a React que dibuje ahí adentro el componente App.
// Este archivo lo genera el template, no se suele tocar así que es igual en casi todos los proyectos.