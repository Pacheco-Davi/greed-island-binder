import '../../css/FilterChips.css';

/**
 * Grupo de "chips" de filtro, REUTILIZÁVEL: o mesmo componente vira o filtro
 * de categoria e o de rank, só mudando as props.
 *
 * Props:
 *   label     título do grupo (vira <legend>)
 *   options   [{ value, label, count?, color? }]
 *   value     valor ativo, ou null para "todos"
 *   onChange  (valorOuNull) => void
 *   allLabel  texto do chip "todos"
 *   total     número exibido no chip "todos" (opcional)
 *
 * Clicar no chip ativo de novo desliga o filtro. aria-pressed diz ao leitor
 * de tela se o botão está "apertado".
 */
export default function FilterChips({ label, options, value, onChange, allLabel = 'Todos', total }) {
  return (
    <fieldset className="filter-chips">
      <legend className="filter-chips__legend">{label}</legend>
      <div className="filter-chips__list">
        <button type="button" className="filter-chips__chip" aria-pressed={value === null} onClick={() => onChange(null)}>
          {allLabel}
          {total !== undefined && <span className="filter-chips__count">{total}</span>}
        </button>

        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              className="filter-chips__chip"
              aria-pressed={isActive}
              disabled={option.count === 0 && !isActive}
              style={option.color ? { '--chip-color': option.color } : undefined}
              onClick={() => onChange(isActive ? null : option.value)}
            >
              {option.color && <span className="filter-chips__swatch" aria-hidden="true" />}
              {option.label}
              {option.count !== undefined && <span className="filter-chips__count">{option.count}</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
