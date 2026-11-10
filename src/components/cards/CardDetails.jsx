import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CardImage from './CardImage.jsx';
import CardBack from './CardBack.jsx';
import { formatNumber } from '../../domain/format.js';
import { useDialog } from '../../hooks/useDialog.js';
import '../../css/CardDetails.css';

/**
 * A carta ampliada, num MODAL acessível:
 * - createPortal: o modal é desenhado direto no <body>, fora do app. Assim o
 *   App pode marcar todo o resto com `inert` (nada atrás do modal recebe foco
 *   ou é lido pelo leitor de tela) sem atingir o próprio modal.
 * - role="dialog" + aria-modal="true" + aria-labelledby: o leitor de tela
 *   anuncia "diálogo, #000 Ruler's Blessing".
 * - A carta VIRA: frente = arte, verso = atributos. A face escondida também
 *   fica `inert`, para o Tab não cair em links invisíveis.
 * - Teclado: Esc fecha e o Tab fica preso no modal (useDialog); ←/→ navegam.
 *   O botão "Virar" fica sempre no mesmo lugar, então o foco não se perde
 *   quando a carta gira.
 *
 * Props:
 *   card, rarity, spellClasses, teams, maxLimit, placeholder
 *   isFavorite, onToggleFavorite, onClose, onShowCategory
 *   navigation: { position, total, hasPrevious, hasNext, onPrevious, onNext, onRandom }
 */
export default function CardDetails({ card, rarity, spellClasses, teams, maxLimit, placeholder, isFavorite, onToggleFavorite, onClose, onShowCategory, navigation }) {
  const [flipped, setFlipped] = useState(false);
  const dialogRef = useRef(null);
  const number = formatNumber(card);
  const { position, total, hasPrevious, hasNext, onPrevious, onNext, onRandom } = navigation;

  useDialog(dialogRef, onClose); // Esc, armadilha de foco e trava de rolagem

  function handleKeyDown(event) {
    if (event.key === 'ArrowLeft' && hasPrevious) onPrevious();
    else if (event.key === 'ArrowRight' && hasNext) onNext();
  }

  return createPortal(
    // Clique no fundo escuro (e só nele: target === currentTarget) fecha.
    <div className="card-modal" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} className="card-modal__dialog paper" role="dialog" aria-modal="true" aria-labelledby="card-modal-title" onKeyDown={handleKeyDown}>
        <div className="card-modal__toolbar">
          <div className="card-modal__nav" role="group" aria-label="Navegar entre as cartas da lista">
            <button type="button" onClick={onPrevious} disabled={!hasPrevious}>
              ← Anterior
            </button>
            <span className="card-details__position" aria-live="polite">
              {position} de {total}
            </span>
            <button type="button" onClick={onNext} disabled={!hasNext}>
              Próxima →
            </button>
          </div>
          <button type="button" onClick={onRandom} disabled={total < 2}>
            <span aria-hidden="true">🎲</span> Sortear outra
          </button>
          <button type="button" className="card-modal__close" onClick={onClose}>
            Fechar <span aria-hidden="true">✕</span>
          </button>
        </div>

        <h2 id="card-modal-title" className="card-modal__title">
          <span className="card-modal__number">{number}</span> {card.name}
        </h2>

        <div className={flipped ? 'flip-card flip-card--flipped' : 'flip-card'}>
          <div className="flip-card__inner">
            {/* Frente: clicar na arte também vira (atalho de mouse; no teclado, o botão "Virar"). */}
            <div className="flip-card__face flip-card__face--front" inert={flipped} onClick={() => setFlipped(true)}>
              <CardImage key={card.id} card={card} placeholder={placeholder} className="flip-card__image" alt={`Arte da carta ${card.name} (${number})`} />
            </div>
            <div className="flip-card__face flip-card__face--back" inert={!flipped}>
              <CardBack card={card} rarity={rarity} spellClasses={spellClasses} teams={teams} maxLimit={maxLimit} onOpenTeam={onClose} />
            </div>
          </div>
        </div>

        <p className="visually-hidden" aria-live="polite">
          {flipped ? 'Mostrando o verso da carta, com os atributos.' : 'Mostrando a frente da carta.'}
        </p>

        <div className="card-modal__actions">
          <button type="button" className="card-modal__flip" onClick={() => setFlipped((value) => !value)} autoFocus>
            <span aria-hidden="true">↻</span> {flipped ? 'Virar: ver a frente' : 'Virar: ver o verso'}
          </button>
          <button type="button" className="card-modal__favorite" aria-pressed={isFavorite} onClick={() => onToggleFavorite(card.id)}>
            {isFavorite ? '★ Favorita' : '☆ Favoritar'}
          </button>
          <button type="button" className="link-button" onClick={() => onShowCategory(card.category)}>
            Ver todas as cartas de {card.categoryInfo.label}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
