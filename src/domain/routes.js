/**
 * Rotas do app guardadas no "hash" da URL (a parte depois do #).
 * Mudar o hash não recarrega a página, mas cria uma entrada no histórico do
 * navegador: assim o botão Voltar funciona e cada página tem um endereço
 * próprio, que pode ser copiado e compartilhado.
 *
 *   #/fichario                        → { tab: 'fichario' }
 *   #/favoritos                       → { tab: 'favoritos' }
 *   #/times                           → { tab: 'times' }
 *   #/times/gon                       → { tab: 'times', teamId: 'gon' }
 *   #/times/gon/killua-zoldyck        → { tab: 'times', teamId: 'gon', playerId: 'killua-zoldyck' }
 *
 * O integrante fica "dentro" do time na URL: assim a página dele sabe para
 * qual time o link "voltar" deve levar.
 */

export const TABS = Object.freeze(['fichario', 'favoritos', 'times']);
const DEFAULT_ROUTE = Object.freeze({ tab: 'fichario', teamId: null, playerId: null });

/** Lê o hash e devolve a rota. Endereço desconhecido cai no fichário. */
export function parseHash(hash) {
  const [tab, teamId, playerId] = String(hash ?? '')
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)
    .map((part) => {
      try {
        return decodeURIComponent(part);
      } catch {
        return part; // "%E0" sozinho quebra o decode: usa o texto como veio
      }
    });

  if (!TABS.includes(tab)) return DEFAULT_ROUTE;
  if (tab !== 'times') return { ...DEFAULT_ROUTE, tab };
  return { tab, teamId: teamId ?? null, playerId: teamId ? (playerId ?? null) : null };
}

/** O caminho inverso: rota → "#/times/gon". */
export function buildHash({ tab = 'fichario', teamId = null, playerId = null } = {}) {
  const parts = [tab];
  if (tab === 'times' && teamId) {
    parts.push(encodeURIComponent(teamId));
    if (playerId) parts.push(encodeURIComponent(playerId));
  }
  return `#/${parts.join('/')}`;
}
