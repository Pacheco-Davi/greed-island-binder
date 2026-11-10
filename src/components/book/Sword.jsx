import '../../css/Sword.css';

/** Espada ornamental (vertical, cabo em cima), como as que ladeiam o painel da capa. */
export default function Sword({ className = '' }) {
  return (
    <svg className={`sword ${className}`} viewBox="0 0 24 200" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
      <circle className="sword__pommel" cx="12" cy="6" r="5" />
      <rect className="sword__grip" x="9" y="10" width="6" height="22" rx="1" />
      <rect className="sword__guard" x="1" y="32" width="22" height="6" rx="3" />
      <polygon className="sword__blade" points="8,38 16,38 16,178 12,196 8,178" />
      <line className="sword__fuller" x1="12" y1="44" x2="12" y2="174" />
    </svg>
  );
}
