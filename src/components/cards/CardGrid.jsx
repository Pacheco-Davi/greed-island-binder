import { useCallback, useMemo } from 'react';
import CardSlot from './CardSlot.jsx';
import '../../css/CardGrid.css';

/**
 * Grade de cartas. O map() transforma cada carta num <li>; a `key` diz ao
 * React qual item é qual entre um render e outro. Ela precisa ser estável e
 * única: o id da carta serve, o índice do array não (ao filtrar, o índice 0
 * passaria a ser outra carta e o React reaproveitaria o elemento errado).
 *
 * Props: cards, onOpen ((id, ids) => void), favoriteIds (Set), notes (Map id → texto), label,
 *        listIds (opcional: a lista completa para navegar, quando a grade mostra só uma página)
 *
 * Ao abrir uma carta, a grade manda junto a lista de ids que está na tela:
 * é ela que o "anterior/próximo" do detalhe vai percorrer.
 */
export default function CardGrid({ cards, onOpen, favoriteIds, notes, label, listIds }) {
  const ownIds = useMemo(() => cards.map((card) => card.id), [cards]);
  const ids = listIds ?? ownIds;
  const handleOpen = useCallback((id) => onOpen(id, ids), [onOpen, ids]);

  return (
    <ul className="card-grid" aria-label={label}>
      {cards.map((card) => (
        <li key={card.id} className="card-grid__item">
          <CardSlot card={card} onOpen={handleOpen} isFavorite={favoriteIds?.has(card.id)} note={notes?.get(card.id)} />
        </li>
      ))}
    </ul>
  );
}
