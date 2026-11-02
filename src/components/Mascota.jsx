// Posti, la mascota de Al día: un post-it que te acompaña.
// Las imágenes están en /public/mascota (Vite sirve esa carpeta tal cual).
// Es decorativa: el texto de al lado ya dice lo importante, por eso alt="".
//   pose: 'saludando' | 'pensando' | 'festejando' | 'preocupada'
export default function Mascota({ pose, tamano = 80 }) {
  return (
    <img className="mascota" src={`/mascota/${pose}.png`} width={tamano} alt="" aria-hidden="true" draggable="false" />
  );
}
