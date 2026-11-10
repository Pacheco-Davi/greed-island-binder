import { memo, useState } from 'react';
import RankBadge from './RankBadge.jsx';
import { formatNumber } from '../../domain/format.js';
import '../../css/CardSlot.css';

/**
 * Um bolso do fichário com uma carta. É um <button>: clicável com mouse,
 * Enter ou Espaço, e anunciado como botão pelo leitor de tela.
 *
 * Props:
 *   card        carta normalizada
 *   onOpen      (id) => void
 *   isFavorite  mostra a estrela
 *   note        texto extra embaixo (ex.: "Usou · cap. 160" na página do time)
 */
function CardSlot({ card, onOpen, isFavorite = false, note }) {
  const number = formatNumber(card);
  const [imageFailed, setImageFailed] = useState(false); // arquivo não carregou → bolso vazio

  return (
    <button
      type="button"
      className="card-slot"
      data-card-id={card.id}
      style={{ '--category-color': card.categoryInfo.color }}
      onClick={() => onOpen(card.id)}
    >
      <span className="card-slot__pocket">
        {card.image && !imageFailed ? (
          // alt vazio: o nome da carta já está escrito no botão; repetir no alt
          // faria o leitor de tela falar o nome duas vezes.
          <img className="card-slot__image" src={card.image} alt="" loading="lazy" decoding="async" onError={() => setImageFailed(true)} />
        ) : (
          <span className="card-slot__empty" aria-hidden="true">
            {number}
          </span>
        )}
      </span>
      <span className="card-slot__meta">
        <span className="card-slot__number">{number}</span>
        <RankBadge rank={card.rank} />
      </span>
      <span className="card-slot__name">{card.name}</span>
      {isFavorite && (
        <span className="card-slot__favorite">
          <span aria-hidden="true">★</span>
          <span className="visually-hidden">(favorita)</span>
        </span>
      )}
      {note && <span className="card-slot__note">{note}</span>}
    </button>
  );
}

/**
 * React.memo: o bolso só re-renderiza se alguma prop mudar (comparação rasa).
 * Funciona porque as props são estáveis: a carta é um objeto congelado do
 * catálogo, `onOpen` vem de um useCallback e `isFavorite`/`note` são valores
 * simples. Favoritar uma carta redesenha 1 bolso, não os 20 da página.
 */
export default memo(CardSlot);
