import { useMemo } from 'react';
import CardGrid from './CardGrid.jsx';
import { usePagination } from '../../hooks/usePagination.js';
import '../../css/PocketPage.css';

/**
 * Uma página de bolsos do fichário, com paginação (20 bolsos por página).
 *
 * A folha de bolsos recebe `key={página}`: quando a página muda, o React
 * DESMONTA a folha antiga e monta uma nova, e a animação CSS de "virar a
 * página" começa do zero. É o jeito React de reiniciar uma animação.
 *
 * Props: cards, resetKey (muda → volta à página 1), favoriteIds, onOpen, label, pageSize
 */
export default function PocketPage({ cards, resetKey, favoriteIds, onOpen, label, pageSize = 20 }) {
  const pager = usePagination(cards, pageSize, resetKey);
  const allIds = useMemo(() => cards.map((card) => card.id), [cards]);
  const turn = pager.direction > 0 ? 'next' : pager.direction < 0 ? 'previous' : 'none';

  return (
    <div className="pocket-page">
      <div key={pager.page} className={`pocket-page__sheet pocket-page__sheet--${turn}`}>
        {/* listIds: o "anterior/próximo" do detalhe percorre a lista inteira, não só esta página */}
        <CardGrid cards={pager.items} listIds={allIds} favoriteIds={favoriteIds} onOpen={onOpen} label={label} />
      </div>

      {pager.pageCount > 1 && (
        <nav className="pocket-page__pager" aria-label="Páginas de bolsos">
          <button type="button" onClick={pager.previous} disabled={!pager.hasPrevious}>
            ← Página anterior
          </button>
          <span className="pocket-page__count" aria-live="polite">
            Página {pager.page + 1} de {pager.pageCount}
          </span>
          <button type="button" onClick={pager.next} disabled={!pager.hasNext}>
            Próxima página →
          </button>
        </nav>
      )}
    </div>
  );
}
