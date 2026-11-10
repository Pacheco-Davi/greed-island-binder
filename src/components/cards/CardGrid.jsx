import CardSlot from './CardSlot.jsx';
import '../../css/CardGrid.css';

/**
 * Grade de cartas. O map() transforma cada carta num <li>; a `key` diz ao
 * React qual item é qual entre um render e outro. Ela precisa ser estável e
 * única: o id da carta serve, o índice do array não (ao filtrar, o índice 0
 * passaria a ser outra carta e o React reaproveitaria o elemento errado).
 *
 * Props: cards, onOpen, favoriteIds (Set), notes (Map id → texto), label
 */
export default function CardGrid({ cards, onOpen, favoriteIds, notes, label }) {
  return (
    <ul className="card-grid" aria-label={label}>
      {cards.map((card) => (
        <li key={card.id} className="card-grid__item">
          <CardSlot card={card} onOpen={onOpen} isFavorite={favoriteIds?.has(card.id)} note={notes?.get(card.id)} />
        </li>
      ))}
    </ul>
  );
}
