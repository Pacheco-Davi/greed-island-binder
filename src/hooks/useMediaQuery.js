import { useCallback, useSyncExternalStore } from 'react';

/**
 * true/false para uma media query do CSS, atualizado ao vivo.
 *   useMediaQuery('(prefers-reduced-motion: reduce)')
 *   useMediaQuery('(prefers-color-scheme: dark)')
 *
 * useSyncExternalStore é o hook do React feito para "assinar" uma fonte de
 * dados que vive FORA do React (aqui, o matchMedia do navegador). Recebe:
 *   subscribe   → como ouvir as mudanças (e como parar de ouvir)
 *   getSnapshot → como ler o valor atual
 * O React chama os dois na hora certa; não precisamos de useState + useEffect.
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const media = window.matchMedia?.(query);
      if (!media) return () => {};
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    [query],
  );

  const getSnapshot = () => window.matchMedia?.(query).matches ?? false;

  return useSyncExternalStore(subscribe, getSnapshot);
}
