/**
 * Imagens das cartas: vêm de uma pasta do código (src/assets/cards), como o
 * professor pede. Cada arquivo tem o id da carta como nome: 000.webp, -001.webp…
 *
 * import.meta.glob é um recurso do Vite (não existe no JavaScript puro):
 * no build, o Vite encontra todos os arquivos que batem com o padrão,
 * copia cada um para a pasta final com um nome único (hash, para cache) e
 * devolve um objeto { caminho: URL }. Com `eager: true` isso acontece já na
 * importação; com `import: 'default'` recebemos direto a URL (string).
 * Importante: só as URLs entram no JavaScript, não os bytes das imagens.
 */
import placeholder from '../assets/ui/sem-imagem.svg';

const files = import.meta.glob('../assets/cards/*.{webp,png,jpg}', { eager: true, import: 'default' });

/** "../assets/cards/-001.webp" → "-001" */
const idFromPath = (path) => path.slice(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));

const imagesById = new Map(Object.entries(files).map(([path, url]) => [idFromPath(path), url]));

/** Imagem genérica para quando a carta não tem arte (ou a arte não carrega). */
export const PLACEHOLDER_IMAGE = placeholder;

/** URL da arte da carta, ou null se não existir arquivo para esse id. */
export function getCardImage(id) {
  return imagesById.get(id) ?? null;
}
