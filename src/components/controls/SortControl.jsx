import { useId } from 'react';
import '../../css/SortControl.css';

const FIELDS = [
  { value: 'number', label: 'Número (ordem do fichário)' },
  { value: 'name', label: 'Nome' },
  { value: 'rank', label: 'Rank' },
  { value: 'limit', label: 'Limite de conversão' },
];

/** Escolhe o campo e o sentido da ordenação. `value` = { field, direction }. */
export default function SortControl({ value, onChange }) {
  const id = useId();
  const { field, direction } = value;
  const isAsc = direction === 'asc';

  return (
    <div className="sort-control">
      <label className="sort-control__label" htmlFor={id}>
        Ordenar por
      </label>
      <select id={id} className="sort-control__select" value={field} onChange={(event) => onChange({ field: event.target.value, direction })}>
        {FIELDS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="sort-control__direction"
        onClick={() => onChange({ field, direction: isAsc ? 'desc' : 'asc' })}
        aria-label={isAsc ? 'Ordem crescente. Mudar para decrescente' : 'Ordem decrescente. Mudar para crescente'}
      >
        {isAsc ? '↑ Crescente' : '↓ Decrescente'}
      </button>
    </div>
  );
}
