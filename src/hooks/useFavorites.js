import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'gi:favorites';

/**
 * Lê os favoritos salvos. Tudo dentro de try/catch porque o localStorage pode
 * falhar: navegação anônima em alguns navegadores, armazenamento bloqueado,
 * ou um JSON corrompido salvo antes. Em qualquer erro, começa com zero favoritos.
 */
function readFavorites(isValidId) {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => typeof id === 'string' && isValidId(id)));
  } catch {
    return new Set();
  }
}

const ACCEPT_ALL = () => true;

/**
 * Favoritos guardados como um Set de ids e salvos no localStorage (`gi:favorites`).
 *
 * @param isValidId  descarta ids que não existem mais no catálogo. Passe uma
 *                   função ESTÁVEL (definida fora do componente): ela é
 *                   dependência do efeito, e uma função nova a cada render
 *                   reconectaria o ouvinte toda hora.
 */
export function useFavorites(isValidId = ACCEPT_ALL) {
  const [favoriteIds, setFavoriteIds] = useState(() => readFavorites(isValidId));

  // Efeito 1: sempre que os favoritos mudam, salva. O useEffect é o lugar de
  // "sincronizar o React com algo de fora" (aqui, o localStorage).
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...favoriteIds]));
    } catch {
      // Armazenamento cheio ou bloqueado: o app segue funcionando, só não salva.
    }
  }, [favoriteIds]);

  // Efeito 2: se outra aba do navegador mudar os favoritos, esta aba acompanha.
  // (O evento "storage" só chega nas OUTRAS abas, nunca na que salvou.)
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY) setFavoriteIds(readFavorites(isValidId));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [isValidId]);

  const toggleFavorite = useCallback((id) => {
    setFavoriteIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return { favoriteIds, toggleFavorite };
}
