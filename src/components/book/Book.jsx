import '../../css/Book.css';

/**
 * O livro ABERTO: capas de couro por baixo (as "bordas" que aparecem em volta
 * das páginas), cantoneiras de metal e as abas de seção no alto.
 * Props: tabs (elemento <Tabs>), children (o conteúdo: um BookSpread), ref
 */
export default function Book({ tabs, children, ref }) {
  return (
    <section ref={ref} className="book leather" aria-label="Fichário aberto">
      <span className="book__corner book__corner--tl" aria-hidden="true" />
      <span className="book__corner book__corner--tr" aria-hidden="true" />
      <span className="book__corner book__corner--bl" aria-hidden="true" />
      <span className="book__corner book__corner--br" aria-hidden="true" />
      <div className="book__tabs">{tabs}</div>
      {children}
    </section>
  );
}
