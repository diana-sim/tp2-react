import { useState } from 'react';
import { ingresar, registrarse, mensajeDeError } from '../services/auth.js';
import Mascota from './Mascota.jsx';

// Pantalla de login y signup: es UN solo formulario que cambia de modo.
// No hace falta avisarle a App cuando sale bien: Firebase detecta la sesión
// nueva (escucharSesion) y App muestra la app sola.
export default function Login() {
  const [modo, setModo] = useState('ingresar'); // 'ingresar' | 'registrarse'
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const esRegistro = modo === 'registrarse';

  const enviar = async e => {
    e.preventDefault();
    // Validaciones básicas antes de molestar a Firebase
    if (!email.trim()) return setError('Escribí tu email.');
    if (contrasena.length < 6) return setError('La contraseña tiene que tener al menos 6 caracteres.');

    setError('');
    setEnviando(true);
    try {
      if (esRegistro) await registrarse(email.trim(), contrasena);
      else await ingresar(email.trim(), contrasena);
      // Si salió bien no hacemos nada más: App se entera sola.
    } catch (err) {
      setError(mensajeDeError(err));
      setEnviando(false);
    }
  };

  const cambiarModo = () => {
    setModo(esRegistro ? 'ingresar' : 'registrarse');
    setError('');
  };

  return (
    <div className="login">
      <form className="login-caja" onSubmit={enviar}>
        <Mascota pose="saludando" tamano={96} />
        <h1>{esRegistro ? 'Creá tu cuenta' : '¿Estás al día?'}</h1>
        <p className="sub">
          {esRegistro ? 'Así tus entregas te esperan en cualquier compu o celular.' : 'Ingresá para ver tus entregas.'}
        </p>

        {error && <p className="error">{error}</p>}

        <label className="lbl-c" htmlFor="l-email">Email</label>
        <input id="l-email" className="campo" type="email" autoComplete="email" autoFocus
               value={email} onChange={e => { setEmail(e.target.value); setError(''); }} />

        <label className="lbl-c" htmlFor="l-clave">Contraseña</label>
        <input id="l-clave" className="campo" type="password"
               autoComplete={esRegistro ? 'new-password' : 'current-password'}
               placeholder={esRegistro ? 'Mínimo 6 caracteres' : ''}
               value={contrasena} onChange={e => { setContrasena(e.target.value); setError(''); }} />

        <button className="btn btn-pri btn-ancho login-btn" type="submit" disabled={enviando}>
          {enviando ? 'Un segundo…' : esRegistro ? 'Crear cuenta' : 'Ingresar'}
        </button>

        <p className="login-cambio">
          {esRegistro ? '¿Ya tenés cuenta?' : '¿Primera vez?'}{' '}
          <button type="button" className="link-btn link-inline" onClick={cambiarModo}>
            {esRegistro ? 'Ingresá' : 'Creá tu cuenta'}
          </button>
        </p>
      </form>
    </div>
  );
}
