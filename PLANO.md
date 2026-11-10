# Plano — Fichário de Greed Island (Atividade 03, React + Vite)

> Adaptação da Atividade 03 (Pokédex) para as cartas do arco Greed Island de Hunter x Hunter.
> Tema validado pelo professor em sala. Regra que continua valendo: **imagens vêm de uma pasta do código e as informações vêm de um JSON.**
> Este arquivo fica na raiz do repositório e é seguido etapa por etapa.

---

## 0. Como trabalhar com este plano

- Executar **uma etapa por vez**. No fim de cada etapa: rodar `npm run dev` e `npm run build`, conferir os critérios de aceite, fazer commit e **parar para revisão**.
- Ao terminar cada etapa, explicar em português o que foi feito, quais conceitos de React aparecem ali e por que cada decisão foi tomada (o Davi quer aprender, não só receber o código).
- Nomes de componentes em inglês (como no enunciado) e textos da interface em português.

---

## 1. Tradução do enunciado (Pokédex → Greed Island)

| Enunciado (Pokédex) | Nesta versão | Observação |
|---|---|---|
| Pokémon | **Carta** | 165 cartas: 100 de slot designado, 21 de slot livre, 40 de feitiço e 4 de Game Master |
| Número/ID | **Número da carta** | É string: `"000"`, `"1001"`, `"21449"`, `"-001"`. Duas cartas livres não têm número |
| Nome | Nome da carta | |
| Tipo(s) | **Categoria** (+ **classe**, nas cartas de feitiço) | O filtro por tipo vira filtro por categoria e por rank |
| Atributos (HP, Ataque…) | **Rank** (SS → H) e **limite de conversão** | Exibidos como medidores, no lugar das barras de status |
| Detalhes | Carta ampliada que **vira** (frente = arte, verso = dados) | |
| Treinadores + insígnias | **Times**: página do time (resumo, integrantes, slots designados) e página resumida de cada integrante (só o arco Greed Island + cartas) | Dados da Hunter x Hunter Wiki em `teams.json` e `players.json`; cada carta atribuída traz o trecho e o capítulo como fonte |
| (novo) | **Filtro "cartas do time"** no fichário | Mostra só as cartas que o time escolhido teve |
| Busca por nome/ID | Busca por nome ou número | |
| Favoritos (opcional) | Favoritos em `localStorage` | |
| Aleatório (opcional) | "Sortear carta" | |
| Ordenação (opcional) | Por número, nome, rank e limite | |
| Dark mode (opcional) | Modo noturno (iluminação da mesa) | |

Requisitos de React que precisam aparecer de forma explícita: componentes funcionais, props, `useState`, `useEffect`, `map()`, eventos, filtragem, estado derivado (`useMemo`), hooks customizados e componentes reutilizáveis.

---

## 2. Estrutura de pastas

```text
greed-island-binder/
├── public/
├── scripts/
│   └── csv-to-json.mjs          # converte o CSV em JSON (roda uma vez ou quando o CSV mudar)
├── docs/
│   └── referencias/             # imagens de referência de clima (paleta, material, proporção)
├── src/
│   ├── assets/
│   │   ├── cards/               # 000.webp, 001.webp, 1001.webp, -000.webp …
│   │   └── ui/                  # sem-imagem.svg, verso padrão da carta, texturas
│   ├── components/
│   │   ├── book/                # Book, BookCover, BookSpine, BookSpread, BookPage, PageSwitch, Emblem, Sword
│   │   ├── cards/               # CardSlot, CardGrid, PocketPage, CardDetails, RankBadge, CategoryBadge, CollectionProgress, LimitMeter
│   │   ├── controls/            # Tabs, SearchBar, FilterChips (base de CategoryFilter e RankFilter), TeamFilter, SortControl
│   │   ├── teams/               # TeamList, TeamCard, TeamPage, MemberPage
│   │   ├── feedback/            # EmptyState, Icon
│   │   └── views/               # BinderView, FavoritesView, TeamsView (leem o catálogo e montam cada aba)
│   ├── css/                     # um .css por componente (sugestão do enunciado)
│   ├── data/
│   │   ├── greed-island-cards.json
│   │   ├── teams.json
│   │   └── players.json
│   ├── domain/
│   │   ├── cards.js             # normalização, busca, filtro, ordenação, ranks (+ cards.test.js)
│   │   ├── teams.js             # integrantes, cartas do time e suas fontes (+ teams.test.js)
│   │   ├── images.js            # mapa id → URL da imagem (import.meta.glob)
│   │   ├── catalog.js           # único lugar que lê os JSON; entrega tudo normalizado
│   │   ├── color.js             # contraste WCAG: contrastRatio, inkFor (+ color.test.js)
│   │   ├── palette.js           # cores dos ranks (SS/S metálicos) e estilos por categoria
│   │   ├── format.js            # textos formatados: número, limite, raridade, fonte (+ format.test.js)
│   │   ├── routes.js            # parseHash/buildHash das URLs #/times/gon (+ routes.test.js)
│   │   ├── book.js              # máquina de estados do livro (reducer puro) (+ book.test.js)
│   │   └── pagination.js        # paginate(itens, página, tamanho)
│   ├── hooks/                   # useCardFilters, useFavorites, useTheme, useHashRoute, useCardDetail, useBookState, usePagination, useMediaQuery
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css                # tokens de design (variáveis CSS)
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 3. Etapas

### Etapa 0 — Preparação (manual, feita pelo Davi)

1. Criar o repositório no GitHub e rodar `npm create vite@latest greed-island-binder -- --template react`.
2. Copiar as imagens das cartas para `src/assets/cards/`. **Padrão de nome:** o número da carta (`000.webp`, `1001.webp`, `-002.webp`). Preferir `.webp` com cerca de 400px de largura, para o projeto não ficar pesado.
3. Colocar o CSV em `scripts/greed-island-cards.csv`.
4. Colocar 2 ou 3 imagens de referência em `docs/referencias/`.
5. Copiar este `PLANO.md` para a raiz do repositório.

**Aceite:** `npm run dev` abre o template padrão do Vite.

---

### Etapa 1 — Dados: CSV → JSON

Criar `scripts/csv-to-json.mjs` (Node puro, sem dependência) que lê o CSV e gera `src/data/greed-island-cards.json`. Antes de escrever o script, **ler o cabeçalho do CSV** e adaptar o mapeamento às colunas reais.

Formato de saída esperado:

```json
{
  "categories": [
    { "id": "specified", "label": "Slot designado", "range": "000–099", "color": "#c62828" },
    { "id": "free",      "label": "Slot livre",     "range": "100+",    "color": "#e0b020" },
    { "id": "spell",     "label": "Feitiço",        "range": "1001–1040","color": "#1e5bb8" },
    { "id": "gm",        "label": "Game Master",    "range": "-000 a -003","color": "#151515" }
  ],
  "ranks": ["SS", "S", "A", "B", "C", "D", "E", "F", "G", "H"],
  "cards": [
    {
      "id": "000",
      "number": "000",
      "name": "Ruler's Blessing",
      "category": "specified",
      "rank": "SS",
      "limit": 1,
      "spellClass": null,
      "description": "…"
    }
  ]
}
```

Regras de parsing (casos difíceis, explicar cada um ao Davi):

- `number` é **string**, para não perder zeros à esquerda nem o sinal de `-`.
- O rank e o limite vêm juntos (`"A-17"`). Separar em `rank: "A"` e `limit: 17`.
- Limite `∞` vira `limit: null` com `unlimited: true`. Limite `?` vira `limit: null` com `unknown: true`.
- Cartas de Game Master não têm rank nem limite: `rank: null`.
- Cartas sem número recebem `id` gerado (`"free-sem-numero-1"`) e `number: null`.
- Categoria deduzida pela faixa do número quando o CSV não trouxer a coluna.

Criar também os dados dos **Times** (decisão do Davi: a aba Jogadores virou Times), pesquisados na Hunter x Hunter Wiki. **Não inventar dados de personagens:** cada carta atribuída a um time ou jogador guarda o trecho da wiki e o capítulo que provam a informação; o que a wiki não diz fica `null`.

- `src/data/teams.json`: times (equipes pequenas) e alianças, com resumo do arco, objetivo, desfecho, integrantes, maior contagem de slots designados conhecida (com o momento) e cartas do grupo.
- `src/data/players.json`: os integrantes dos times e alianças (jogadores sem time ficam de fora), com times, função, resumo só do arco Greed Island, Nen relevante, desfecho e cartas.

```json
{ "teams": [ { "id": "gon", "name": "Time do Gon", "kind": "time", "memberIds": ["gon-freecss"], "specifiedSlots": { "count": 99, "moment": "…", "chapter": 183 }, "cards": [ { "id": "1035", "relation": "usou", "evidence": "…", "chapter": 160 } ] } ] }
```

**Conceitos:** fonte de dados em JSON, normalização, tipos de dado (string × number).
**Aceite:** o JSON gerado tem 165 cartas (ou o total do CSV), e o script imprime um resumo por categoria e avisa sobre linhas inválidas.

---

### Etapa 2 — Domínio: funções puras (sem React)

Em `src/domain/cards.js`:

- `normalizeCard(raw)`: devolve um objeto congelado (`Object.freeze`) com `searchName` (minúsculo, sem acento nem símbolo), `rankOrder` (SS = 10 … H = 1), `categoryInfo` (label e cor) e `image`.
- `searchCards(cards, query)`: se a busca for numérica (`"25"`, `"#025"`, `"1001"`, `"-1"`), compara o número ignorando zeros à esquerda e mantendo o sinal. Se não for, procura o nome sem acento.
- `filterCards(cards, { query, category, rank })`.
- `sortCards(cards, { field, direction })`, com `Intl.Collator('pt-BR')` para nomes e desempate pelo número.
- `getRarityPosition(card, cards)`: posição da carta entre as mais raras (menor limite = mais rara).
- `getTeamCardIds(team, players)`: cartas do time = cartas do grupo + cartas de cada integrante (sem repetir). O `filterCards` ganha a opção `teamId`.

Em `src/domain/images.js`:

```js
const files = import.meta.glob('../assets/cards/*.{webp,png,jpg}', { eager: true, import: 'default' });
// monta um Map: "000" -> URL. Carta sem imagem -> null (a interface usa assets/ui/sem-imagem.svg ou mostra só o número)
```

**Conceitos:** separar lógica de interface, funções puras, `import.meta.glob` do Vite (as imagens vêm de uma pasta do código, como o professor pede).
Em `src/domain/catalog.js`: lê os três JSON uma vez, normaliza as cartas e exporta `CARDS`, `CARDS_BY_ID`, `TEAMS`, `PLAYERS` e afins.

**Aceite (`npm test`, com o executor de testes nativo do Node — sem dependência nova):**
- `"bulba"` não encontra nada;
- `"25"` encontra a carta 025;
- `"1001"` encontra a 1001;
- `"-1"` encontra a -001;
- a busca funciona com e sem acento.

---

### Etapa 3 — Esqueleto da interface (sem estilo bonito ainda)

Componentes com props bem definidas, renderizando dados reais:

- `App`, com 3 abas: **Fichário**, **Favoritos** e **Times** (`Tabs` com teclado: setas, Home e End).
- `SearchBar` (input controlado, Esc limpa), `FilterChips` (componente reutilizável) usado por `CategoryFilter` (chips com contagem por categoria) e `RankFilter`, `TeamFilter` ("cartas do time") e `SortControl`.
- Estado com `useState` no `App` ("elevar o estado"); as Views recebem tudo por props. Os hooks customizados vêm na Etapa 4.
- `CardGrid` → `CardSlot` com `map()` e `key` estável (`card.id`).
- `CardDetails`: visualização ampliada com número, nome, categoria, classe, rank, limite e descrição.
- `TeamList` → `TeamCard`: nome do time, integrantes, slots designados (x/100) e quantas cartas o time teve.
- `TeamPage`: resumo, objetivo, desfecho, link para cada integrante e a grade com as cartas do time (com botão "ver no fichário", que aplica o filtro do time).
- `MemberPage`: página resumida do integrante — função, resumo do arco, Nen, desfecho, link de volta para o(s) time(s) e as cartas dele, cada uma com a fonte (capítulo).
- `EmptyState` para "nenhuma carta encontrada", com botão "Limpar busca e filtros".

**Conceitos:** componentização, props, listas, eventos, renderização condicional.
**Aceite:** todos os requisitos funcionais do enunciado funcionam, mesmo ainda feios.

---

### Etapa 4 — Estado e hooks

- `useCardFilters(cards)`: busca, categoria, rank e ordem. O resultado vem de `useMemo` (estado derivado).
- `useFavorites()`: `Set` de ids salvo no `localStorage` (`gi:favorites`), lido com `try/catch` e sincronizado com `useEffect`.
- `useTheme()`: claro ou noturno, respeitando `prefers-color-scheme` (inclusive ao vivo) até a pessoa escolher; só a escolha explícita é salva em `gi:theme`. O tema é estado derivado: `escolha salva ?? tema do sistema`.
- `useFavorites()` também acompanha mudanças feitas em outra aba do navegador (evento `storage`) e descarta ids que não existem no catálogo.
- `useCardDetail()`: guarda `{ ids, index }` da **lista que estava na tela** (fichário filtrado, favoritos, cartas de um time ou de um integrante), para "anterior/próximo" (botões e setas ←/→) seguir a busca e os filtros atuais.
- "Sortear carta" (no fichário) e "Sortear outra" (no detalhe): não repetir a carta que já está aberta. O sorteio é a função pura `pickRandomId(ids, excludeId, random)`.
- `useHashRoute()`: navegação entre páginas sem biblioteca, lendo `window.location.hash` e ouvindo o evento `hashchange` (`#/fichario`, `#/favoritos`, `#/times`, `#/times/gon`, `#/times/gon/killua-zoldyck` — o integrante fica dentro do time para o link "voltar" saber para onde ir). Navegação entre páginas usa links (`<a href>`). O botão Voltar do navegador funciona.

**Conceitos:** `useState`, `useEffect`, `useMemo`, `useCallback`, hooks customizados.
**Aceite:**
- recarregar a página mantém favoritos e tema;
- anterior/próximo respeita o filtro ativo.

---

### Etapa 5 — Design system (tokens)

Em `index.css`, definir variáveis em `:root` e redefini-las em `:root[data-theme="dark"]`. Nenhum componente usa cor fixa, só variáveis.

- **Contextos de superfície:** `mesa` (padrão), `.paper` e `.leather` redefinem as mesmas variáveis semânticas (`--text`, `--muted`, `--surface`, `--accent`, `--border-strong`…). Os componentes só usam as semânticas e ficam legíveis em qualquer superfície (a variável é herdada do pai).

- **Materiais:**
  - couro (`--leather`, `--leather-hi`, `--leather-lo`);
  - papel (`--paper`, `--paper-line`);
  - metal das cantoneiras (`--metal`);
  - plástico dos bolsos (`--sleeve`);
  - dourado da gravação (`--gilt`).
- **Cores de categoria**, usando a cor de borda que a wiki descreve: vermelho para slot designado, azul para feitiço, preto para Game Master e amarelo para as demais.
- **Ranks:** SS e S com acabamento metálico (gradiente), os demais em tons sóbrios. O texto sobre cada cor é escolhido por contraste WCAG (função `inkFor(color)`), considerando todas as paradas do gradiente. Cores que dependem de dados ficam em `src/domain/palette.js`; os testes garantem ≥ 4,5:1.
- **Tipografia** (Google Fonts): **Cinzel** (serifada de gravação) para títulos e gravações, e **Atkinson Hyperlegible** (desenhada para legibilidade) para o texto.
- **Textura:** ruído em SVG inline (`feTurbulence`) como `background-image`, sem baixar imagem.
- **Script anti-flash no `index.html`:** aplica `data-theme` antes de o React carregar.
- **Modo noturno** = "luz de lampião": a mesa escurece, aparece um brilho quente vindo de cima e o papel fica levemente amarelado.

**Aceite:** alternar o tema não deixa nenhum texto com contraste ruim — verificado por uma auditoria automática que mede o contraste de todo texto visível em 10 telas, nos dois temas.

---

### Etapa 6 — O livro (capa, lombada e parte interna)

**Direção visual:** um livro-fichário **original**, inspirado no clima do anime, com couro envelhecido, lombada com nervuras e páginas com bolsos plásticos numerados. As referências em `docs/referencias/` servem para paleta, materiais e proporção. **Atualização (decisão do Davi):** é permitido reproduzir o emblema (alvo concêntrico com setas), o logotipo e a ornamentação do livro do anime, recriados em CSS/SVG a partir das referências — a composição geral da página continua sendo própria.

Peças:

- **`BookCover` (fechado):** capa de couro com cantoneiras metálicas, título gravado em dourado (`text-shadow` interno simulando relevo), costura nas bordas (`outline` tracejado) e uma dica "Clique para abrir (ou Enter)".
- **`BookSpine` (lateral):** lombada em 3D com 4 a 5 nervuras (gradientes), visível quando o livro está fechado e durante a abertura.
- **Abertura 3D:** o contêiner tem `perspective`, o livro usa `transform-style: preserve-3d` e a capa gira `rotateY(-180deg)` com `transform-origin` na lombada.
- **`useBookState`:** máquina de estados `fechado → abrindo → aberto → fechando` como reducer puro (`bookReducer`, usado com `useReducer`); ações fora de hora são ignoradas. A duração das animações vem do JS (`--book-ms`), uma fonte só. Foco gerenciado: ao abrir vai para a aba ativa; ao fechar volta para a capa. Um endereço específico (`#/times/gon`) já abre o livro.
- **Interior com duas páginas** (todas as abas vivem dentro do livro):
  - **Fichário:** índice (busca, filtros, ordem, progresso) | bolsos.
  - **Favoritos:** progresso da coleção | bolsos.
  - **Times:** índice de times | time ou integrante escolhido (a página exibida no celular vem da URL).
  - **Página esquerda (índice):** busca, filtros, ordenação e o progresso da coleção ("x de 100 slots designados" com base nos favoritos, ou o total por categoria).
  - **Página direita (fichário):** grade de bolsos plásticos (`CardSlot`). Cada bolso tem brilho diagonal (`linear-gradient` translúcido) e o número impresso embaixo.
  - **Bolso sem imagem:** mostra só o número, como um slot vazio, o que reforça a ideia de coleção.
  - **Calha no meio:** sombra no vinco entre as páginas (`box-shadow` interno).
- **Paginação (feita):** páginas de 20 bolsos (`usePagination` + `paginate`), virando com `rotateY`; a folha recebe `key={página}` para a animação reiniciar. Mudar busca/filtro/ordem volta para a página 1 (ajuste de estado durante o render). O "anterior/próximo" do detalhe percorre a lista inteira.
- **Responsivo:**
  - até 900px, o livro mostra uma página por vez, com as abas "Índice" e "Fichário" no topo;
  - até 480px, a lombada vira uma faixa lateral fina e a grade passa a ter 2 colunas.
- **`prefers-reduced-motion`:** desliga as animações e a abertura vira só um fade.

**Conceitos:** CSS 3D, máquina de estados no React, `key` para reiniciar animações, layout responsivo.
**Aceite:** abre e fecha com clique e com teclado, funciona em 375px, 768px e 1440px e não tem rolagem horizontal.

---

### Etapa 7 — Carta ampliada (detalhe)

- Modal com `role="dialog"`, `aria-modal` e fundo `inert`. Esc fecha e o foco volta para o bolso de origem.
- A carta aparece grande e **vira** (`rotateY(180deg)`) ao clicar: na frente fica a imagem, no verso ficam os dados.
- **"Atributos" no verso:**
  - `RankBadge` com um medidor de 10 degraus (SS a H);
  - `LimitMeter`: barra em escala logarítmica do limite (1 a 400, com ∞ tratado à parte);
  - "Raridade: 3ª mais rara entre as 165 cartas";
  - categoria e classe (feitiços);
  - descrição.
- Navegação anterior/próximo (setas do teclado também), estrela de favorito e "Ver todas desta categoria".
- Imagem com fallback: se não carregar, mostrar a carta "sem imagem" (`onError`).

**Aceite:** dá para abrir, virar, navegar, favoritar e fechar a carta só com o teclado.

---

### Etapa 8 — Acabamento e acessibilidade

- `aria-live` no contador de resultados ("12 de 165 cartas").
- `aria-pressed` nos chips de filtro e nos botões de alternância.
- `alt` descritivo nas imagens das cartas e `loading="lazy"` nos bolsos.
- `React.memo` no `CardSlot`, para a grade não redesenhar à toa.
- Estados de hover e foco visíveis em todos os controles.

---

### Etapa 9 — README, deploy e créditos

O README precisa ter:

- instalação, execução e endereço (`http://localhost:5173`);
- onde ficam os dados (`src/data`) e as imagens (`src/assets/cards`);
- organização das pastas;
- quais conceitos de React aparecem em cada parte (tabela);
- prints da aplicação;
- **créditos:**
  - dados textuais adaptados da Hunter x Hunter Wiki (Fandom, licença CC BY-SA), com link;
  - Hunter x Hunter e as artes das cartas são de seus autores e detentores de direitos, usados em projeto acadêmico sem fins comerciais.

Fazer o deploy na Vercel e colocar o link no README.

---

### Etapa 10 — Verificação final

Checklist do enunciado, apontando **onde** cada item está implementado:

- [ ] React + Vite
- [ ] Exibe todas as cartas do JSON
- [ ] Busca por nome ou número, atualizando enquanto digita
- [ ] Filtro por categoria (equivalente ao filtro por tipo) e por rank
- [ ] Detalhe com número, nome, categoria e atributos
- [ ] Área de Times (equivalente aos Treinadores), com página de cada time e de cada integrante, e filtro "cartas do time"
- [ ] Tratamento de "nenhuma carta encontrada"
- [ ] Responsivo (desktop, tablet e celular)
- [ ] Identidade visual própria
- [ ] Componentes, props, `useState`, `useEffect`, `map()`, eventos, filtragem e hooks customizados
- [ ] Extras: favoritos, ordenação, sortear e modo noturno
- [ ] `package.json` com todas as dependências, README completo e build sem erros

---

## 4. Regras de trabalho

```text
Você vai me ajudar a construir um projeto de faculdade: um "fichário de Greed Island"
(Hunter x Hunter) em React + Vite, adaptado de uma atividade de Pokédex.

Leia o arquivo PLANO.md na raiz do repositório. Ele é a fonte da verdade do projeto.

Regras de trabalho:
1. Execute UMA etapa por vez, na ordem do plano. Comece pela Etapa 1 (a Etapa 0 eu já fiz).
2. Antes de codar cada etapa, me diga em 3 a 5 linhas o que vai fazer e quais arquivos vai criar.
3. Ao final de cada etapa: rode `npm run build`, confira os critérios de aceite, faça um
   commit com a mensagem "etapa N — <resumo>" e PARE para eu revisar.
4. Depois de cada etapa, me explique em português, de forma objetiva e técnica, o que
   foi feito e quais conceitos de React aparecem ali. Use analogias do dia a dia quando ajudar.
   Eu quero aprender, não só receber o código.
5. Na Etapa 1, leia primeiro o cabeçalho do CSV em scripts/ e adapte o mapeamento às colunas reais.
6. Não invente dados de personagens nem de cartas. Se faltar informação, deixe "TODO"
   e me avise.
7. O visual do livro deve ser ORIGINAL, inspirado no clima descrito no plano. É permitido copiar
   emblemas, logos e ornamentação específica do livro do anime.
8. Sem bibliotecas de UI. Use CSS puro com variáveis, um arquivo por componente em src/css.
   Se alguma dependência for realmente necessária, pergunte antes.
```
