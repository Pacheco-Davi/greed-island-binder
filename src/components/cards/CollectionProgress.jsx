import '../../css/CollectionProgress.css';

/**
 * Progresso da coleção: quantas cartas de cada categoria estão nos favoritos.
 * Como no jogo, a meta é completar os 100 slots designados.
 * Props: categories, counts ({ categoriaId: n } dos favoritos), totals ({ categoriaId: n } do catálogo)
 */
export default function CollectionProgress({ categories, counts, totals }) {
  const specified = counts.specified ?? 0;

  return (
    <section className="collection-progress" aria-labelledby="collection-title">
      <h3 id="collection-title" className="collection-progress__title">
        Sua coleção
      </h3>
      <p className="collection-progress__headline">
        <strong>{specified}</strong> de {totals.specified} slots designados
      </p>
      <progress className="collection-progress__bar" max={totals.specified} value={specified} aria-label="Slots designados na sua coleção" />
      <ul className="collection-progress__list">
        {categories.map((category) => (
          <li key={category.id} className="collection-progress__item" style={{ '--category-color': category.color }}>
            <span className="collection-progress__swatch" aria-hidden="true" />
            <span className="collection-progress__label">{category.label}</span>
            <span className="collection-progress__value">
              {counts[category.id] ?? 0}/{totals[category.id]}
            </span>
          </li>
        ))}
      </ul>
      <p className="collection-progress__hint">Favorite cartas para colocá-las na sua coleção.</p>
    </section>
  );
}
