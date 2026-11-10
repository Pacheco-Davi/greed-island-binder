import { useState } from 'react';

/**
 * Arte da carta com plano B: se o arquivo não carregar (onError), troca pela
 * imagem reserva. Quem usa deve passar `key={card.id}`: assim, ao trocar de
 * carta, o componente é recriado e o "falhou" volta a ser false.
 * Props: card, placeholder, alt, className
 */
export default function CardImage({ card, placeholder, alt, className }) {
  const [failed, setFailed] = useState(false);
  const src = card.image && !failed ? card.image : placeholder;
  return <img className={className} src={src} alt={alt} onError={() => setFailed(true)} />;
}
