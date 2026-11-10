import '../../css/Emblem.css';

/**
 * Emblema da capa: alvo concêntrico com quatro setas sobre um painel verde
 * "facetado" (low poly), recriado em SVG a partir das referências.
 * As cores vêm dos tokens via CSS (fill: var(--panel)…), então mudam com o tema.
 * Props: framed (moldura rosa), className
 */
export default function Emblem({ framed = true, className = '' }) {
  return (
    <svg className={`emblem ${className}`} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      {/* painel facetado */}
      <polygon className="emblem__facet emblem__facet--hi" points="0,0 200,0 100,100" />
      <polygon className="emblem__facet emblem__facet--mid" points="200,0 200,200 100,100" />
      <polygon className="emblem__facet emblem__facet--lo" points="200,200 0,200 100,100" />
      <polygon className="emblem__facet emblem__facet--mid" points="0,200 0,0 100,100" />
      <polygon className="emblem__facet emblem__facet--hi" points="0,0 80,0 0,70" />
      <polygon className="emblem__facet emblem__facet--lo" points="200,130 200,200 125,200" />
      <polygon className="emblem__facet emblem__facet--hi" points="200,0 200,60 150,0" />
      <polygon className="emblem__facet emblem__facet--lo" points="0,140 0,200 60,200" />
      {/* quatro setas apontando para fora */}
      <polygon className="emblem__arrow" points="100,10 86,32 114,32" />
      <polygon className="emblem__arrow" points="190,100 168,86 168,114" />
      <polygon className="emblem__arrow" points="100,190 86,168 114,168" />
      <polygon className="emblem__arrow" points="10,100 32,86 32,114" />
      {/* alvo concêntrico */}
      <circle className="emblem__ring emblem__ring--dark" cx="100" cy="100" r="62" />
      <circle className="emblem__ring emblem__ring--light" cx="100" cy="100" r="56" />
      <circle className="emblem__ring emblem__ring--green" cx="100" cy="100" r="42" />
      <circle className="emblem__ring emblem__ring--light" cx="100" cy="100" r="31" />
      <circle className="emblem__ring emblem__ring--dark" cx="100" cy="100" r="20" />
      {framed && <rect className="emblem__frame" x="2" y="2" width="196" height="196" />}
    </svg>
  );
}
