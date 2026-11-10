import { useState } from 'react';
import BookSpread from '../book/BookSpread.jsx';
import PocketPage from '../cards/PocketPage.jsx';
import CollectionProgress from '../cards/CollectionProgress.jsx';
import EmptyState from '../feedback/EmptyState.jsx';
import { CATEGORIES } from '../../domain/catalog.js';
import { plural } from '../../domain/format.js';

/**
 * Aba "Favoritos": à esquerda o progresso da coleção, à direita os bolsos.
 * Props: cards (favoritas, já ordenadas), favoriteIds, onOpenCard, onGoToBinder, collection
 */
export default function FavoritesView({ cards, favoriteIds, onOpenCard, onGoToBinder, collection }) {
  const [mobilePage, setMobilePage] = useState('right');

  const left = (
    <>
      <header className="book-page__header">
        <p className="book-page__eyebrow">Favoritos</p>
        <h2 className="book-page__title">Coleção</h2>
      </header>
      <CollectionProgress categories={CATEGORIES} counts={collection.counts} totals={collection.totals} />
    </>
  );

  const right = (
    <>
      <header className="book-page__header">
        <p className="book-page__eyebrow">Favoritos</p>
        <h2 className="book-page__title">Suas cartas</h2>
        <p className="book-page__subtitle" aria-live="polite">
          {plural(cards.length, 'carta favorita', 'cartas favoritas')}
        </p>
      </header>
      {cards.length > 0 ? (
        <PocketPage cards={cards} resetKey="favoritos" favoriteIds={favoriteIds} onOpen={onOpenCard} label="Cartas favoritas" />
      ) : (
        <EmptyState
          title="Nenhuma carta favorita ainda"
          message="Abra uma carta no fichário e toque em “Favoritar” para guardá-la aqui."
          action={{ label: 'Ir para o fichário', onClick: onGoToBinder }}
        />
      )}
    </>
  );

  return <BookSpread left={left} right={right} labels={['Coleção', 'Cartas']} mobilePage={mobilePage} onMobilePageChange={setMobilePage} />;
}
