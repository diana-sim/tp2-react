import { useState } from 'react';

// Formulario "controlado": el valor de cada input sale del estado,
// y cada tecla actualiza ese estado con onChange.
export default function FormNueva({ onAgregar }) {
  const [titulo, setTitulo] = useState('');
  const [materia, setMateria] = useState('');
  const [error, setError] = useState('');

  const enviar = async e => {
    e.preventDefault(); // evita que el form recargue la página

    // Validaciones básicas (la consigna las pide)
    if (!titulo.trim()) return setError('Poné un título a la entrega.');
    if (!materia.trim()) return setError('Falta la materia.');

    setError('');
    // Esperamos la respuesta de App: true si Firestore guardó, false si falló.
    const salioBien = await onAgregar(titulo.trim(), materia.trim());
    // Solo vaciamos los campos si se guardó; si falló, el texto queda para reintentar.
    if (salioBien) {
      setTitulo('');
      setMateria('');
    }
  };

  return (
    <form className="form-nueva" onSubmit={enviar}>
      <input
        className="campo"
        placeholder="Título de la entrega"
        value={titulo}
        onChange={e => { setTitulo(e.target.value); setError(''); }}
      />
      <input
        className="campo campo-corto"
        placeholder="Materia"
        value={materia}
        onChange={e => { setMateria(e.target.value); setError(''); }}
      />
      <button className="btn btn-pri" type="submit">+ Agregar</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
