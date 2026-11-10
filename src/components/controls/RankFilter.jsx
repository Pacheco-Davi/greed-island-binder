import FilterChips from './FilterChips.jsx';

/** Filtro por rank (SS → H). Reaproveita o mesmo FilterChips da categoria. */
export default function RankFilter({ ranks, value, onChange }) {
  const options = ranks.map((rank) => ({ value: rank, label: rank }));
  return <FilterChips label="Rank" options={options} value={value} onChange={onChange} allLabel="Todos" />;
}
