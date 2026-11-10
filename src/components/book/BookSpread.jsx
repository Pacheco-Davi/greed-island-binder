import BookPage from './BookPage.jsx';
import PageSwitch from './PageSwitch.jsx';
import '../../css/BookSpread.css';

/**
 * As duas páginas do livro aberto, com a calha no meio.
 *
 * Props:
 *   left, right             conteúdo de cada página
 *   labels                  [nome da esquerda, nome da direita]
 *   mobilePage              'left' | 'right': qual página aparece em telas estreitas
 *   onMobilePageChange      se informado, mostra os botões para trocar de página
 */
export default function BookSpread({ left, right, labels, mobilePage, onMobilePageChange }) {
  return (
    <div className="book-spread" data-mobile-page={mobilePage}>
      {onMobilePageChange && (
        <PageSwitch
          options={[
            { value: 'left', label: labels[0] },
            { value: 'right', label: labels[1] },
          ]}
          value={mobilePage}
          onChange={onMobilePageChange}
        />
      )}
      <BookPage side="left" label={labels[0]}>
        {left}
      </BookPage>
      <BookPage side="right" label={labels[1]}>
        {right}
      </BookPage>
    </div>
  );
}
