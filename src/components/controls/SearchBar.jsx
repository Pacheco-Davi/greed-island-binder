import { useId } from 'react';
import '../../css/SearchBar.css';

/**
 * Campo de busca CONTROLADO: o texto mora no estado do componente pai
 * (`value`) e cada tecla chama `onChange`. O input só mostra o que o React manda.
 * Esc limpa a busca.
 */
export default function SearchBar({ value, onChange }) {
  // useId gera um id único e estável: o componente pode aparecer duas vezes
  // na tela sem dois inputs com o mesmo id (o que quebraria o <label>).
  const id = useId();

  return (
    <div className="search-bar" role="search">
      <label className="search-bar__label" htmlFor={id}>
        Buscar carta
      </label>
      <div className="search-bar__field">
        <input
          id={id}
          className="search-bar__input"
          type="search"
          value={value}
          placeholder="Nome ou número (ex.: 25, #1001, ruler)"
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') onChange('');
          }}
        />
        {value && (
          <button type="button" className="search-bar__clear" onClick={() => onChange('')} aria-label="Limpar busca">
            ×
          </button>
        )}
      </div>
    </div>
  );
}
