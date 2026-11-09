# Pesquisa — dados dos jogadores

Notas para preencher `specifiedSlots` e `cardIds` em `src/data/players.json`.

- **Fonte:** páginas da [Category:Greed Island Players](https://hunterxhunter.fandom.com/wiki/Category:Greed_Island_Players) na Hunter x Hunter Wiki (Fandom, CC BY-SA), lidas pela API em 09/11/2026.
- **O que já está no JSON:** os 75 jogadores da categoria (sem as páginas de grupo "Bomber", "Kazsule's Alliance" e "Nickes' Alliance") e os grupos de cada um, tirados das subcategorias da wiki.
- **O que falta (TODO):** a wiki **não informa quantas cartas cada jogador tem**. Ela informa a contagem de **equipes**, em **momentos específicos** da história:

| Equipe / grupo | Cartas de slot designado | Momento | Página da wiki → capítulo |
|---|---|---|---|
| Aliança de Nickes | 67 de 100 | quando Gon e Killua entram no jogo | Genthru → cap. 130–131 |
| Aliança de Nickes | 90 tipos (133 cartas no total) | anúncio de Nickes, meses depois | Nickes' Alliance → cap. 142 |
| Bombers (Genthru, Bara, Sub) | 96 | quando a aliança de Kazsule é formada | Kazsule's Alliance (sem capítulo citado) |
| Bombers (Genthru, Bara, Sub) | 97 | pouco depois | Genthru → cap. 160 |
| Equipe de Tsezguerra | até 95 | antes do "Contact" de Kazsule | Barry / Kess / Rodriot → cap. 152 |
| Equipe de Asta | 71 | quando se aliam a Gon e Killua | Asta / Amana / Manheim → cap. 154 |
| Equipe de Yabibi | mais de 50 | reunião da aliança de Kazsule | Montreux → cap. 154 |
| Goreinu | pelo menos 50 | reunião da aliança de Kazsule | Goreinu → cap. 154 |
| Gon, Killua e Biscuit | 50 | depois de um mês de jogo | Gon Freecss (sem capítulo citado) |
| Gon, Killua e Biscuit | 99 | antes do quiz final pela carta 000 | Gon Freecss → cap. 183 |

**Divergência para conferir:** a página de Puhat fala em "81 cartas" quando a aliança de Nickes é ameaçada, mas as outras páginas falam em 90.

## Decisão pendente (Davi)

Como representar esses números no app?

1. **Por equipe:** criar `teams` com `specifiedSlots` e `moment`. A aba Jogadores mostraria as equipes, cada uma com seus membros.
2. **Por jogador:** repetir a contagem da equipe em cada membro, com uma nota do momento.
3. **Só os principais:** manter na aba apenas quem tem número conferido.
