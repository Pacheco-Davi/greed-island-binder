import Emblem from './Emblem.jsx';
import Sword from './Sword.jsx';
import BookSpine from './BookSpine.jsx';
import '../../css/BookCover.css';

/**
 * O livro FECHADO, em 3D: capa, lombada, borda das páginas e contracapa são
 * faces de uma "caixa" montada com transform (translateZ / rotateY).
 *
 * A capa gira em torno da lombada (transform-origin: left) para abrir. As
 * animações dependem de `state` ('closed' | 'opening' | 'closing') e duram
 * `duration` ms — o mesmo número que o useBookState espera antes do 'DONE'.
 *
 * Props: state, duration, onOpen, ref (React 19: ref é uma prop comum)
 */
export default function BookCover({ state, duration, onOpen, ref }) {
  return (
    <div className={`book-cover book-cover--${state}`} style={{ '--book-ms': `${duration}ms` }}>
      <button ref={ref} type="button" className="book-cover__button" onClick={onOpen} aria-label="Abrir o fichário de Greed Island">
        <span className="book-cover__body">
          <span className="book-cover__back leather" />
          <span className="book-cover__edge book-cover__edge--right" />
          <span className="book-cover__edge book-cover__edge--top" />
          <span className="book-cover__first-page paper">
            <span className="book-cover__first-title">Índice</span>
          </span>
          <BookSpine className="book-cover__spine" />

          <span className="book-cover__front">
            <span className="book-cover__outside leather">
              <span className="book-cover__logo">Greed Island</span>
              <span className="book-cover__panel">
                <Sword className="book-cover__sword book-cover__sword--left" />
                <Emblem className="book-cover__emblem" />
                <Sword className="book-cover__sword book-cover__sword--right" />
              </span>
              <span className="book-cover__credit">Hunter × Hunter</span>
              <span className="book-cover__corner book-cover__corner--tr" />
              <span className="book-cover__corner book-cover__corner--br" />
              <span className="book-cover__corner book-cover__corner--tl" />
              <span className="book-cover__corner book-cover__corner--bl" />
            </span>
            <span className="book-cover__inside paper" />
          </span>
        </span>
      </button>
      <p className="book-cover__hint" aria-hidden="true">
        Clique para abrir <span className="book-cover__hint-key">(ou Enter)</span>
      </p>
    </div>
  );
}
