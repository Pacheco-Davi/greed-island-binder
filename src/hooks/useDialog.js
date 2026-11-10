import { useEffect } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Elementos focáveis dentro do container, ignorando os que estão dentro de algo `inert`. */
function focusableIn(container) {
  return [...container.querySelectorAll(FOCUSABLE)].filter((element) => !element.closest('[inert]'));
}

/**
 * Comportamentos de um diálogo modal, enquanto o componente estiver na tela:
 * - Esc fecha, ouvido no `document` (funciona mesmo se o foco estiver "solto");
 * - armadilha de foco: Tab no último elemento volta ao primeiro, e Shift+Tab no
 *   primeiro vai ao último. O `inert` no fundo impede o foco de cair atrás do
 *   modal, mas sem a armadilha ele ainda "escaparia" para fora do documento;
 * - a página de trás não rola. Ao esconder a barra de rolagem, o conteúdo
 *   "pularia" para a direita; um padding-right do tamanho exato da barra evita isso.
 *
 * @param ref      ref do elemento do diálogo
 * @param onClose  função estável (useCallback) para fechar
 */
export function useDialog(ref, onClose) {
  useEffect(() => {
    function handleKeyDown(event) {
      const dialog = ref.current;
      if (!dialog) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;
      const items = focusableIn(dialog);
      if (items.length === 0) return;
      const first = items[0];
      const last = items.at(-1);
      const outside = !dialog.contains(document.activeElement);

      if (event.shiftKey && (document.activeElement === first || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    }

    const { overflow, paddingRight } = document.body.style;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [ref, onClose]);
}
