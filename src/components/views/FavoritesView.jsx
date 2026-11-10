import CardGrid from '../cards/CardGrid.jsx';
import EmptyState from '../feedback/EmptyState.jsx';
import { plural } from '../../domain/format.js';

/** Aba "Favoritos". Props: cards (favoritas, já ordenadas), favoriteIds, onOpenCard, onGoToBinder */
export default function FavoritesView({ cards, favoriteIds, onOpenCard, onGoToBinder }) {
  if (cards.length === 0) {
    return (
      <EmptyState
        title="Nenhuma carta favorita ainda"
        message="Abra uma carta no fichário e toque em “Favoritar” para guardá-la aqui."
        action={{ label: 'Ir para o fichário', onClick: onGoToBinder }}
      />
    );
  }

  return (
    <div className="favorites-view">
      <p aria-live="polite">{plural(cards.length, 'carta favorita', 'cartas favoritas')}</p>
      <CardGrid cards={cards} favoriteIds={favoriteIds} onOpen={onOpenCard} label="Cartas favoritas" />
    </div>
  );
}
