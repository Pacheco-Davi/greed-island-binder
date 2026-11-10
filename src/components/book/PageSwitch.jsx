import '../../css/PageSwitch.css';

/**
 * Em telas estreitas o livro mostra uma página por vez; estes botões escolhem
 * qual. Some no desktop (CSS), onde as duas páginas aparecem lado a lado.
 * Props: options ([{ value, label }]), value, onChange
 */
export default function PageSwitch({ options, value, onChange }) {
  return (
    <div className="page-switch" role="group" aria-label="Página do livro">
      {options.map((option) => (
        <button key={option.value} type="button" className="page-switch__button" aria-pressed={option.value === value} onClick={() => onChange(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  );
}
