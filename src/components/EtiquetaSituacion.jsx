// Etiqueta de color con el estado de una entrega: "Con tiempo", "Justo", "En riesgo"…
export default function EtiquetaSituacion({ sit }) {
  return <span className={'sit sit-' + sit.color}>{sit.etiqueta}</span>;
}
