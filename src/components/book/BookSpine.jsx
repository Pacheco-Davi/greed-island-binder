import Sword from './Sword.jsx';
import '../../css/BookSpine.css';

/**
 * Lombada: couro com 4 nervuras em relevo (gradientes) e o título gravado em
 * dourado na vertical. Aparece de lado enquanto o livro está fechado.
 */
export default function BookSpine({ className = '' }) {
  return (
    <span className={`book-spine leather ${className}`} aria-hidden="true">
      <span className="book-spine__rib book-spine__rib--1" />
      <span className="book-spine__rib book-spine__rib--2" />
      <span className="book-spine__title">Greed Island</span>
      <Sword className="book-spine__sword" />
      <span className="book-spine__rib book-spine__rib--3" />
      <span className="book-spine__rib book-spine__rib--4" />
    </span>
  );
}
