import '../../css/BookPage.css';

/**
 * Uma página de papel. `side` decide de que lado fica a sombra da calha
 * (o vinco no meio do livro) e a pilha de folhas na borda de fora.
 * Props: side ('left' | 'right'), label (nome da página para leitores de tela), children
 */
export default function BookPage({ side, label, children }) {
  return (
    <div className={`book-page book-page--${side} paper`} role="region" aria-label={label}>
      {children}
    </div>
  );
}
