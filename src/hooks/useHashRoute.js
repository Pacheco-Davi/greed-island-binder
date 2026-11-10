import { useCallback, useEffect, useState } from 'react';
import { buildHash, parseHash } from '../domain/routes.js';

const sameRoute = (a, b) => a.tab === b.tab && a.teamId === b.teamId && a.playerId === b.playerId;

/**
 * A rota atual vem da URL (window.location.hash). A URL é a "fonte da verdade":
 * links (<a href="#/times/gon">) e os botões Voltar/Avançar mudam o hash, o
 * navegador dispara o evento `hashchange` e o estado do React acompanha.
 *
 * Uso:  const [route, navigate] = useHashRoute();
 *       navigate({ tab: 'times', teamId: 'gon' });
 */
export function useHashRoute() {
  // Função no useState = "inicialização preguiçosa": roda só no primeiro render.
  const [route, setRoute] = useState(() => parseHash(window.location.hash));

  useEffect(() => {
    const handleChange = () => {
      const next = parseHash(window.location.hash);
      // Devolver o MESMO objeto quando nada mudou faz o React pular o re-render.
      setRoute((current) => (sameRoute(current, next) ? current : next));
    };
    window.addEventListener('hashchange', handleChange);
    // A função devolvida é a "limpeza": roda quando o componente sai da tela.
    // Sem ela, cada montagem deixaria um ouvinte a mais pendurado no window.
    return () => window.removeEventListener('hashchange', handleChange);
  }, []); // [] = conecta uma vez só, na montagem

  // useCallback mantém a MESMA função entre renders; assim, quem a recebe por
  // props (ou a usa como dependência de um efeito) não acha que ela mudou.
  const navigate = useCallback((target) => {
    const hash = buildHash(target);
    if (window.location.hash !== hash) window.location.hash = hash;
    // O `hashchange` só chega depois (é assíncrono). Atualizar o estado já
    // aqui deixa a tela e o aria-selected das abas corretos no mesmo clique.
    const next = parseHash(hash);
    setRoute((current) => (sameRoute(current, next) ? current : next));
  }, []);

  return [route, navigate];
}
