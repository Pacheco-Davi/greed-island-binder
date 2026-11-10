import { useRef } from 'react';
import '../../css/Tabs.css';

/**
 * Abas acessíveis (padrão "tabs" do WAI-ARIA):
 * - só a aba selecionada entra no Tab do teclado (tabIndex 0; as outras -1);
 * - setas ←/→ trocam de aba, Home vai para a primeira e End para a última.
 *
 * Props:
 *   tabs      [{ id, label, count? }]
 *   selected  id da aba ativa
 *   onChange  (id) => void
 *   label     nome do grupo de abas, lido pelo leitor de tela
 */
export default function Tabs({ tabs, selected, onChange, label }) {
  // useRef guarda os botões entre renders sem causar novo render: é por ele
  // que conseguimos mover o foco do teclado para a aba nova.
  const buttonsRef = useRef([]);

  function handleKeyDown(event, index) {
    const last = tabs.length - 1;
    const next = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;

    event.preventDefault(); // Home/End rolariam a página
    onChange(tabs[next].id);
    buttonsRef.current[next]?.focus();
  }

  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((tab, index) => {
        const isSelected = tab.id === selected;
        return (
          <button
            key={tab.id}
            ref={(element) => (buttonsRef.current[index] = element)}
            type="button"
            role="tab"
            id={`aba-${tab.id}`}
            aria-selected={isSelected}
            aria-controls={`painel-${tab.id}`}
            tabIndex={isSelected ? 0 : -1}
            className="tabs__tab"
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {tab.label}
            {tab.count !== undefined && <span className="tabs__count">{tab.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
