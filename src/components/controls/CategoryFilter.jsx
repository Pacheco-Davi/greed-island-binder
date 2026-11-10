import FilterChips from './FilterChips.jsx';

/**
 * Filtro por categoria (o "filtro por tipo" da Pokédex).
 * `counts` vem pronto do pai: quantas cartas cada categoria teria com a busca
 * e os outros filtros atuais.
 */
export default function CategoryFilter({ categories, counts, value, onChange }) {
  const options = categories.map((category) => ({
    value: category.id,
    label: category.label,
    count: counts[category.id] ?? 0,
    color: category.color,
  }));
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return <FilterChips label="Categoria" options={options} value={value} onChange={onChange} allLabel="Todas" total={total} />;
}
