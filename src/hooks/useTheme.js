import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'gi:theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function readStoredTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    return null;
  }
}

/** Tema do sistema operacional, atualizado ao vivo se a pessoa trocar lá. */
function useSystemTheme() {
  const [isDark, setIsDark] = useState(() => window.matchMedia?.(DARK_QUERY).matches ?? false);

  useEffect(() => {
    const media = window.matchMedia?.(DARK_QUERY);
    if (!media) return undefined;
    const handleChange = (event) => setIsDark(event.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  return isDark ? 'dark' : 'light';
}

/**
 * Tema claro ou noturno.
 * - Primeira visita: segue o sistema (prefers-color-scheme).
 * - Depois que a pessoa escolhe no botão, a escolha é salva em `gi:theme` e passa a valer.
 *
 * Repare que `theme` não é um useState: ele é DERIVADO de duas fontes
 * (escolha salva ?? tema do sistema). Guardar só o que é escolha evita que a
 * preferência do sistema fique "congelada" no primeiro acesso.
 */
export function useTheme() {
  const [storedTheme, setStoredTheme] = useState(readStoredTheme);
  const systemTheme = useSystemTheme();
  const theme = storedTheme ?? systemTheme;

  // Aplica no <html data-theme="dark">, onde o CSS lê as variáveis de cor.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!storedTheme) return;
    try {
      localStorage.setItem(STORAGE_KEY, storedTheme);
    } catch {
      // Sem armazenamento: o tema vale só até fechar a página.
    }
  }, [storedTheme]);

  const toggleTheme = useCallback(() => setStoredTheme(theme === 'dark' ? 'light' : 'dark'), [theme]);

  return { theme, toggleTheme };
}
